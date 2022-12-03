// ELEMENTS
const currentBlock = document.getElementById("current-block");
const indexingBlock = document.getElementById("index-block");
const savedNFTS = document.getElementById("saved-nfts");

const socket = io();
let currentNFTCount = 0;

socket.on("connect", () => {
	console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
	console.log("Socket Disconnected"); // undefined
});

socket.on("new-block", (block) => {
	currentBlock.innerText = block;
});

socket.on("save-nft", (count) => {
	savedNFTS.innerText = count + currentNFTCount;
});

socket.on("indexing-block", (block) => {
	indexingBlock.innerText = block;
});

const getTotalNfts = async () => {
	const response = await fetch("/api/nft");
	const formattedResponse = await response.json();
	currentNFTCount = formattedResponse[0].totalCount[0].count;
	savedNFTS.innerText = currentNFTCount;
};

getTotalNfts();
