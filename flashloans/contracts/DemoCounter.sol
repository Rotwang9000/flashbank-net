// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DemoCounter
 * @notice A simple contract that counts ETH passing through it without keeping the funds.
 *         Used to demonstrate flash loan functionality - proves borrower had access to funds.
 */
contract DemoCounter {
	uint256 public totalCounted;
	uint256 public transactionCount;
	
	event FundsCounted(address indexed sender, uint256 amount, uint256 newTotal, uint256 txCount);
	
	/**
	 * @notice Count funds passing through, then immediately return them
	 * @return success Always returns true
	 */
	function count() external payable returns (bool success) {
		require(msg.value > 0, "No funds to count");
		
		totalCounted += msg.value;
		transactionCount++;
		
		emit FundsCounted(msg.sender, msg.value, totalCounted, transactionCount);
		
		// Immediately return the funds
		(bool sent, ) = payable(msg.sender).call{value: msg.value}("");
		require(sent, "Refund failed");
		
		return true;
	}
	
	/**
	 * @notice Get current counter stats
	 */
	function getStats() external view returns (uint256 total, uint256 txCount) {
		return (totalCounted, transactionCount);
	}
	
	receive() external payable {
		// If someone sends ETH directly, count it but don't refund
		totalCounted += msg.value;
		transactionCount++;
		emit FundsCounted(msg.sender, msg.value, totalCounted, transactionCount);
	}
}

