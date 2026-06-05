const { ethers } = require("hardhat");

async function main() {
	const [deployer] = await ethers.getSigners();
	const network = await ethers.provider.getNetwork();

	console.log("Checking deployment status...");
	console.log("Network:", network.chainId);
	console.log("Deployer:", deployer.address);

	const balance = await ethers.provider.getBalance(deployer.address);
	console.log("Balance:", ethers.formatEther(balance), "ETH");

	const nonce = await ethers.provider.getTransactionCount(deployer.address);
	console.log("Nonce (transactions sent):", nonce);

	if (nonce > 0) {
		console.log("\n⚠️  Transactions have been sent from this address.");
		console.log("Check block explorer for details:");
		
		const explorers = {
			"1": "https://etherscan.io",
			"8453": "https://basescan.org",
			"42161": "https://arbiscan.io",
			"11155111": "https://sepolia.etherscan.io"
		};
		
		const explorer = explorers[String(network.chainId)] || "https://etherscan.io";
		console.log(`${explorer}/address/${deployer.address}`);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

