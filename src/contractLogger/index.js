const Web3 = require("web3");
const { Contract } = require("../models/contract");
const NFTJSONInterface = require("../contracts/Spriyo.json");
const { parseChainId } = require("../utils/parseChainId");
var socket = require("../utils/socketio").getIO();

class CaptureContracts {
	_indexing = false;
	_indexingBlock;
	_currentBlock;
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
			this._captureContractLogs();
		}
	}

	_captureContractLogs = async function () {
		try {
			this.indexing = true;
			socket.emit("contract-indexing-block", this._indexingBlock);

			const block = await this._web3.eth.getBlock(this._indexingBlock, true);
			if (!block || !block.transactions) {
				this.indexing = false;
				this._captureContractLogs();
				return;
			}

			let transactions = block.transactions.filter((tx) => !tx.to);
			console.log(transactions.length, this._indexingBlock);

			for await (const tx of transactions) {
				try {
					const transactionReceipt = await this._web3.eth.getTransactionReceipt(
						tx.hash
					);

					// Save Contract
					const contractExist = await Contract.findOne({
						address: transactionReceipt.contractAddress,
					});
					if (!contractExist) {
						const { name, symbol } = await this._getNameAndSymbol(
							transactionReceipt.contractAddress
						);

						const contract = new Contract({
							address: transactionReceipt.contractAddress,
							symbol,
							creator: tx.from,
							transaction_hash: tx.hash,
							name,
							chain_id: parseChainId(this._chain.chainId),
						});
						await contract.save();
					}
				} catch (e) {
					console.log({ Message: e.message });
				}
			}
			this._indexingBlock++;
			this._indexing = false;
			if (this._indexingBlock <= this._currentBlock) {
				this._captureContractLogs();
			}
		} catch (e) {
			console.log({ "Contract Message": e.message });
		}
	};

	_getNameAndSymbol = async function (contract) {
		try {
			const NFTContract = new this._web3.eth.Contract(
				NFTJSONInterface.abi,
				contract
			);

			const symbol = await NFTContract.methods.symbol().call();
			const name = await NFTContract.methods.name().call();

			return { name, symbol };
		} catch (e) {
			return { name: contract, symbol: " " };
		}
	};
}

module.exports = { CaptureContracts };
