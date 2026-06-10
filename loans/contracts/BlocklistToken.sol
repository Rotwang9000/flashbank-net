// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title BlocklistToken
 * @notice TEST-ONLY mock of a USDC-style blocklisting ERC-20: any transfer TO a blocked address
 *         reverts. Used by the FlashBankP2PLoanV2 suite to prove that a blocked recipient cannot
 *         brick the other party's settlement (the payout queues for pull-withdrawal instead).
 *
 * @dev Never deploy outside tests. Anyone may mint and anyone may block — that is the point of a
 *      worst-case mock.
 */
contract BlocklistToken is ERC20 {
	mapping(address => bool) public blocked;

	constructor() ERC20("Blocklist Token", "BLOCK") {}

	function mint(address to, uint256 amount) external {
		_mint(to, amount);
	}

	function setBlocked(address account, bool isBlocked) external {
		blocked[account] = isBlocked;
	}

	function _beforeTokenTransfer(address, address to, uint256) internal view override {
		require(!blocked[to], "BlocklistToken: recipient blocked");
	}
}
