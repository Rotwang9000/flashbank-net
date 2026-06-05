// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IL2FlashLoan } from "./IL2FlashLoan.sol";

interface IFlashBankRouter {
	function flashLoan(address token, uint256 amount, bool toNative, bytes calldata data) external;
	function quoteFee(address token, uint256 amount) external view returns (uint256);
}

interface IProofOfFunds {
	function prove(bytes calldata data) external payable returns (bool);
	function proveNoRefund(bytes calldata data) external payable returns (bool);
}

interface IDemoCounter {
	function count() external payable returns (bool);
	function getStats() external view returns (uint256 total, uint256 txCount);
}

/**
 * @title DemoFlashBorrower
 * @notice Demonstrates WETH-backed FlashBank loans routed through the FlashBankRouter.
 *         Users authorize this contract to borrow ETH (unwrapped from WETH) and send the fee upfront.
 */
contract DemoFlashBorrower is IL2FlashLoan {
	address public immutable router;
	address public immutable liquidityToken;
	address public immutable proofSink;
	address public immutable demoCounter;

	event DemoStart(address indexed user, uint256 amount, uint256 expectedFee);
	event DemoReceived(uint256 amount, uint256 fee, uint256 balanceBefore);
	event DemoCounted(uint256 amount, uint256 newTotal);
	event DemoRepaid(uint256 totalRepaid);

	constructor(address routerAddress, address tokenAddress, address proofSinkAddress, address demoCounterAddress) {
		require(routerAddress != address(0), "router required");
		require(tokenAddress != address(0), "token required");
		require(proofSinkAddress != address(0), "proofSink required");
		require(demoCounterAddress != address(0), "demoCounter required");
		router = routerAddress;
		liquidityToken = tokenAddress;
		proofSink = proofSinkAddress;
		demoCounter = demoCounterAddress;
	}

	function runDemo(uint256 amount) external payable returns (bool) {
		require(amount > 0, "amount");
		uint256 fee = IFlashBankRouter(router).quoteFee(liquidityToken, amount);
		require(msg.value >= fee, "fee needed");
		emit DemoStart(msg.sender, amount, fee);

		IFlashBankRouter(router).flashLoan(liquidityToken, amount, true, abi.encode(false, msg.sender));

		uint256 leftover = address(this).balance;
		if (leftover > 0) {
			(bool ok, ) = payable(msg.sender).call{ value: leftover }("");
			require(ok, "refund failed");
		}
		return true;
	}

	function runDemoFail(uint256 amount) external payable returns (bool) {
		require(amount > 0, "amount");
		uint256 fee = IFlashBankRouter(router).quoteFee(liquidityToken, amount);
		require(msg.value >= fee, "fee needed");
		emit DemoStart(msg.sender, amount, fee);

		IFlashBankRouter(router).flashLoan(liquidityToken, amount, true, abi.encode(true, msg.sender));

		uint256 leftover = address(this).balance;
		if (leftover > 0) {
			(bool ok, ) = payable(msg.sender).call{ value: leftover }("");
			require(ok, "refund failed");
		}
		return true;
	}

	function executeFlashLoan(
		uint256 amount,
		uint256 fee,
		bytes calldata data
	) external payable override returns (bool success) {
		require(msg.sender == router, "only router");

		uint256 beforeBal = address(this).balance;
		emit DemoReceived(amount, fee, beforeBal);

		(bool failMode, ) = abi.decode(data, (bool, address));

		// First, pass the funds through the counter to prove we have them
		bool counted = IDemoCounter(demoCounter).count{ value: amount }();
		require(counted, "counter failed");
		(uint256 newTotal, ) = IDemoCounter(demoCounter).getStats();
		emit DemoCounted(amount, newTotal);

		if (failMode) {
			// Attempt to steal: send ETH to proof sink (which keeps it) and DON'T repay router
			bool ok2 = IProofOfFunds(proofSink).proveNoRefund{ value: amount }("");
			require(ok2, "proof keep failed");
			// Don't repay - just return true and let the router's balance check catch the theft
			return true;
		} else {
			// Success path: prove we have the funds, then repay
			bool ok = IProofOfFunds(proofSink).prove{ value: amount }("");
			require(ok, "proof failed");

			uint256 total = amount + fee;
			require(address(this).balance >= total, "insufficient balance");
			(bool repaid, ) = payable(router).call{ value: total }("");
			require(repaid, "repay failed");
			emit DemoRepaid(total);
			return true;
		}
	}

	receive() external payable {}
}
