const router = require("express").Router();
const nft = require("./nft");
const analytics = require("./analytics");

router.use(nft);
router.use(analytics);

module.exports = { router };
