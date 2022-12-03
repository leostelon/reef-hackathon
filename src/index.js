const fs = require("fs");
const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const { router } = require("./routes");

// Environmental variables(env) config
// If .env file is not found in location,
// no errors or exceptions will be thrown
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "staging") {
	require("dotenv").config({
		path: path.join(__dirname, "../envconfig/.staging.env"),
	});
} else if (process.env.NODE_ENV === "production") {
	require("dotenv").config({
		path: path.join(__dirname, "../envconfig/.production.env"),
	});
} else if (process.env.NODE_ENV === "development-remote") {
	require("dotenv").config({
		path: path.join(__dirname, "../envconfig/.dev.env"),
	});
} else {
	require("dotenv").config({ path: path.join(__dirname, "../envconfig/.env") });
}

// Database
require("./database/mongoose");

// Bootstrap models
const models = path.join(__dirname, "models");
fs.readdirSync(models)
	.filter((file) => ~file.search(/^[^.].*\.js$/))
	.forEach((file) => require(path.join(models, file)));

// Socket.io
require("./utils/socketio")(http);

const { listener } = require("./listener.js");
listener();

// CORS
app.use(function (req, res, next) {
	var allowedDomains = process.env.ALLOWED_DOMAINS.split(" ");
	var origin = req.headers.origin;
	if (allowedDomains.indexOf(origin) > -1) {
		res.setHeader("Access-Control-Allow-Origin", origin);
	}
	res.header(
		"Access-Control-Allow-Methods",
		" GET, POST, PATCH, PUT, DELETE, OPTIONS"
	);
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	next();
});

// Public Directory
const publicDirectoryPath = path.join(__dirname, "./public");
app.use(express.static(publicDirectoryPath));
app.use(express.json());

// Bootstrap routes
app.use("/api", router);

const port = process.env.PORT || 3003;
http.listen(port, () => {
	console.log("Server running on port " + port);
});
