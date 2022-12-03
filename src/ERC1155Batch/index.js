const Web3 = require("web3");
const { ERC1155_BATCH_TRANSFER_EVENT_HASH } = require("../constants");
var socket = require("../utils/socketio").getIO();
const { Log } = require("../models/logs");
const { executeCommand } = require("./pool");

class ERC1155BatchLogger {
	_indexing = false;
	_logs = [];
	_currentBlock;
	_indexingBlock;
	_chain;
	_web3;

	constructor({ chain, currentBlock = 1 }) {
		this._indexingBlock = currentBlock;
		this._chain = chain;
		this._web3 = new Web3(chain.websocketRpcUrl);
	}

	initiate(currentBlock = 1) {
		this._currentBlock = currentBlock;

		if (this._indexing) return;

		if (this._indexingBlock <= this._currentBlock) {
			this._captureLogs();
		}
	}

	async _captureLogs() {
		try {
			if (this._indexingBlock === 28995846) return;
			this._indexing = true;
			socket.emit("indexing-block", this._indexingBlock);

			// Block Timestamp
			const block = await this._web3.eth.getBlock(this._indexingBlock);

			// Get Past Logs (ASYNC)
			const logs = await this._web3.eth.getPastLogs({
				topics: [ERC1155_BATCH_TRANSFER_EVENT_HASH],
				fromBlock: this._indexingBlock,
				toBlock: this._indexingBlock,
			});

			// Write all logs to database
			this._logs = [];
			for (var i = 0; i < logs.length; i++) {
				let log = logs[i];
				if (log.topics.length === 4) {
					log.logId = `${log.blockNumber}-${log.transactionIndex}-${log.logIndex}`;
					log.timestamp = block.timestamp;
					log = await new Log(log).save();
					this._logs.push(log);
				}
			}

			console.log(
				`Block: ${this._indexingBlock}; Total Transfers: ${this._logs.length}`
			);

			while (this._indexing) {
				const log = this._getLog();
				if (!log) return;

				executeCommand(log);
			}
		} catch (e) {
			this._indexing = false;
			// @TODO Should add Record to detect errors
			this._indexingBlock++;
			if (this._indexingBlock <= this._currentBlock) {
				this._captureLogs();
			}
			console.log({ Message: e.message });
		}
	}

	_getLog = function () {
		try {
			const log = this._logs.pop();
			if (!log) {
				if (this._indexing) {
					this._indexingBlock++;
					this._indexing = false;
					if (this._indexingBlock <= this._currentBlock) {
						this._captureLogs();
					}
				}
				return false;
			}

			return log;
		} catch (error) {
			console.log({ getLog_Function: error.message });
			return false;
		}
	};
}

module.exports = { ERC1155BatchLogger };
