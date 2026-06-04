// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ReentrantToken
 * @dev Test-only ERC-20 that attempts to re-enter a target contract on every transfer
 *      (via the OZ v4 `_afterTokenTransfer` hook). Used to prove that FlashBankP2PLoan's
 *      reentrancy protection holds when a malicious token sits in the principal/collateral
 *      position. When armed, it bubbles up the inner revert reason so callers can assert on
 *      it (e.g. "ReentrancyGuard: reentrant call").
 */
contract ReentrantToken is ERC20 {
	address public target;
	bytes public payload;
	bool public armed;

	constructor() ERC20("ReentrantToken", "RE") {}

	function mint(address to, uint256 amount) external {
		_mint(to, amount);
	}

	function arm(address _target, bytes calldata _payload) external {
		target = _target;
		payload = _payload;
		armed = true;
	}

	function disarm() external {
		armed = false;
	}

	function _afterTokenTransfer(address, address, uint256) internal override {
		if (!armed || target == address(0)) {
			return;
		}
		(bool ok, bytes memory ret) = target.call(payload);
		if (!ok) {
			// Re-throw the inner revert (so tests can assert the guard's message).
			assembly {
				revert(add(ret, 0x20), mload(ret))
			}
		}
	}
}
