// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SimpleWETHReceiver
 * @dev Simple receiver that accepts WETH flash loans and repays them
 */
contract SimpleWETHReceiver {
	address public immutable router;
	address public immutable weth;
	
	constructor(address _router, address _weth) {
		router = _router;
		weth = _weth;
		// Pre-approve router for unlimited WETH
		IERC20(_weth).approve(_router, type(uint256).max);
	}
	
	/**
	 * @dev Callback for flash loan - just verify we received the funds
	 */
	function executeFlashLoan(
		address token,
		uint256 amount,
		uint256 fee,
		bytes calldata
	) external returns (bool) {
		require(msg.sender == router, "Only router");
		require(token == weth, "Only WETH");
		
		// Verify we received the WETH
		uint256 balance = IERC20(weth).balanceOf(address(this));
		require(balance >= amount + fee, "Insufficient balance");
		
		// Contract already has approval, router will pull repayment
		return true;
	}
	
	// Allow funding this contract with WETH
	function fundWETH(uint256 amount) external {
		IERC20(weth).transferFrom(msg.sender, address(this), amount);
	}
	
	// Emergency withdraw
	function withdraw(address token, address to, uint256 amount) external {
		IERC20(token).transfer(to, amount);
	}
}

