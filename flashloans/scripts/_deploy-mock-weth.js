const { ethers } = require("hardhat");

// Local-only helper: deploys a MockWETH and prints its address as `WETH=0x...` for shell capture.
// Used to validate the v3 deploy + integration scripts against a persistent localhost node.
async function main() {
	const Factory = await ethers.getContractFactory("MockWETH");
	const weth = await Factory.deploy();
	await weth.waitForDeployment();
	console.log("WETH=" + (await weth.getAddress()));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
