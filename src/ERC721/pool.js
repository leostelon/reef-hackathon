const { fork } = require("child_process");
const GenericPool = require("generic-pool");
const { NULL_ADDRESS } = require("../constants");
const { Events } = require("../models/event");
const { Log } = require("../models/logs");
const { NFT } = require("../models/nft");
const { Owner } = require("../models/owner");
var socket = require("../utils/socketio").getIO();

const commandProcessorsPool = GenericPool.createPool(
	{
		create: () => {
			const commandProcessor = fork("./src/ERC721/metadata.js");

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
		min: 2, // Depending on your load, set a MINIMUM number of processes that should always be available in the pool
		max: 2, // Depending on your load, set a MAXIMUM number of processes that should always be available in the pool
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

						// Save NFT
						let nft = createNFT(td);
						if (td.from === NULL_ADDRESS) {
							socket.emit("new-nft", nft);
							console.log("NEW NFT MINTED", log.logId);
						} else {
							const nftExist = await NFT.findOne({
								contract_address: nft.contract_address,
								token_id: nft.token_id,
								chain_id: nft.chain_id,
							});
							if (nftExist) {
								nft = nftExist;
							}
							console.log("NFT TRANSFER", log.logId);
						}
						await nft.save();
						await Owner.updateOne(
							{ nft_id: nft._id },
							{
								nft_id: nft._id,
								token_id: nft.token_id,
								contract_address: nft.contract_address,
								chain_id: nft.chain_id,
								address: td.to,
							},
							{ upsert: true }
						);

						// Update log
						await Log.findOneAndUpdate(
							{ _id: log._id },
							{ status: "finished" }
						);

						// Create Event
						await Events.create({
							method: td.input.slice(0, 10),
							input: td.input,
							from: td.from,
							to: td.to,
							nft_id: nft._id,
							contract_address: nft.contract_address,
							token_id: nft.token_id,
							chain_id: td.chainId,
							transaction_hash: log.transactionHash,
							log_id: log._id,
							timestamp: log.timestamp,
						});

						resolve(true);
					} catch (error) {
						console.log({ "pool.js:86": error.message });
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
	});
}

module.exports = { executeCommand };
