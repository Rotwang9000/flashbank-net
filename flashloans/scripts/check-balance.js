const { ethers } = require("hardhat");

async function main() {
	const networkName = (await ethers.provider.getNetwork()).name;
	const chainId = (await ethers.provider.getNetwork()).chainId;
	
	console.log("🔍 Checking balance on", networkName, "(Chain ID:", chainId.toString() + ")");
	console.log("=".repeat(60));

	const [deployer] = await ethers.getSigners();
	const address = await deployer.getAddress();
	const balance = await ethers.provider.getBalance(address);

	console.log("📍 Address:", address);
	console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
	console.log("💰 Balance (wei):", balance.toString());

	// Check if sufficient for deployment
	const minRequired = {
		1: ethers.parseEther("0.5"), // Ethereum mainnet
		42161: ethers.parseEther("0.01"), // Arbitrum
		8453: ethers.parseEther("0.01"), // Base
	};

	const required = minRequired[Number(chainId)] || ethers.parseEther("0.01");
	const hasEnough = balance >= required;

	console.log("\n📊 Deployment Readiness:");
	console.log("   Required (estimate):", ethers.formatEther(required), "ETH");
	console.log("   Status:", hasEnough ? "✅ Sufficient" : "❌ Insufficient");

	if (!hasEnough) {
		console.log("\n⚠️  WARNING: Insufficient balance for deployment!");
		console.log("   Please add at least", ethers.formatEther(required - balance), "more ETH");
	} else {
		console.log("\n✅ Ready to deploy!");
	}

	console.log("=".repeat(60));
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("❌ Error:", error);
		process.exit(1);
	});

