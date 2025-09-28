// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

/**
 * @title L2FlashPoolProxy
 * @dev Transparent upgradeable proxy for L2FlashPool
 * 
 * This proxy allows the L2FlashPool implementation to be upgraded
 * while maintaining the same contract address and preserving state.
 * 
 * SECURITY: Only the proxy admin can upgrade the implementation.
 * Users continue to use the same address regardless of upgrades.
 */
contract L2FlashPoolProxy is TransparentUpgradeableProxy {
    /**
     * @dev Constructor for the proxy
     * @param _implementation Address of the initial implementation contract
     * @param _admin Address of the proxy admin (can upgrade implementation)
     * @param _data Initialization data to call on the implementation
     */
    constructor(
        address _implementation,
        address _admin,
        bytes memory _data
    ) TransparentUpgradeableProxy(_implementation, _admin, _data) {}
}
