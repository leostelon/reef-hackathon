const { NFT } = require("../models/nft");

const router = require("express").Router();

router.get("/nfts", async (req, res) => {
	try {
		let query = req.query.query || "";
		let owner = req.query.owner;
		let chain_id = req.query.chain_id;
		let queryOptions = {
			$or: [
				{ name: { $regex: query, $options: "i" } },
				{ token_id: { $regex: query, $options: "i" } },
				{ contract_address: { $regex: query, $options: "i" } },
				{ metadata_url: { $regex: query, $options: "i" } },
				{ description: { $regex: query, $options: "i" } },
			],
		};
		if (chain_id) {
			queryOptions.chain_id = chain_id;
		}
		let contract = req.query.contract;
		if (contract) {
			contract = req.query.contract.split(",").map((e) => new RegExp(e, "i"));
			queryOptions.contract_address = { $in: contract };
		}
		let ownerQuery = {};
		if (owner) {
			ownerQuery["owners.address"] = new RegExp(owner, "i");
		}

		const assets = await NFT.aggregate([
			{
				$match: {
					...queryOptions,
				},
			},
			{
				$sort: { createdAt: req.query.createdAt === "asc" ? 1 : -1, _id: 1 },
			},
			{
				$lookup: {
					from: "events",
					as: "events",
					let: { asset_id: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$asset_id", "$$asset_id"] },
							},
						},
						{ $sort: { createdAt: -1 } },
						{ $limit: 2 },
					],
				},
			},
			{
				$lookup: {
					from: "owners",
					as: "owners",
					let: { id: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$nft_id", "$$id"] },
							},
						},
						{ $limit: 10 },
					],
				},
			},
			// This match slows down the query
			{
				$match: {
					...ownerQuery,
				},
			},
			{
				$unwind: { path: "$owner", preserveNullAndEmptyArrays: true },
			},
			{ $skip: parseInt(!req.query.skip ? 0 : req.query.skip) },
			{ $limit: parseInt(!req.query.limit ? 10 : req.query.limit) },
		]);

		res.send(assets);
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
});

module.exports = router;
