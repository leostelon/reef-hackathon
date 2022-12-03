const { fork } = require("child_process");
const GenericPool = require("generic-pool");
const { NULL_ADDRESS } = require("../constants");
const { NFT } = require("../models/nft");
const { Owner } = require("../models/owner");
var socket = require("../utils/socketio").getIO();
const Web3 = require("web3");
const { Events } = require("../models/event");
const { Log } = require("../models/logs");
const web3 = new Web3();

const commandProcessorsPool = GenericPool.createPool(
	{
		create: () => {
			const commandProcessor = fork("./src/ERC1155Batch/metadata.js");

			// console.log(`Forked command processor with pid ${commandProcessor.pid}`);

			return commandProcessor;
		},
		destroy: (commandProcessor) => {
			console.log(
				`Destroying command processor with pid ${commandProcessor.pid}`
			);

			commandProcessor.removeAllListeners();
			commandProcessor.kill("SIGKILL");
		},
		validate: (commandProcessor) =>
			commandProcessor.connected && !commandProcessor.killed,
	},
	{
		testOnBorrow: true,
		min: 1, // Depending on your load, set a MINIMUM number of processes that should always be available in the pool
		max: 1, // Depending on your load, set a MAXIMUM number of processes that should always be available in the pool
	}
);

commandProcessorsPool.on("factoryCreateError", (message) =>
	console.log({ POOL: message })
);
commandProcessorsPool.on("factoryDestroyError", (message) =>
	console.log({ POOL: message })
);

async function executeCommand(log) {
	const commandProcessor = await commandProcessorsPool.acquire();

	try {
		const commandProcessorTask = () => {
			return new Promise((resolve, reject) => {
				// https://nodejs.org/api/child_process.html#child_process_event_error
				commandProcessor.on("error", reject);

				commandProcessor.on("message", async (response) => {
					commandProcessor.removeAllListeners();
					try {
						const td = response.transferData;
						const log = response.log;

						// TODO : Do this on index file and attach it to log.tokenTransferDetails
						// Token Transfer Details
						const tokenTransferDetails = web3.eth.abi.decodeParameters(
							[
								{ type: "uint256[]", name: "ids" },
								{ type: "uint256[]", name: "amounts" },
							],
							log.data
						);

						for (var i = 0; i < tokenTransferDetails.ids.length; i++) {
							const token_id = tokenTransferDetails.ids[i];
							const supply = parseInt(tokenTransferDetails.amounts[i]);

							// Save NFT
							let nft;
							const nftExist = await NFT.findOne({
								contract_address: td.contract_address,
								token_id: token_id,
								chain_id: td.chainId,
							});
							if (nftExist) {
								nft = nftExist;
							} else {
								nft = createNFT({
									...td,
									tokenId: token_id,
								});
								socket.emit("new-nft", nft);
								console.log("NEW NFT MINTED", log.logId);
							}
							await nft.save();

							// TODO : Add upsert here
							const owner = await Owner.findOne({
								nft_id: nft._id,
								address: td.to,
							});
							if (owner) {
								td.supply = supply + owner.supply;
								owner.supply = td.supply;
								await owner.save();
							} else {
								await Owner.create({
									nft_id: nft._id,
									token_id: nft.token_id,
									contract_address: nft.contract_address,
									chain_id: nft.chain_id,
									address: td.to,
									supply,
								});
							}

							const oldOwner = await Owner.findOne({
								nft_id: nft._id,
								address: td.from,
							});
							if (oldOwner) {
								oldOwner.supply -= supply;
								await oldOwner.save();
							}

							// Create Event
							await Events.create({
								method: td.input.slice(0, 10),
								input: td.input,
								from: td.from,
								to: td.to,
								nft_id: nft._id,
								contract_address: nft.contract_address,
								token_id,
								chain_id: td.chainId,
								transaction_hash: log.transactionHash,
								log_id: log._id,
								timestamp: log.timestamp,
								supply,
							});

							// Resolve if everything is saved
							if (i === tokenTransferDetails.ids.length - 1) {
								// Update log
								await Log.findOneAndUpdate(
									{ _id: log._id },
									{ status: "finished" }
								);
								resolve(true);
							}
						}
					} catch (error) {
						console.log({ ERC1155BATCH_POOL: error.message });
						resolve(false);
					}
				});

				commandProcessor.send({ log });
			});
		};

		await commandProcessorTask();
	} finally {
		// Make sure that the command processor is returned to the pool no matter what happened
		commandProcessorsPool.release(commandProcessor);
	}
}

function createNFT(transferData) {
	return new NFT({
		name: transferData.metadata.name ?? "",
		description: transferData.metadata.description ?? "",
		image: transferData.image ?? "",
		metadata_url: transferData.nftTokenURI,
		metadata: transferData.metadata,
		contract_address: transferData.contract_address,
		token_id: transferData.tokenId,
		chain_id: transferData.chainId,
		type: "ERC-1155",
	});
}

module.exports = { executeCommand };
