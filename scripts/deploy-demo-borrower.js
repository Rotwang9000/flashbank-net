/* eslint-disable no-console */
const { ethers, network } = require("hardhat");

const KNOWN_ROUTER_ADDRESSES = {
	"1": process.env.MAINNET_ROUTER_ADDRESS || "",
	"8453": process.env.BASE_ROUTER_ADDRESS || "",
	"42161": process.env.ARBITRUM_ROUTER_ADDRESS || "",
	"11155111": process.env.SEPOLIA_ROUTER_ADDRESS || ""
};

const WETH_ADDRESSES = {
	"1": process.env.MAINNET_LIQUIDITY_TOKEN || "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
	"8453": process.env.BASE_LIQUIDITY_TOKEN || "0x4200000000000000000000000000000000000006",
	"42161": process.env.ARBITRUM_LIQUIDITY_TOKEN || "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
	"11155111": process.env.SEPOLIA_LIQUIDITY_TOKEN || "0xdd13E55209Fd76AfE204dBda4007C227904f0a81"
};

async function main() {
	const [deployer] = await ethers.getSigners();
	const { chainId, name } = await deployer.provider.getNetwork();
	const chainIdStr = chainId.toString();

	const routerAddress = process.env.FLASHBANK_ROUTER_ADDRESS || KNOWN_ROUTER_ADDRESSES[chainIdStr];
	if (!routerAddress) {
		throw new Error(`FLASHBANK_ROUTER_ADDRESS not provided and no known address for chainId ${chainIdStr}`);
	}

	const tokenAddress = process.env.FLASHBANK_LIQUIDITY_TOKEN || WETH_ADDRESSES[chainIdStr];
	if (!tokenAddress) {
		throw new Error(`FLASHBANK_LIQUIDITY_TOKEN not provided and no default token for ${chainIdStr}`);
	}

	let proofSinkAddress = process.env.PROOF_SINK_ADDRESS || "";
	if (!proofSinkAddress) {
		console.log("Deploying ProofOfFunds sink...");
		const sinkFactory = await ethers.getContractFactory("ProofOfFunds");
		const sink = await sinkFactory.deploy();
		await sink.waitForDeployment();
		proofSinkAddress = await sink.getAddress();
		console.log("ProofOfFunds deployed at:", proofSinkAddress);
	}

	let demoCounterAddress = process.env.DEMO_COUNTER_ADDRESS || "";
	if (!demoCounterAddress) {
		console.log("Deploying DemoCounter...");
		const counterFactory = await ethers.getContractFactory("DemoCounter");
		const counter = await counterFactory.deploy();
		await counter.waitForDeployment();
		demoCounterAddress = await counter.getAddress();
		console.log("DemoCounter deployed at:", demoCounterAddress);
	}

	console.log(`Deploying DemoFlashBorrower to ${name} (chainId=${chainId}) as ${deployer.address}`);
	console.log(`Using Router at ${routerAddress}`);
	console.log(`Liquidity token ${tokenAddress}`);

	const factory = await ethers.getContractFactory("DemoFlashBorrower");
	const contract = await factory.deploy(routerAddress, tokenAddress, proofSinkAddress, demoCounterAddress);
	await contract.waitForDeployment();

	const contractAddress = await contract.getAddress();
	console.log("DemoFlashBorrower deployed at:", contractAddress);
	console.log("Set NEXT_PUBLIC_***_DEMO_BORROWER_ADDRESS accordingly for the website.");
	console.log("You may also set NEXT_PUBLIC_***_PROOF_SINK_ADDRESS to:", proofSinkAddress);
	console.log("You may also set NEXT_PUBLIC_***_DEMO_COUNTER_ADDRESS to:", demoCounterAddress);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});


