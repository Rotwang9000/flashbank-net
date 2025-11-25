const { ethers } = require("hardhat");

async function main() {
	const provider1Key = process.env.TEST_PRIVATE_KEY_1;
	const provider = ethers.provider;
	const provider1 = new ethers.Wallet(provider1Key, provider);
	
	const WETH_ADDRESS = "0xdd13E55209Fd76AfE204dBda4007C227904f0a81";
	const weth = await ethers.getContractAt("MockWETH", WETH_ADDRESS);
	
	const to = "0x3CD6BbF16599Af7FDe6F4b7C8b6FD6Bea4EDc191";
	const amount = ethers.parseEther("0.02");
	
	console.log("Sending", ethers.formatEther(amount), "WETH from", provider1.address, "to", to);
	const tx = await weth.connect(provider1).transfer(to, amount);
	await tx.wait();
	console.log("✅ Sent!");
	
	const balance = await weth.balanceOf(to);
	console.log("Deployer WETH balance:", ethers.formatEther(balance));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

