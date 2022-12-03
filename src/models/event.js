const mongoose = require("mongoose");
const validator = require("validator");

const EventsSchema = new mongoose.Schema(
	{
		method: {
			type: String,
			required: true,
			trim: true,
		},
		input: {
			type: String,
			required: true,
			trim: true,
		},
		from: {
			type: String,
			required: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid nft owner address");
				}
			},
		},
		to: {
			type: String,
			required: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid nft owner address");
				}
			},
		},
		supply: {
			type: Number,
			required: true,
			trim: true,
			default: 1,
		},
		nft_id: {
			type: mongoose.Types.ObjectId,
			required: true,
			ref: "Nft",
		},
		contract_address: {
			type: String,
			required: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid nft contract address");
				}
			},
		},
		token_id: {
			type: String,
			required: true,
		},
		chain_id: {
			type: String,
			required: true,
			trim: true,
		},
		transaction_hash: {
			type: String,
			required: true,
			trim: true,
		},
		log_id: {
			type: mongoose.Types.ObjectId,
			required: true,
			ref: "Log",
		},
		timestamp: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

const Events = new mongoose.model("Events", EventsSchema);

module.exports = { Events };
