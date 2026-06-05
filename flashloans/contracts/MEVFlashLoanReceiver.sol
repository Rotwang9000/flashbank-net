// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IL2FlashLoan.sol";

/**
 * @title MEVFlashLoanReceiver
 * @dev Flash loan receiver for our MEV bot strategies
 * 
 * This contract integrates with our existing MEVBotExecutor to enable
 * zero-fee flash loans from our L2FlashPool instead of Aave.
 */
contract MEVFlashLoanReceiver is IL2FlashLoan, Ownable, ReentrancyGuard {
    
    // ============ STATE VARIABLES ============
    
    /// @notice Address of our L2FlashPool
    address public l2FlashPool;
    
    /// @notice Address of our MEVBotExecutor (the actual strategy executor)
    address public mevBotExecutor;
    
    /// @notice Minimum profit required to execute strategy
    uint256 public minProfitThreshold;
    
    // ============ EVENTS ============
    
    event FlashLoanReceived(uint256 amount, uint256 fee);
    event MEVStrategyExecuted(uint256 profit, bool success);
    event MinProfitThresholdUpdated(uint256 newThreshold);
    
    // ============ ERRORS ============
    
    error UnauthorizedFlashLoan();
    error MEVStrategyFailed();
    error InsufficientProfit();
    error InvalidExecutor();
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _l2FlashPool,
        address _mevBotExecutor,
        uint256 _minProfitThreshold
    ) {
        l2FlashPool = _l2FlashPool;
        mevBotExecutor = _mevBotExecutor;
        minProfitThreshold = _minProfitThreshold;
    }
    
    // ============ FLASH LOAN RECEIVER ============
    
    /**
     * @dev Called by L2FlashPool during flash loan execution
     * @param amount The amount of ETH borrowed
     * @param fee The fee that must be paid
     * @param data Strategy data (liquidation target, manipulation params, etc.)
     * @return success True if strategy was profitable
     */
    function executeFlashLoan(
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external payable override nonReentrant returns (bool success) {
        // Only accept flash loans from our L2FlashPool
        if (msg.sender != l2FlashPool) revert UnauthorizedFlashLoan();
        
        emit FlashLoanReceived(amount, fee);
        
        // Record balance before strategy execution
        uint256 balanceBefore = address(this).balance;
        
        // Execute MEV strategy with the borrowed ETH
        bool strategySuccess = _executeMEVStrategy(amount, data);
        
        if (!strategySuccess) {
            // Strategy failed - return borrowed amount
            _returnFlashLoan(amount);
            emit MEVStrategyExecuted(0, false);
            return false;
        }
        
        // Check if we made enough profit to cover fee + minimum threshold
        uint256 balanceAfter = address(this).balance;
        uint256 totalRequired = amount + fee + minProfitThreshold;
        
        if (balanceAfter < totalRequired) {
            // Not enough profit - return borrowed amount
            _returnFlashLoan(amount);
            emit MEVStrategyExecuted(balanceAfter - balanceBefore, false);
            return false;
        }
        
        // SUCCESS: We have enough profit!
        uint256 profit = balanceAfter - balanceBefore;
        
        // Return principal + fee to L2FlashPool
        _returnFlashLoan(amount + fee);
        
        emit MEVStrategyExecuted(profit, true);
        return true;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Execute the actual MEV strategy
     * @param amount Amount of ETH available for strategy
     * @param data Strategy parameters
     * @return success True if strategy execution succeeded
     */
    function _executeMEVStrategy(
        uint256 amount,
        bytes calldata data
    ) internal returns (bool success) {
        if (mevBotExecutor == address(0)) revert InvalidExecutor();
        
        // Decode strategy data
        (uint8 strategyType, bytes memory params) = abi.decode(data, (uint8, bytes));
        
        try this._callMEVExecutor(strategyType, amount, params) returns (bool result) {
            return result;
        } catch {
            return false;
        }
    }
    
    /**
     * @dev External function to call MEVBotExecutor (enables try/catch)
     * @param strategyType Type of MEV strategy (1=liquidation, 2=price manipulation, etc.)
     * @param amount Amount of ETH to use
     * @param params Strategy-specific parameters
     * @return success True if strategy succeeded
     */
    function _callMEVExecutor(
        uint8 strategyType,
        uint256 amount,
        bytes memory params
    ) external returns (bool success) {
        // Only callable by this contract
        require(msg.sender == address(this), "Internal only");
        
        if (strategyType == 1) {
            // Liquidation strategy
            (address user, address asset) = abi.decode(params, (address, address));
            
            // Call MEVBotExecutor's liquidation function
            (bool callSuccess, ) = mevBotExecutor.call{value: amount}(
                abi.encodeWithSignature(
                    "performAaveLiquidation(address,address,uint256)",
                    user,
                    asset,
                    amount
                )
            );
            
            return callSuccess;
            
        } else if (strategyType == 2) {
            // Price manipulation + liquidation combo
            (address targetAsset, uint256 manipulationAmount, address[] memory victims) = 
                abi.decode(params, (address, uint256, address[]));
            
            // Call MEVBotExecutor's price manipulation function
            (bool callSuccess, ) = mevBotExecutor.call{value: amount}(
                abi.encodeWithSignature(
                    "executeFlashManipulation(address,uint256,address[])",
                    targetAsset,
                    manipulationAmount,
                    victims
                )
            );
            
            return callSuccess;
        }
        
        return false;
    }
    
    /**
     * @dev Return ETH to the flash loan pool
     * @param amount Amount to return
     */
    function _returnFlashLoan(uint256 amount) internal {
        (bool success, ) = payable(l2FlashPool).call{value: amount}("");
        require(success, "Flash loan repayment failed");
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update the MEVBotExecutor address
     * @param newExecutor New executor address
     */
    function setMEVBotExecutor(address newExecutor) external onlyOwner {
        mevBotExecutor = newExecutor;
    }
    
    /**
     * @dev Update minimum profit threshold
     * @param newThreshold New minimum profit in wei
     */
    function setMinProfitThreshold(uint256 newThreshold) external onlyOwner {
        minProfitThreshold = newThreshold;
        emit MinProfitThresholdUpdated(newThreshold);
    }
    
    /**
     * @dev Update L2FlashPool address
     * @param newPool New pool address
     */
    function setL2FlashPool(address newPool) external onlyOwner {
        l2FlashPool = newPool;
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = payable(owner()).call{value: balance}("");
            require(success, "Emergency withdraw failed");
        }
    }
    
    // ============ RECEIVE FUNCTION ============
    
    /**
     * @dev Receive ETH from MEV strategies
     */
    receive() external payable {
        // Accept ETH from MEV strategy profits
    }
}
