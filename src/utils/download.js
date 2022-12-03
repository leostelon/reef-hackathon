const https = require("https");
var http = require("http");
const { v4: uuidv4 } = require("uuid");
const s3 = require("../s3/s3");

/**
 *
 * @param url - the url where we have our file
 * @param fileFullPath - the full file path where we want to store our image
 * @return {Promise<>}
 */

const download = async (url, path) => {
	const filename = uuidv4();
	var url = new URL(url);
	var client = https;
	client = url.protocol == "https:" ? client : http;

	return new Promise((resolve, reject) => {
		client
			.get(url, async (resp) => {
				try {
					// chunk received from the server
					const contentType = resp.headers["content-type"].split("/")[1];
					// console.log("content-length:", res.headers["content-length"]);

					const upload = await s3
						.upload({
							ACL: "public-read",
							Key: `nft/${path}${filename}.${contentType}`,
							Body: resp,
							ContentType: resp.headers["content-type"],
							ContentLength: resp.headers["content-length"],
						})
						.promise();
					resolve(upload.Location);
					return upload;
				} catch (error) {
					resolve("");
				}
			})
			.on("error", (err) => {
				resolve("");
			});
	});
};

module.exports = { download };

// References
// 1. https://stackoverflow.com/a/47255786/11393120
// 2. https://stackoverflow.com/a/65976684/11393120
// Protocol Error (Protocol "http:" not supported. Expected "https:")
// 1. https://stackoverflow.com/questions/34147372/node-js-error-protocol-https-not-supported-expected-http#:~:text=The%20reason%20for%20this%20error,use%20HTTPS%20or%20HTTP%20internally.
