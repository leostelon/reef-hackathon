const Web3 = require("web3");
const { CHAINS_CONFIG } = require("./constants");
var socket = require("./utils/socketio").getIO();
const { CaptureContracts } = require("./contractLogger");
const { ERC721Logger } = require("./ERC721");
const { ERC1155Logger } = require("./ERC1155");
const { ERC1155BatchLogger } = require("./ERC1155Batch");

// GLobal Variables
let currentBlock = 33270620;

const chain = CHAINS_CONFIG[process.env.CHAIN];
const web3 = new Web3(chain.websocketRpcUrl);

// Loggers
const captureContracts = new CaptureContracts({ chain, currentBlock });
const erc721Logger = new ERC721Logger({ chain, currentBlock });
const erc1155Logger = new ERC1155Logger({ chain, currentBlock });
const erc1155BatchLogger = new ERC1155BatchLogger({ chain, currentBlock });

const listener = async function () {
	try {
		web3.eth
			.subscribe("newBlockHeaders", function (error, _) {
				if (error) console.log("error:", error);
			})
			.on("connected", function (subId) {
				console.log("subid:", subId);
			})
			.on("data", async function (blockHeader) {
				socket.emit("contract-new-block", currentBlock);
				currentBlock = blockHeader.number;

				captureContracts.initiate(currentBlock);
				erc721Logger.initiate(currentBlock);
				erc1155Logger.initiate(currentBlock);
				erc1155BatchLogger.initiate(currentBlock);
			})
			.on("error", console.error);
	} catch (e) {
		console.log({ "Listener Message": e.message });
	}
};

module.exports = { listener };
