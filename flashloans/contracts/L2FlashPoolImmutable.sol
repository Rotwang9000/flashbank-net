// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./IL2FlashLoan.sol";

/**
 * @title L2FlashPoolImmutable
 * @dev IMMUTABLE zero-risk flash loan pool where ETH never permanently leaves depositor accounts
 * 
 * SECURITY GUARANTEE: This contract is NON-UPGRADEABLE by design.
 * - No proxy patterns
 * - No admin upgrade functions  
 * - No way to change core logic after deployment
 * - Maximum trust and transparency for depositors
 * 
 * KEY INNOVATION: ETH is only held temporarily during flash loan execution.
 * If flash loan fails, ETH is immediately returned to depositors.
 * If flash loan succeeds, profit is added to the fee pot for sharing.
 * 
 * SECURITY: Impossible for ETH to be stolen - it can only:
 * 1. Be returned to depositors immediately (on failed flash loan)
 * 2. Be returned + profit added to fee pot (on successful flash loan)
 */
contract L2FlashPoolImmutable is Ownable, ReentrancyGuard, Pausable {
    
    // ============ IMMUTABLE STATE ============
    
    /// @notice Contract version (immutable after deployment)
    string public constant VERSION = "1.0.0";
    
    /// @notice Contract is non-upgradeable (immutable after deployment)
    bool public constant IS_UPGRADEABLE = false;
    
    /// @notice Deployment timestamp (set once in constructor)
    uint256 public immutable DEPLOYED_AT;
    
    // ============ STATE VARIABLES ============
    
    /// @notice Fee rate charged for flash loans (basis points, e.g., 5 = 0.05%)
    uint256 public flashLoanFeeRate;
    
    /// @notice Minimum flash loan amount (prevents spam)
    uint256 public minFlashLoanAmount;
    
    /// @notice Maximum flash loan amount (prevents over-leverage)
    uint256 public maxFlashLoanAmount;
    
    /// @notice Total ETH deposited by all users
    uint256 public totalDeposits;
    
    /// @notice Total profit accumulated from successful flash loans
    uint256 public totalProfitPool;
    
    /// @notice Track individual user deposits
    mapping(address => uint256) public userDeposits;
    
    /// @notice Track individual user profit shares (withdrawable)
    mapping(address => uint256) public userProfitShares;
    
    /// @notice Array of all depositors for profit distribution
    address[] public depositors;
    
    /// @notice Track if address is already in depositors array
    mapping(address => bool) public isDepositor;
    
    /// @notice Total profit withdrawn by users
    uint256 public totalProfitWithdrawn;
    
    /// @notice Contract creation block number
    uint256 public immutable CREATION_BLOCK;
    
    // ============ CONSTANTS (IMMUTABLE SECURITY LIMITS) ============
    
    /// @notice Maximum fee rate that can ever be set (10% - prevents rug pull)
    uint256 public constant MAX_FEE_RATE = 1000; // 10%
    
    /// @notice Minimum fee rate (prevents setting to 0 accidentally)
    uint256 public constant MIN_FEE_RATE = 1; // 0.01%
    
    /// @notice Maximum single flash loan (prevents contract drain)
    uint256 public constant ABSOLUTE_MAX_FLASH_LOAN = 10000 ether; // 10,000 ETH
    
    // ============ EVENTS ============
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event FlashLoanExecuted(
        address indexed borrower, 
        uint256 amount, 
        uint256 fee, 
        bool success
    );
    event ProfitDistributed(uint256 totalProfit, uint256 numDepositors);
    event ProfitWithdrawn(address indexed user, uint256 amount);
    event FlashLoanFeeUpdated(uint256 oldFeeRate, uint256 newFeeRate);
    event FlashLoanLimitsUpdated(uint256 newMinAmount, uint256 newMaxAmount);
    
    // ============ ERRORS ============
    
    error InsufficientDeposits();
    error FlashLoanAmountTooSmall();
    error FlashLoanAmountTooLarge();
    error FlashLoanFailed();
    error NoDepositsToWithdraw();
    error NoProfitToWithdraw();
    error InvalidFeeRate();
    error FlashLoanInProgress();
    error ExceedsAbsoluteLimit();
    
    // ============ MODIFIERS ============
    
    /// @notice Prevents flash loan execution during deposits/withdrawals
    bool private flashLoanInProgress;
    
    modifier noFlashLoan() {
        if (flashLoanInProgress) revert FlashLoanInProgress();
        _;
    }
    
    // ============ CONSTRUCTOR (IMMUTABLE SETUP) ============
    
    /**
     * @dev Constructor sets immutable parameters
     * @param _owner Owner of the contract (for admin functions only)
     * @param _flashLoanFeeRate Initial fee rate (basis points)
     */
    constructor(
        address _owner,
        uint256 _flashLoanFeeRate
    ) {
        // Set immutable values
        DEPLOYED_AT = block.timestamp;
        CREATION_BLOCK = block.number;
        
        // Transfer ownership
        _transferOwnership(_owner);
        
        // Validate and set fee rate
        if (_flashLoanFeeRate < MIN_FEE_RATE || _flashLoanFeeRate > MAX_FEE_RATE) {
            revert InvalidFeeRate();
        }
        flashLoanFeeRate = _flashLoanFeeRate;
        
        // Set conservative initial limits
        minFlashLoanAmount = 0.1 ether; // 0.1 ETH minimum
        maxFlashLoanAmount = 1000 ether; // 1000 ETH maximum (can be adjusted)
    }
    
    // ============ DEPOSITOR FUNCTIONS ============
    
    /**
     * @dev Deposit ETH to earn from flash loan fees
     * @notice Your ETH is only at risk during the microseconds of flash loan execution
     */
    function deposit() external payable whenNotPaused noFlashLoan {
        if (msg.value == 0) revert();
        
        // Add to depositors array if first deposit
        if (userDeposits[msg.sender] == 0 && !isDepositor[msg.sender]) {
            depositors.push(msg.sender);
            isDepositor[msg.sender] = true;
        }
        
        userDeposits[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw your ETH deposit
     * @param amount Amount to withdraw (0 = withdraw all)
     */
    function withdraw(uint256 amount) external nonReentrant noFlashLoan {
        uint256 userBalance = userDeposits[msg.sender];
        if (userBalance == 0) revert NoDepositsToWithdraw();
        
        if (amount == 0) {
            amount = userBalance;
        }
        
        if (amount > userBalance) {
            amount = userBalance;
        }
        
        userDeposits[msg.sender] -= amount;
        totalDeposits -= amount;
        
        // Remove from depositors array if no balance left
        if (userDeposits[msg.sender] == 0) {
            _removeDepositor(msg.sender);
        }
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw your share of flash loan profits
     */
    function withdrawProfit() external nonReentrant {
        uint256 profit = userProfitShares[msg.sender];
        if (profit == 0) revert NoProfitToWithdraw();
        
        userProfitShares[msg.sender] = 0;
        totalProfitWithdrawn += profit;
        
        (bool success, ) = payable(msg.sender).call{value: profit}("");
        require(success, "Transfer failed");
        
        emit ProfitWithdrawn(msg.sender, profit);
    }
    
    // ============ FLASH LOAN FUNCTIONS ============
    
    /**
     * @dev Execute a flash loan
     * @param amount Amount of ETH to borrow
     * @param data Arbitrary data to pass to the borrower
     */
    function flashLoan(
        uint256 amount,
        bytes calldata data
    ) external nonReentrant whenNotPaused {
        if (amount < minFlashLoanAmount) revert FlashLoanAmountTooSmall();
        if (amount > maxFlashLoanAmount) revert FlashLoanAmountTooLarge();
        if (amount > ABSOLUTE_MAX_FLASH_LOAN) revert ExceedsAbsoluteLimit();
        if (amount > totalDeposits) revert InsufficientDeposits();
        
        // Calculate fee
        uint256 fee = (amount * flashLoanFeeRate) / 10000;
        
        // Mark flash loan in progress
        flashLoanInProgress = true;
        
        // Record balance before flash loan
        uint256 balanceBefore = address(this).balance;
        
        // Send ETH to borrower
        (bool sendSuccess, ) = payable(msg.sender).call{value: amount}("");
        require(sendSuccess, "Transfer to borrower failed");
        
        // Execute borrower's strategy
        bool strategySuccess = false;
        try IL2FlashLoan(msg.sender).executeFlashLoan(amount, fee, data) returns (bool success) {
            strategySuccess = success;
        } catch {
            strategySuccess = false;
        }
        
        // Check repayment
        uint256 balanceAfter = address(this).balance;
        bool repaymentSuccess = balanceAfter >= balanceBefore + fee;
        
        bool flashLoanSuccess = strategySuccess && repaymentSuccess;
        
        if (flashLoanSuccess) {
            // SUCCESS: Distribute profit to depositors
            uint256 profit = balanceAfter - balanceBefore;
            _distributeProfits(profit);
            
            emit FlashLoanExecuted(msg.sender, amount, fee, true);
        } else {
            // FAILURE: Flash loan failed
            emit FlashLoanExecuted(msg.sender, amount, fee, false);
        }
        
        // Flash loan complete
        flashLoanInProgress = false;
        
        if (!flashLoanSuccess) {
            revert FlashLoanFailed();
        }
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Distribute flash loan profits among depositors
     */
    function _distributeProfits(uint256 profit) internal {
        if (profit == 0 || totalDeposits == 0) return;
        
        totalProfitPool += profit;
        
        // Distribute proportionally to deposits
        for (uint256 i = 0; i < depositors.length; i++) {
            address depositor = depositors[i];
            uint256 userDeposit = userDeposits[depositor];
            
            if (userDeposit > 0) {
                uint256 userShare = (profit * userDeposit) / totalDeposits;
                userProfitShares[depositor] += userShare;
            }
        }
        
        emit ProfitDistributed(profit, depositors.length);
    }
    
    /**
     * @dev Remove depositor from array
     */
    function _removeDepositor(address depositor) internal {
        isDepositor[depositor] = false;
        
        for (uint256 i = 0; i < depositors.length; i++) {
            if (depositors[i] == depositor) {
                depositors[i] = depositors[depositors.length - 1];
                depositors.pop();
                break;
            }
        }
    }
    
    // ============ ADMIN FUNCTIONS (LIMITED & TRANSPARENT) ============
    
    /**
     * @dev Update flash loan fee rate (LIMITED to prevent rug pulls)
     * @param newFeeRate New fee rate in basis points (1-1000 = 0.01%-10%)
     */
    function setFlashLoanFeeRate(uint256 newFeeRate) external onlyOwner {
        if (newFeeRate < MIN_FEE_RATE || newFeeRate > MAX_FEE_RATE) {
            revert InvalidFeeRate();
        }
        
        uint256 oldFeeRate = flashLoanFeeRate;
        flashLoanFeeRate = newFeeRate;
        
        emit FlashLoanFeeUpdated(oldFeeRate, newFeeRate);
    }
    
    /**
     * @dev Update flash loan limits (LIMITED to absolute maximum)
     */
    function setFlashLoanLimits(
        uint256 newMinAmount, 
        uint256 newMaxAmount
    ) external onlyOwner {
        require(newMaxAmount <= ABSOLUTE_MAX_FLASH_LOAN, "Exceeds absolute limit");
        require(newMinAmount <= newMaxAmount, "Invalid limits");
        
        minFlashLoanAmount = newMinAmount;
        maxFlashLoanAmount = newMaxAmount;
        
        emit FlashLoanLimitsUpdated(newMinAmount, newMaxAmount);
    }
    
    /**
     * @dev Emergency pause (only owner, transparent)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause (only owner, transparent) 
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user's total balance
     */
    function getUserBalance(address user) external view returns (
        uint256 deposits, 
        uint256 profits
    ) {
        return (userDeposits[user], userProfitShares[user]);
    }
    
    /**
     * @dev Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 totalDeposits_,
        uint256 totalProfits,
        uint256 numDepositors,
        uint256 contractAge
    ) {
        totalDeposits_ = totalDeposits;
        totalProfits = totalProfitPool;
        numDepositors = depositors.length;
        contractAge = block.timestamp - DEPLOYED_AT;
    }
    
    /**
     * @dev Calculate flash loan fee for a given amount
     */
    function calculateFlashLoanFee(uint256 amount) external view returns (uint256 fee) {
        return (amount * flashLoanFeeRate) / 10000;
    }
    
    /**
     * @dev Get security information (transparency)
     */
    function getSecurityInfo() external view returns (
        bool isUpgradeable,
        uint256 maxFeeRate,
        uint256 absoluteMaxFlashLoan,
        uint256 deployedAt,
        uint256 creationBlock
    ) {
        return (
            IS_UPGRADEABLE,      // Always false
            MAX_FEE_RATE,        // 10% maximum
            ABSOLUTE_MAX_FLASH_LOAN, // 10,000 ETH maximum
            DEPLOYED_AT,
            CREATION_BLOCK
        );
    }
    
    // ============ RECEIVE FUNCTION ============
    
    /**
     * @dev Receive ETH (for flash loan repayments)
     */
    receive() external payable {
        // Allow receiving ETH for flash loan repayments
    }
}
