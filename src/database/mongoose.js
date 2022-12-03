const mongoose = require("mongoose");
const url = process.env.MONGODB_URL || "mongodb://localhost:27017/logger";

mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
	console.log("Connected to the Database.");
});
