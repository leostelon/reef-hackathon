const Web3 = require("web3");
const { CHAINS_CONFIG, NULL_ADDRESS, IPFS_REGEX } = require("../constants");
const { download } = require("../utils/download");
const { fetchMetadata } = require("../utils/fetchMetadata");
const { getIpfsUrl } = require("../utils/getIpfsUrl");
const nftJsonInterface = require("../contracts/Spriyo.json");
const { parseChainId } = require("../utils/parseChainId");

const chain = CHAINS_CONFIG[process.env.CHAIN];
const web3 = new Web3(chain.websocketRpcUrl);

process.on("message", async (response) => {
	const data = await mine(response.log);
	process.send(data);
});

const mine = async function (log) {
	let transferData = {};
	try {
		// Get Transaction Details (ASYNC)
		const tx = await web3.eth.getTransaction(log.transactionHash);

		transferData = {
			hash: tx.hash,
			contract_address: web3.utils.toChecksumAddress(log.address),
			from: web3.eth.abi.decodeParameter("address", log.topics[1]),
			to: web3.eth.abi.decodeParameter("address", log.topics[2]),
			tokenId: web3.utils.hexToNumberString(log.topics[3]),
			block: tx.blockNumber,
			blockHash: tx.blockHash,
			input: tx.input,
			chainId: parseChainId(chain.chainId),
			metadata: {},
		};

		const contract = new web3.eth.Contract(
			nftJsonInterface.abi,
			transferData.contract_address
		);

		if (transferData.from === NULL_ADDRESS) {
			// Fetch TOKENURI (ASYNC)
			let tokenURI = await contract.methods
				.tokenURI(transferData.tokenId)
				.call();
			// console.log("METADATA URL: ", tokenURI);

			// Fetch Metadata (ASYNC)
			const response = await fetchMetadata(tokenURI);

			transferData.nftTokenURI = tokenURI;
			transferData.metadata = response ? response.data : {};

			// Download Image (ASYNC)
			let imageUrl = transferData.metadata.image;
			if (imageUrl) {
				const match = imageUrl.match(IPFS_REGEX);
				if (match && match.length > 0) {
					imageUrl = getIpfsUrl(imageUrl);
				}
				const path = `${transferData.contract_address}/${transferData.tokenId}/`;
				transferData.image = await download(imageUrl, path);
				// console.log(`IMAGE URL: ${transferData.image}`);
			}
		} else {
			transferData.nftTokenURI = "";
			transferData.metadata = {};
		}

		return { log, transferData };
	} catch (e) {
		console.log({ "Transfer Message": e.message });
		return { log, transferData };
	}
};
