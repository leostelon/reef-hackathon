const mongoose = require("mongoose");

const RecordSchema = new mongoose.Schema(
	{
		block: {
			type: Number,
			required: true,
			unique: true,
		},
		hash: {
			type: String,
			required: true,
			unique: true,
		},
		status: {
			type: String,
			required: true,
			enum: ["pending", "indexing", "finished"],
			default: "pending",
		},
		timetaken: {
			type: Number, // milliseconds
			required: true,
			default: 0,
		},
	},
	{ timestamps: true }
);

RecordSchema.methods.startIndexing = async function () {
	this.status = "indexing";
	await this.save();
};

RecordSchema.methods.finishIndexing = async function (timetaken) {
	this.timetaken = timetaken;
	this.status = "finished";
	await this.save();
};

const Record = new mongoose.model("Record", RecordSchema);

module.exports = { Record };
