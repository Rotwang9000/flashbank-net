// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ProofOfFunds
 * @notice Emits an on-chain event proving the caller had and used ETH, then refunds it in full.
 */
contract ProofOfFunds {
	event Proof(address indexed from, uint256 amount, bytes data);
	event Withdraw(address indexed to, uint256 amount);

	address public owner;

	modifier onlyOwner() {
		require(msg.sender == owner, "only owner");
		_;
	}

	constructor() {
		owner = msg.sender;
	}

	function prove(bytes calldata data) external payable returns (bool) {
		emit Proof(msg.sender, msg.value, data);
		(bool ok, ) = payable(msg.sender).call{ value: msg.value }("");
		require(ok, "refund failed");
		return true;
	}

	// Records proof but intentionally DOES NOT refund. Useful to demonstrate safety: the
	// flash loan will fail to repay if borrower keeps funds, and the pool reverts the loan.
	function proveNoRefund(bytes calldata data) external payable returns (bool) {
		emit Proof(msg.sender, msg.value, data);
		return true;
	}

	function withdraw(address payable to, uint256 amount) external onlyOwner {
		require(to != address(0), "to");
		(uint256 bal) = address(this).balance;
		require(amount <= bal, "insufficient");
		(bool ok, ) = to.call{ value: amount }("");
		require(ok, "withdraw failed");
		emit Withdraw(to, amount);
	}

	receive() external payable {}
}


