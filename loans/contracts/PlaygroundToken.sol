// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title PlaygroundToken
 * @notice A freely-mintable ERC-20 for TEST NETWORKS ONLY. Anyone can call {faucet} to mint
 *         themselves play-money so they can try the flashbank P2P loan flow end-to-end.
 *
 * @dev This token has NO value and NO supply controls by design — it exists purely so a
 *      public testnet playground is self-serve. Never deploy it to a production network.
 */
contract PlaygroundToken is ERC20 {
	uint8 private immutable _decimals;

	/// @notice Amount minted per {faucet} call, scaled to the token's decimals.
	uint256 public immutable faucetAmount;

	event Faucet(address indexed to, uint256 amount);

	constructor(string memory name_, string memory symbol_, uint8 decimals_) ERC20(name_, symbol_) {
		_decimals = decimals_;
		faucetAmount = 10_000 * (10 ** uint256(decimals_));
	}

	function decimals() public view override returns (uint8) {
		return _decimals;
	}

	/// @notice Mint yourself a fixed batch of play-money (test networks only).
	function faucet() external {
		_mint(msg.sender, faucetAmount);
		emit Faucet(msg.sender, faucetAmount);
	}

	/// @notice Mint an arbitrary amount to any address (test networks only).
	function mint(address to, uint256 amount) external {
		_mint(to, amount);
		emit Faucet(to, amount);
	}
}
