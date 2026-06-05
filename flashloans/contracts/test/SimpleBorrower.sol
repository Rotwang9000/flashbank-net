// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../IL2FlashLoan.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFlashBankRouter {
	function flashLoan(
		address token,
		uint256 amount,
		bool toNative,
		bytes calldata data
	) external;
}

/**
 * @title SimpleBorrower
 * @dev Simple borrower contract that requests flash loans and repays them
 */
contract SimpleBorrower is IL2FlashLoan {
	address public immutable router;
	address public immutable weth;
	address public owner;
	
	constructor(address _router, address _weth) {
		router = _router;
		weth = _weth;
		owner = msg.sender;
		// Pre-approve router for unlimited WETH
		IERC20(_weth).approve(_router, type(uint256).max);
	}
	
	/**
	 * @dev Request a flash loan (anyone can trigger for testing)
	 */
	function requestFlashLoan(uint256 amount, bool toNative) external {
		IFlashBankRouter(router).flashLoan(weth, amount, toNative, "");
	}
	
	/**
	 * @dev Callback for flash loan - repay the loan + fee
	 */
	function executeFlashLoan(
		uint256 amount,
		uint256 fee,
		bytes calldata
	) external payable override returns (bool) {
		require(msg.sender == router, "Only router");
		
		// We received 'amount' from the router
		// We pre-funded 'fee' before the loan
		// Now we need to send back 'amount + fee' to the router
		
		uint256 balance = IERC20(weth).balanceOf(address(this));
		require(balance >= amount + fee, "Insufficient balance for repayment");
		
		// Send the loan + fee back to the router
		IERC20(weth).transfer(router, amount + fee);
		
		return true;
	}
	
	// Allow funding this contract with WETH
	function fundWETH(uint256 amount) external {
		IERC20(weth).transferFrom(msg.sender, address(this), amount);
	}
	
	// Emergency withdraw
	function withdraw(address token, address to, uint256 amount) external {
		require(msg.sender == owner, "Only owner");
		IERC20(token).transfer(to, amount);
	}
	
	// Receive ETH
	receive() external payable {}
}

