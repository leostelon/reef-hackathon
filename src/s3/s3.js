var aws = require("aws-sdk");

const s3 = new aws.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	signatureVersion: "v4",
	params: { Bucket: process.env.AWS_BUCKET },
});

module.exports = s3;
