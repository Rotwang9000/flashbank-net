// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IL2FlashLoan
 * @dev Interface for contracts that want to receive L2 flash loans
 * @notice Flash loan receivers must implement this interface
 */
interface IL2FlashLoan {
    /**
     * @dev Called by L2FlashPool during flash loan execution
     * @param amount The amount of ETH borrowed
     * @param fee The fee that must be paid (in addition to principal)
     * @param data Arbitrary data passed from the borrower
     * @return success Must return true for the flash loan to succeed
     * 
     * @notice The contract must:
     * 1. Execute the intended strategy with the borrowed ETH
     * 2. Ensure it has amount + fee ETH available for repayment
     * 3. Return true to signal successful execution
     * 
     * If this function returns false or reverts, the entire flash loan reverts
     * and depositors' ETH is immediately returned to them.
     */
    function executeFlashLoan(
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external payable returns (bool success);
}
