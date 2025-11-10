// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IL2FlashLoan } from "./IL2FlashLoan.sol";

interface IFlashBankMinimal {
	function calculateFlashLoanFee(uint256 amount) external view returns (uint256);
	function flashLoan(uint256 amount, bytes calldata data) external;
}

interface IProofOfFunds {
	function prove(bytes calldata data) external payable returns (bool);
	function proveNoRefund(bytes calldata data) external payable returns (bool);
}

/**
 * @title DemoFlashBorrower
 * @notice Minimal borrower used to demonstrate a FlashBank flash loan end-to-end.
 *         Users call runDemo(amount) sending the exact fee as msg.value. The contract
 *         requests a flash loan from FlashBank, receives the funds, and immediately
 *         repays principal + fee. It emits events for clear proof in the tx receipt.
 */
contract DemoFlashBorrower is IL2FlashLoan {
	address public immutable flashBank;
	address public immutable proofSink;

	event DemoStart(address indexed user, uint256 amount, uint256 expectedFee);
	event DemoReceived(uint256 amount, uint256 fee, uint256 balanceBefore);
	event DemoRepaid(uint256 totalRepaid);

	constructor(address flashBankAddress, address proofSinkAddress) {
		require(flashBankAddress != address(0), "flashBank required");
		require(proofSinkAddress != address(0), "proofSink required");
		flashBank = flashBankAddress;
		proofSink = proofSinkAddress;
	}

	/**
	 * @notice Initiate a demo flash loan (success path). Send msg.value equal to the required fee.
	 */
	function runDemo(uint256 amount) external payable returns (bool) {
		require(amount > 0, "amount");
		uint256 fee = IFlashBankMinimal(flashBank).calculateFlashLoanFee(amount);
		require(msg.value >= fee, "fee needed");
		emit DemoStart(msg.sender, amount, fee);

		// Request the flash loan. FlashBank will callback executeFlashLoan on this contract.
		IFlashBankMinimal(flashBank).flashLoan(amount, abi.encode(false, msg.sender));

		// Refund any leftover ether (e.g. if user overpaid fee)
		uint256 leftover = address(this).balance;
		if (leftover > 0) {
			(bool ok, ) = payable(msg.sender).call{ value: leftover }("");
			require(ok, "refund failed");
		}
		return true;
	}

	/**
	 * @notice Initiate a demo flash loan (fail path). Sends the borrowed ETH to proof sink without refund,
	 *         proving theft attempts cause the flash loan to fail. Any leftover (e.g. fee) is refunded at the end.
	 */
	function runDemoFail(uint256 amount) external payable returns (bool) {
		require(amount > 0, "amount");
		uint256 fee = IFlashBankMinimal(flashBank).calculateFlashLoanFee(amount);
		// Still require fee to ensure the demo mirrors real conditions
		require(msg.value >= fee, "fee needed");
		emit DemoStart(msg.sender, amount, fee);

		IFlashBankMinimal(flashBank).flashLoan(amount, abi.encode(true, msg.sender));

		// Refund any leftover ether (e.g. fee), since repayment won't occur in fail mode
		uint256 leftover = address(this).balance;
		if (leftover > 0) {
			(bool ok, ) = payable(msg.sender).call{ value: leftover }("");
			require(ok, "refund failed");
		}
		return true;
	}

	/**
	 * @inheritdoc IL2FlashLoan
	 */
	function executeFlashLoan(
		uint256 amount,
		uint256 fee,
		bytes calldata data
	) external payable override returns (bool success) {
		// Only accept callback from our FlashBank
		require(msg.sender == flashBank, "only FlashBank");

		uint256 beforeBal = address(this).balance;
		emit DemoReceived(amount, fee, beforeBal);

		(bool failMode, address originalUser) = abi.decode(data, (bool, address));

		if (failMode) {
			// Send borrowed ETH to proof sink w/o refund; demonstrate failure to repay
			bool ok2 = IProofOfFunds(proofSink).proveNoRefund{ value: amount }("");
			require(ok2, "proof keep failed");
			// Do NOT repay; return true to let pool handle failure via balance check
			return true;
		} else {
			// External proof that funds were received, then refund immediately
			bool ok = IProofOfFunds(proofSink).prove{ value: amount }("");
			require(ok, "proof failed");

			// Repay principal + fee back to FlashBank
			(uint256 total) = (amount + fee);
			(bool repaid, ) = payable(flashBank).call{ value: total }("");
			require(repaid, "repay failed");
			emit DemoRepaid(total);
			return true;
		}
	}

	receive() external payable {}
}


