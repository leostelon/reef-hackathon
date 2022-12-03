const { Events } = require("../models/event");
const { NFT } = require("../models/nft");

const router = require("express").Router();

router.get("/analytics", async (req, res) => {
	try {
		let contract_address = req.query.contract_address;

		const nftsAnalytics = await NFT.aggregate([
			{
				$match: {
					$expr: { $eq: ["$contract_address", contract_address] },
				},
			},
			{
				$lookup: {
					from: "events",
					as: "event",
					let: { id: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$nft_id", "$$id"] },
							},
						},
						{
							$limit: 1,
						},
					],
				},
			},
			{
				$unwind: { path: "$event", preserveNullAndEmptyArrays: true },
			},
			{
				$lookup: {
					from: "events",
					let: {
						etransaction_hash: "$event.transaction_hash",
					},
					as: "events",
					pipeline: [
						{
							$match: {
								$and: [
									{
										$expr: {
											$eq: ["$transaction_hash", "$$etransaction_hash"],
										},
									},
									{
										$expr: {
											$eq: [
												"$contract_address",
												"0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7",
											],
										},
									},
								],
							},
						},
					],
				},
			},
			{
				$unwind: { path: "$events", preserveNullAndEmptyArrays: true },
			},
			{
				$group: {
					_id: "$_id",
					totalWei: { $sum: { $toDouble: "$events.token_id" } },
					count: { $sum: 1 },
					nft: { $first: "$$ROOT" },
				},
			},
			{
				$project: {
					"nft.event": 0,
					"nft.events": 0,
				},
			},
		]);
		// const analytics = await Events.aggregate([
		// 	{
		// 		$match: {
		// 			$expr: {
		// 				$eq: [
		// 					"$contract_address",
		// 					"0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7",
		// 				],
		// 			},
		// 		},
		// 	},
		// 	// {
		// 	// 	$addFields: {
		// 	// 		convertedValue: { $toLong: "$token_id" },
		// 	// 	},
		// 	// },
		// 	{
		// 		$group: {
		// 			_id: "$contract_address",
		// 			totalAmount: { $sum: { $toLong: "$token_id" } },
		// 			count: { $sum: 1 },
		// 		},
		// 	},
		// ]);
		res.send(nftsAnalytics);
	} catch (error) {}
});

module.exports = router;
