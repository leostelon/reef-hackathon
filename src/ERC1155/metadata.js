const Web3 = require("web3");
const { NULL_ADDRESS, IPFS_REGEX, CHAINS_CONFIG } = require("../constants");
const { download } = require("../utils/download");
const { fetchMetadata } = require("../utils/fetchMetadata");
const { getIpfsUrl } = require("../utils/getIpfsUrl");
const { parseChainId } = require("../utils/parseChainId");
const ERC1155JSON = require("../contracts/ERC1155.json");

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

		const tokenDetails = web3.eth.abi.decodeParameters(
			["uint256", "uint256"],
			log.data
		);

		transferData = {
			hash: tx.hash,
			contract_address: web3.utils.toChecksumAddress(log.address),
			from: web3.eth.abi.decodeParameter("address", log.topics[2]),
			to: web3.eth.abi.decodeParameter("address", log.topics[3]),
			tokenId: tokenDetails["0"],
			block: tx.blockNumber,
			blockHash: tx.blockHash,
			input: tx.input,
			chainId: parseChainId(chain.chainId),
			supply: parseInt(tokenDetails["1"]),
			metadata: {},
		};

		const contract = new web3.eth.Contract(
			ERC1155JSON.abi,
			transferData.contract_address
		);

		if (transferData.from === NULL_ADDRESS) {
			// Fetch TOKENURI (ASYNC)
			let tokenURI = await contract.methods.uri(transferData.tokenId).call();
			// console.log("METADATA URL: ", tokenURI);

			// Fetch Metadata (ASYNC)
			const response = await fetchMetadata(tokenURI, transferData.tokenId);

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
		console.log({ ERC1155_METADATA: e.message });
		return { log, transferData };
	}
};
