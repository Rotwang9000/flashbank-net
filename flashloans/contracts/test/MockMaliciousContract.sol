// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../IL2FlashLoan.sol";

/**
 * @title MockMaliciousContract
 * @dev Contract used for testing security vulnerabilities
 * This contract attempts various attacks to ensure the L2FlashPool is secure
 */
contract MockMaliciousContract is IL2FlashLoan {
    address public flashPool;
    bool public attackMode;
    
    constructor(address _flashPool) {
        flashPool = _flashPool;
        attackMode = false;
    }
    
    /**
     * @dev Attempt reentrancy attack during flash loan
     */
    function attemptReentrancy(uint256 amount) external {
        attackMode = true;
        
        // Try to call flash loan, which should revert due to reentrancy protection
        (bool success, ) = flashPool.call(
            abi.encodeWithSignature("flashLoan(uint256,bytes)", amount, "0x")
        );
        require(success, "Flash loan should fail due to reentrancy protection");
    }
    
    /**
     * @dev Attempt to steal funds during flash loan callback
     */
    function attemptFundTheft(uint256 amount) external {
        attackMode = true;
        
        (bool success, ) = flashPool.call(
            abi.encodeWithSignature("flashLoan(uint256,bytes)", amount, "0x1234")
        );
        require(!success, "Fund theft attempt should fail");
    }
    
    /**
     * @dev Flash loan callback - attempts various attacks
     */
    function executeFlashLoan(
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external payable override returns (bool) {
        if (!attackMode) {
            // Normal behavior - just repay the loan
            payable(msg.sender).call{value: amount + fee}("");
            return true;
        }
        
        if (data.length > 0 && data[0] == 0x12) {
            // Attempt fund theft - try to call withdraw on behalf of others
            (bool success, ) = flashPool.call(
                abi.encodeWithSignature("withdraw(uint256)", amount)
            );
            // This should fail - we don't have deposits
            return false;
        }
        
        // Attempt reentrancy - try to call deposit during flash loan
        (bool success, ) = flashPool.call{value: 0.1 ether}(
            abi.encodeWithSignature("deposit()")
        );
        
        // This should fail due to reentrancy protection
        // Don't repay the loan to test flash loan failure handling
        return false;
    }
    
    /**
     * @dev Attempt to exploit profit distribution
     */
    function attemptProfitExploit() external payable {
        // Try to deposit and immediately withdraw profits that don't exist
        if (msg.value > 0) {
            (bool success, ) = flashPool.call{value: msg.value}(
                abi.encodeWithSignature("deposit()")
            );
            require(success, "Deposit failed");
        }
        
        // Try to withdraw profits immediately (should fail)
        (bool success, ) = flashPool.call(
            abi.encodeWithSignature("withdrawProfit()")
        );
        require(!success, "Profit withdrawal should fail - no profits exist");
    }
    
    /**
     * @dev Attempt to manipulate fee calculations
     */
    function attemptFeeManipulation() external {
        // Try to call admin functions without permission
        (bool success, ) = flashPool.call(
            abi.encodeWithSignature("setFlashLoanFeeRate(uint256)", 0)
        );
        require(!success, "Fee manipulation should fail - not owner");
        
        // Try to set excessive fees
        (bool success2, ) = flashPool.call(
            abi.encodeWithSignature("setFlashLoanFeeRate(uint256)", 5000) // 50%
        );
        require(!success2, "Excessive fee setting should fail");
    }
    
    /**
     * @dev Attempt overflow/underflow attacks
     */
    function attemptOverflowAttack() external {
        // Try to flash loan maximum uint256 (should fail)
        (bool success, ) = flashPool.call(
            abi.encodeWithSignature("flashLoan(uint256,bytes)", type(uint256).max, "0x")
        );
        require(!success, "Overflow attack should fail");
        
        // Try to deposit 0 ETH (should fail)
        (bool success2, ) = flashPool.call{value: 0}(
            abi.encodeWithSignature("deposit()")
        );
        require(!success2, "Zero deposit should fail");
    }
    
    /**
     * @dev Reset attack mode
     */
    function resetAttackMode() external {
        attackMode = false;
    }
    
    /**
     * @dev Receive ETH
     */
    receive() external payable {}
    
    /**
     * @dev Allow withdrawal of any ETH sent to this contract
     */
    function withdraw() external {
        payable(msg.sender).transfer(address(this).balance);
    }
}
