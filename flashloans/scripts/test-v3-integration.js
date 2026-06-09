const { ethers } = require("hardhat");

// Live integration check for a deployed FlashBankRouterV3. Set V3_ROUTER_ADDRESS (and optionally
// V3_WETH_ADDRESS / V3_PROOF_SINK / V3_DEMO_COUNTER) and run against the target network. It uses the
// deployer as the sole provider, executes a real native flash loan, proves the on-chain maxFee pin
// (succeeds at the quoted fee, reverts one wei under it) and calls reconcile().

const WETH_ADDRESSES = {
	"1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
	"8453": "0x4200000000000000000000000000000000000006",
	"42161": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
	"11155111": "0xdd13E55209Fd76AfE204dBda4007C227904f0a81",
};

async function main() {
	const [signer] = await ethers.getSigners();
	const chainId = String((await ethers.provider.getNetwork()).chainId);

	const routerAddr = process.env.V3_ROUTER_ADDRESS;
	const wethAddr = process.env.V3_WETH_ADDRESS || WETH_ADDRESSES[chainId];
	if (!routerAddr || !ethers.isAddress(routerAddr)) throw new Error("Set V3_ROUTER_ADDRESS");
	if (!wethAddr || !ethers.isAddress(wethAddr)) throw new Error("Set V3_WETH_ADDRESS");

	console.log("=== FlashBankRouterV3 integration check ===");
	console.log("chainId:", chainId, "| signer:", signer.address);
	console.log("router:", routerAddr, "| WETH:", wethAddr);

	const router = await ethers.getContractAt("FlashBankRouterV3", routerAddr);
	const weth = await ethers.getContractAt("MockWETH", wethAddr); // deposit/withdraw/approve/balanceOf
	console.log("VERSION:", await router.VERSION(), "| admin:", await router.admin());

	const LOAN = ethers.parseEther(process.env.V3_TEST_LOAN || "0.001");
	const fee = await router.quoteFee(wethAddr, LOAN);
	console.log("loan:", ethers.formatEther(LOAN), "WETH | quoted fee:", ethers.formatEther(fee), "WETH");

	// 1) Provider setup: wrap a little WETH and commit it.
	const need = LOAN * 6n;
	const have = await weth.balanceOf(signer.address);
	if (have < need) {
		await (await weth.deposit({ value: need - have })).wait();
		console.log("wrapped", ethers.formatEther(need - have), "ETH -> WETH");
	}
	await (await weth.approve(routerAddr, ethers.MaxUint256)).wait();
	await (await router.setCommitment(wethAddr, LOAN * 5n, 0, false)).wait();
	console.log("committed", ethers.formatEther(LOAN * 5n), "WETH");

	// 2) Native flash loan via DemoFlashBorrower (reuse existing proof/counter when provided).
	const proofSink = await resolveHelper("ProofOfFunds", process.env.V3_PROOF_SINK, signer);
	const demoCounter = await resolveHelper("DemoCounter", process.env.V3_DEMO_COUNTER, signer);
	const Demo = await ethers.getContractFactory("DemoFlashBorrower");
	const demo = await Demo.connect(signer).deploy(routerAddr, wethAddr, proofSink, demoCounter);
	await demo.waitForDeployment();
	const demoAddr = await demo.getAddress();
	console.log("DemoFlashBorrower:", demoAddr);

	const providerBefore = await weth.balanceOf(signer.address);
	const tx = await demo.runDemo(LOAN, { value: fee });
	const rcpt = await tx.wait();
	const executed = rcpt.logs.some((l) => {
		try { return router.interface.parseLog(l)?.name === "FlashLoanExecuted"; } catch { return false; }
	});
	if (!executed) throw new Error("FlashLoanExecuted not emitted");
	const providerAfter = await weth.balanceOf(signer.address);
	console.log("native flash loan OK | provider fee delta:", ethers.formatEther(providerAfter - providerBefore), "WETH");
	console.log("  tx:", explorer(chainId, tx.hash));

	// 3) On-chain maxFee pin (ERC20 path).
	const Mock = await ethers.getContractFactory("MockV3Borrower");
	const mock = await Mock.connect(signer).deploy(routerAddr, wethAddr);
	await mock.waitForDeployment();
	const mockAddr = await mock.getAddress();
	await (await weth.transfer(mockAddr, fee * 4n)).wait(); // fund the borrower's fee budget

	const okTx = await mock.borrowWithMaxFee(LOAN, fee);
	await okTx.wait();
	console.log("maxFee pin (fee == ceiling) OK |", explorer(chainId, okTx.hash));

	let pinned = false;
	try {
		await (await mock.borrowWithMaxFee(LOAN, fee - 1n)).wait();
	} catch (e) {
		pinned = true;
	}
	if (!pinned) throw new Error("maxFee pin did NOT revert below the ceiling");
	console.log("maxFee pin (fee > ceiling) correctly reverted");

	// 4) reconcile.
	const rc = await router.reconcile(wethAddr);
	await rc.wait();
	console.log("reconcile OK |", explorer(chainId, rc.hash));

	console.log("\nAll v3 integration checks passed.");
}

async function resolveHelper(name, addr, signer) {
	if (addr && ethers.isAddress(addr)) return addr;
	const Factory = await ethers.getContractFactory(name);
	const c = await Factory.connect(signer).deploy();
	await c.waitForDeployment();
	return await c.getAddress();
}

function explorer(chainId, hash) {
	const base = ({ "1": "https://etherscan.io", "8453": "https://basescan.org", "42161": "https://arbiscan.io", "11155111": "https://sepolia.etherscan.io" })[chainId];
	return base ? `${base}/tx/${hash}` : hash;
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("\nIntegration check failed:", error.message || error);
		process.exit(1);
	});
