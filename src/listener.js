const Web3 = require("web3");
const { CHAINS_CONFIG } = require("./constants");
var socket = require("./utils/socketio").getIO();
const { CaptureContracts } = require("./contractLogger");
const { ERC721Logger } = require("./ERC721");
const { ERC1155Logger } = require("./ERC1155");
const { ERC1155BatchLogger } = require("./ERC1155Batch");
const { WsProvider } = require("@polkadot/rpc-provider");

// GLobal Variables
let currentBlock = 0;
let indexingBlock = 0;

const chain = CHAINS_CONFIG[process.env.CHAIN];

// Loggers
const captureContracts = new CaptureContracts({ chain, currentBlock });
const erc721Logger = new ERC721Logger({ chain, currentBlock });
const erc1155Logger = new ERC1155Logger({ chain, currentBlock });
const erc1155BatchLogger = new ERC1155BatchLogger({ chain, currentBlock });

const { provider } = setup();

const _provider = new provider({
	provider: new WsProvider(WS_URL),
});

const listener = async function () {
	try {
		while (true) {
			if (indexingBlock >= currentBlock) {
				let newBlock = _provider.getBlock();
				if (newBlock === currentBlock) return;

				currentBlock = newBlock;
				socket.emit("contract-new-block", currentBlock);
				currentBlock = blockHeader.number;

				captureContracts.initiate(currentBlock);
				erc721Logger.initiate(currentBlock);
				erc1155Logger.initiate(currentBlock);
				erc1155BatchLogger.initiate(currentBlock);
			}
			if (this._indexingBlock >= this._currentBlock) {
				await timeout(15000);
			}
		}
	} catch (e) {
		console.log({ "Listener Message": e.message });
	}
};

// Utils
function timeout(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { listener };
