const { Server } = require("socket.io");
var io;

// mysocketio.js
// constructor function - should only be called once and passed the http server
module.exports = function (server) {
	if (!server) {
		throw new Error(
			"Must pass http server instance to mysocketio module constructor"
		);
	}
	if (!io) {
		io = new Server(server, {
			cors: {
				origin: process.env.ALLOWED_DOMAINS.split(" "),
				methods: ["GET"],
			},
		});
	}
	return io;
};

module.exports.getIO = function () {
	if (!io) {
		throw new Error(
			"Must call constructor of mysocketio module before getIO()"
		);
	}
	return io;
};
