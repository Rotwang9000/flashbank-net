// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../IL2FlashLoan.sol";

/**
 * @title MockFlashLoanReceiver
 * @dev Mock contract for testing flash loan scenarios
 */
contract MockFlashLoanReceiver is IL2FlashLoan {
    bool public shouldSucceed;
    bool public shouldReturnPayment;
    
    constructor(bool _shouldSucceed, bool _shouldReturnPayment) {
        shouldSucceed = _shouldSucceed;
        shouldReturnPayment = _shouldReturnPayment;
    }
    
    function executeFlashLoan(
        uint256 amount,
        uint256 fee,
        bytes calldata
    ) external payable override returns (bool) {
        if (shouldReturnPayment) {
            // Return the borrowed amount + fee
            (bool success, ) = payable(msg.sender).call{value: amount + fee}("");
            require(success, "Repayment failed");
        }
        
        return shouldSucceed;
    }
    
    receive() external payable {}
    
    // Function to fund this contract for testing
    function fund() external payable {}
}
