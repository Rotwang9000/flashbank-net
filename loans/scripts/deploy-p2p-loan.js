const { ethers } = require("hardhat");

// Optional protocol/listing fee. Defaults to 0 bps so loans are commission-free unless an
// offer explicitly opts in (`listed`) AND a non-zero rate is configured here. Hard-capped
// on-chain at MAX_PROTOCOL_FEE_BPS (100 = 1%).
const DEFAULT_PROTOCOL_FEE_BPS = Number(process.env.P2P_PROTOCOL_FEE_BPS || "0");

async function main() {
	const [deployer] = await ethers.getSigners();
	const network = await ethers.provider.getNetwork();

	console.log("Deploying FlashBankP2PLoan with account:", deployer.address);
	console.log("Network chainId:", network.chainId);

	const recipientEnv = process.env.P2P_PROTOCOL_FEE_RECIPIENT;
	const feeRecipient = ethers.isAddress(recipientEnv) ? recipientEnv : deployer.address;
	const feeBps = DEFAULT_PROTOCOL_FEE_BPS;

	if (feeBps < 0 || feeBps > 100) {
		console.error("Error: P2P_PROTOCOL_FEE_BPS must be between 0 and 100 (0%-1%).");
		process.exit(1);
	}

	console.log("Protocol/listing fee recipient:", feeRecipient);
	console.log(`Protocol/listing fee: ${feeBps} bps (${feeBps / 100}% of principal, only on listed offers)`);

	// Optional explicit EIP-1559 fee overrides (gwei). A wallet must be able to *hold* gasLimit ×
	// maxFeePerGas, so on a thin mainnet balance in a low-base-fee window the default (which doubles
	// base and adds a ~1.5 gwei tip) can price us out. Pin them low instead.
	const feeOverrides = {};
	if (process.env.MAX_FEE_GWEI) feeOverrides.maxFeePerGas = ethers.parseUnits(process.env.MAX_FEE_GWEI, "gwei");
	if (process.env.PRIORITY_FEE_GWEI) feeOverrides.maxPriorityFeePerGas = ethers.parseUnits(process.env.PRIORITY_FEE_GWEI, "gwei");
	if (Object.keys(feeOverrides).length > 0) {
		console.log("Fee overrides (wei):", JSON.stringify(Object.fromEntries(Object.entries(feeOverrides).map(([k, v]) => [k, v.toString()]))));
	}

	const P2P = await ethers.getContractFactory("FlashBankP2PLoan");
	const p2p = await P2P.deploy(feeRecipient, feeBps, feeOverrides);
	await p2p.waitForDeployment();

	const address = await p2p.getAddress();
	console.log("FlashBankP2PLoan deployed to:", address);
	console.log("Verified recipient:", await p2p.protocolFeeRecipient());
	console.log("Verified fee bps:", (await p2p.protocolFeeBps()).toString());
	console.log("");
	console.log("Set the website env var for this chain, e.g.:");
	console.log(`  NEXT_PUBLIC_${chainEnvName(network.chainId)}_P2P_LOAN_ADDRESS=${address}`);
}

function chainEnvName(chainId) {
	const names = {
		"1": "ETHEREUM",
		"8453": "BASE",
		"42161": "ARBITRUM",
		"11155111": "SEPOLIA",
	};
	return names[String(chainId)] || `CHAIN_${chainId}`;
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
