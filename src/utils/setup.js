const {
	TestAccountSigningKey,
	Provider,
	Signer,
} = require("@reef-defi/evm-provider");
const { WsProvider, Keyring } = require("@polkadot/api");
const { createTestPairs } = require("@polkadot/keyring/testingPairs");

const WS_URL = process.env.WS_URL || "ws://127.0.0.1:9944";
const seed = process.env.SEED;

const setup = async () => {
	const provider = new Provider({
		provider: new WsProvider(WS_URL),
	});

	await provider.api.isReady;

	let pair;
	if (seed) {
		const keyring = new Keyring({ type: "sr25519" });
		pair = keyring.addFromUri(seed);
	} else {
		const testPairs = createTestPairs();
		pair = testPairs.alice;
	}

	const signingKey = new TestAccountSigningKey(provider.api.registry);
	signingKey.addKeyringPair(pair);

	const wallet = new Signer(provider, pair.address, signingKey);

	// Claim default account
	if (!(await wallet.isClaimed())) {
		console.log(
			"No claimed EVM account found -> claimed default EVM account: ",
			await wallet.getAddress()
		);
		await wallet.claimDefaultAccount();
	}

	return {
		wallet,
		provider,
	};
};

module.export = { setup };
