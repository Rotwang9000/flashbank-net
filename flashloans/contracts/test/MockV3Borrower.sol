// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../IL2FlashLoan.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IRouterV3 {
	function flashLoan(address token, uint256 amount, bool toNative, bytes calldata data) external;
	function flashLoan(address token, uint256 amount, bool toNative, bytes calldata data, uint256 maxFee) external;
}

/**
 * @title MockV3Borrower
 * @dev Test-only ERC20-path borrower for FlashBankRouterV3. Exercises the on-chain `maxFee` pin and,
 *      when `reenter` is set, attempts to re-enter `flashLoan` from inside the callback to prove the
 *      ReentrancyGuard blocks it (the nested call reverts, cascading to FlashLoanFailed).
 */
contract MockV3Borrower is IL2FlashLoan {
	address public immutable router;
	address public immutable token;
	bool public reenter;

	constructor(address _router, address _token) {
		router = _router;
		token = _token;
		IERC20(_token).approve(_router, type(uint256).max);
	}

	function setReenter(bool value) external {
		reenter = value;
	}

	/// @notice Borrow with an on-chain fee ceiling; reverts in the router if fee > maxFee.
	function borrowWithMaxFee(uint256 amount, uint256 maxFee) external {
		IRouterV3(router).flashLoan(token, amount, false, "", maxFee);
	}

	/// @notice Borrow via the unpinned (legacy-compatible) entrypoint.
	function borrow(uint256 amount) external {
		IRouterV3(router).flashLoan(token, amount, false, "");
	}

	function executeFlashLoan(
		uint256 amount,
		uint256 fee,
		bytes calldata
	) external payable override returns (bool) {
		require(msg.sender == router, "only router");

		if (reenter) {
			// nonReentrant must reject this; the revert propagates and the loan fails.
			IRouterV3(router).flashLoan(token, amount, false, "");
		}

		IERC20(token).transfer(router, amount + fee);
		return true;
	}

	receive() external payable {}
}
