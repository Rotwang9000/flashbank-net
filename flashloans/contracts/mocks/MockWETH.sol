// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockWETH is ERC20 {
	constructor() ERC20("MockWETH", "mWETH") {}

	function deposit() external payable {
		_mint(msg.sender, msg.value);
	}

	function withdraw(uint256 amount) external {
		_burn(msg.sender, amount);
		(bool sent, ) = msg.sender.call{value: amount}("");
		require(sent, "withdraw failed");
	}

	function mint(address to, uint256 amount) external {
		_mint(to, amount);
	}

	function burn(address from, uint256 amount) external {
		_burn(from, amount);
	}

	receive() external payable {
		_mint(msg.sender, msg.value);
	}
}

