/* eslint-disable no-console */
const { ethers, network } = require("hardhat");

const KNOWN_FLASHBANK_ADDRESSES = {
	// chainId: address
	"1": process.env.MAINNET_FLASHBANK_ADDRESS || "0x54b9Bc0679f5106AC3682a74518b229409b4eA15",
	"8453": process.env.BASE_FLASHBANK_ADDRESS || "0x779F8D578F279738c17D9f26B33fe46d32b91Eb7",
	"42161": process.env.ARBITRUM_FLASHBANK_ADDRESS || "0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095",
	"11155111": process.env.SEPOLIA_FLASHBANK_ADDRESS || "0xBDcC71d5F73962d017756A04919FBba9d30F0795",
};

async function main() {
	const [deployer] = await ethers.getSigners();
	const { chainId, name } = await deployer.provider.getNetwork();
	const chainIdStr = chainId.toString();

	const flashBankAddress = process.env.FLASHBANK_ADDRESS || KNOWN_FLASHBANK_ADDRESSES[chainIdStr];
	if (!flashBankAddress) {
		throw new Error(`FLASHBANK_ADDRESS not provided and no known address for chainId ${chainIdStr}`);
	}

	let proofSinkAddress = process.env.PROOF_SINK_ADDRESS || "";
	if (!proofSinkAddress) {
		console.log("Deploying ProofOfFunds sink...");
		const sinkFactory = await ethers.getContractFactory("ProofOfFunds");
		const sink = await sinkFactory.deploy();
		await sink.deployed();
		proofSinkAddress = sink.address;
		console.log("ProofOfFunds deployed at:", proofSinkAddress);
	}

	console.log(`Deploying DemoFlashBorrower to ${name} (chainId=${chainId}) as ${deployer.address}`);
	console.log(`Using FlashBank at ${flashBankAddress}`);

	const factory = await ethers.getContractFactory("DemoFlashBorrower");
	const contract = await factory.deploy(flashBankAddress, proofSinkAddress);
	await contract.deployed();

	console.log("DemoFlashBorrower deployed at:", contract.address);
	console.log("Set NEXT_PUBLIC_***_DEMO_BORROWER_ADDRESS accordingly for the website.");
	console.log("You may also set NEXT_PUBLIC_***_PROOF_SINK_ADDRESS to:", proofSinkAddress);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});


