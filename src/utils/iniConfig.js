const fs = require("fs"),
	path = require("path"),
	ini = require("ini");

const writeFile = async function () {
	try {
		// config.timestamps.updatedAt = new Date();
		fs.writeFileSync(
			path.join(__dirname, "../config.ini"),
			ini.stringify(config)
		);
	} catch (error) {
		console.log({ "WRITE FILE": error.message });
	}
};

const config = ini.parse(
	fs.readFileSync(path.join(__dirname, "../config.ini"), "utf-8")
);

module.exports = { iniConfig: { writeFile, config } };
