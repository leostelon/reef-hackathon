const mongoose = require("mongoose");

const NftSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		description: {
			type: String,
		},
		image: {
			type: String,
		},
		metadata_url: {
			type: String,
		},
		metadata: {
			type: Object,
		},
		contract_address: {
			type: String,
			required: true,
		},
		token_id: {
			type: String,
			required: true,
		},
		chain_id: {
			type: String,
			required: true,
			default: "0",
		},
		type: {
			type: String,
			required: true,
			enum: ["ERC-721", "ERC-1155"],
			default: "ERC-721",
		},
	},
	{ timestamps: true }
);

const NFT = new mongoose.model("Nft", NftSchema);

module.exports = { NFT };
