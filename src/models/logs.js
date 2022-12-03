const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
	{
		address: String,
		blockHash: String,
		blockNumber: Number,
		data: String,
		topics: [{ type: String }],
		transactionHash: {
			type: String,
			required: true,
		},
		logIndex: {
			type: Number,
			required: true,
		},
		transactionIndex: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: ["pending", "finished"],
			default: "pending",
		},
		read: {
			type: Number,
			default: 0,
		},
		logId: {
			type: String,
			required: true,
			unique: true,
		},
		timestamp: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

const Log = new mongoose.model("Log", LogSchema);

module.exports = { Log };
