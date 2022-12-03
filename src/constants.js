const Web3 = require("web3");

const SAFETRANSFERFROM_METHODID = "0xb88d4fde";
const ERC721_TRANSFER_EVENT_HASH = Web3.utils.keccak256(
	"Transfer(address,address,uint256)"
);
const ERC1155_TRANSFER_EVENT_HASH = Web3.utils.keccak256(
	"TransferSingle(address,address,address,uint256,uint256)"
);
const ERC1155_BATCH_TRANSFER_EVENT_HASH = Web3.utils.keccak256(
	"TransferBatch(address,address,address,uint256[],uint256[])"
);

const IPFS_REGEX = /^ipfs:\/\//gm;
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

const CHAINS_CONFIG = {
	MUMBAI: {
		chainId: "80001",
		chainName: "Mumbai",
		nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
		websocketRpcUrl:
			"wss://polygon-mumbai.g.alchemy.com/v2/jGTlLP4Sa_TtTr_PAKM2E7tVQ87Y4gHX",
		blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
	},
	REEF: {
		chainId: "13939",
		chainName: "REEF",
		nativeCurrency: { name: "Reef", symbol: "REEF", decimals: 18 },
		websocketRpcUrl: "wss://rpc-testnet.reefscan.com/ws",
		blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
	},
};

module.exports = {
	SAFETRANSFERFROM_METHODID,
	ERC721_TRANSFER_EVENT_HASH,
	ERC1155_TRANSFER_EVENT_HASH,
	ERC1155_BATCH_TRANSFER_EVENT_HASH,
	IPFS_REGEX,
	NULL_ADDRESS,
	CHAINS_CONFIG,
};
