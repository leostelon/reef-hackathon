const Web3 = require("web3");
const web3 = new Web3();

function parseChainId(chain) {
	try {
		if (web3.utils.isHexStrict(chain)) {
			return web3.utils.hexToNumber(chain);
		} else if (typeof chain === "string") {
			return parseInt(chain);
		} else return chain;
	} catch (error) {
		console.log({ "Utils.ParseChainId": error.message });
	}
}

module.exports = { parseChainId };
