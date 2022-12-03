const mongoose = require("mongoose");
const validator = require("validator");
const { utils } = require("web3");

const ContractSchema = new mongoose.Schema(
	{
		address: {
			type: String,
			required: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid nft contract address");
				}
			},
		},
		creator: {
			type: String,
			required: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid nft contract address");
				}
			},
		},
		transaction_hash: { type: String, required: true },
		chain_id: {
			type: Number,
			required: true,
		},
		name: {
			type: String,
			default: "",
		},
		symbol: {
			type: String,
			default: "",
		},
		image: {
			type: String,
		},
		animation_url: {
			type: String,
		},
	},
	{ timestamps: true }
);

// Pre and Post Check
// Checksum conversion
ContractSchema.pre("save", function (next) {
	if (this.isModified("address")) {
		this.address = utils.toChecksumAddress(this.address);
	}
	if (this.isModified("creator")) {
		this.contract_address = utils.toChecksumAddress(this.creator);
	}
	next();
});

const Contract = new mongoose.model("Contract", ContractSchema);

module.exports = { Contract };
