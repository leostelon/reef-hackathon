const { IPFS_REGEX } = require("../constants");

const getIpfsUrl = function (url) {
	try {
		const match = url.match(IPFS_REGEX);
		if (match && match.length > 0) {
			url = url.replace("ipfs://", "https://ipfs.io/ipfs/");
		}
		return url;
	} catch (error) {
		console.log({ "GET IPFS URL": error.message });
		return url;
	}
};

module.exports = { getIpfsUrl };
