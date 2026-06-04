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

	const P2P = await ethers.getContractFactory("FlashBankP2PLoan");
	const p2p = await P2P.deploy(feeRecipient, feeBps);
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
