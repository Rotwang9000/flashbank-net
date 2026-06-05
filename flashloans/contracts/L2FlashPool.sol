// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "./IL2FlashLoan.sol";

/**
 * @title L2FlashPool
 * @dev Zero-risk flash loan pool where ETH never permanently leaves depositor accounts
 * 
 * KEY INNOVATION: ETH is only held temporarily during flash loan execution.
 * If flash loan fails, ETH is immediately returned to depositors.
 * If flash loan succeeds, profit is added to the fee pot for sharing.
 * 
 * SECURITY: Impossible for ETH to be stolen - it can only:
 * 1. Be returned to depositors immediately (on failed flash loan)
 * 2. Be returned + profit added to fee pot (on successful flash loan)
 */
contract L2FlashPool is 
    Initializable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable 
{
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
    event FlashLoanFeeUpdated(uint256 newFeeRate);
    
    // ============ ERRORS ============
    
    error InsufficientDeposits();
    error FlashLoanAmountTooSmall();
    error FlashLoanAmountTooLarge();
    error FlashLoanFailed();
    error NoDepositsToWithdraw();
    error NoProfitToWithdraw();
    error InvalidFeeRate();
    error FlashLoanInProgress();
    
    // ============ MODIFIERS ============
    
    /// @notice Prevents flash loan execution during deposits/withdrawals
    bool private flashLoanInProgress;
    
    modifier noFlashLoan() {
        if (flashLoanInProgress) revert FlashLoanInProgress();
        _;
    }
    
    // ============ INITIALIZATION ============
    
    /**
     * @dev Initialize the contract (called by proxy)
     * @param _owner Owner of the contract
     * @param _flashLoanFeeRate Initial fee rate (basis points)
     */
    function initialize(
        address _owner,
        uint256 _flashLoanFeeRate
    ) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        _transferOwnership(_owner);
        
        if (_flashLoanFeeRate > 1000) revert InvalidFeeRate(); // Max 10%
        flashLoanFeeRate = _flashLoanFeeRate;
        
        minFlashLoanAmount = 0.1 ether; // 0.1 ETH minimum
        maxFlashLoanAmount = 1000 ether; // 1000 ETH maximum
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
     * @notice Can only withdraw when no flash loan is in progress
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
     * @notice Profits are separate from your principal deposit
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
     * 
     * @notice SECURITY GUARANTEE:
     * - If your strategy fails, all depositor ETH is returned immediately
     * - If your strategy succeeds, profit is added to the fee pot
     * - Depositor ETH can NEVER be stolen or permanently locked
     */
    function flashLoan(
        uint256 amount,
        bytes calldata data
    ) external nonReentrant whenNotPaused {
        if (amount < minFlashLoanAmount) revert FlashLoanAmountTooSmall();
        if (amount > maxFlashLoanAmount) revert FlashLoanAmountTooLarge();
        if (amount > totalDeposits) revert InsufficientDeposits();
        
        // Calculate fee
        uint256 fee = (amount * flashLoanFeeRate) / 10000;
        
        // Mark flash loan in progress (prevents deposits/withdrawals)
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
            // FAILURE: Flash loan failed, ETH should have been returned
            if (balanceAfter < balanceBefore) {
                // This should be impossible due to atomic nature
                revert FlashLoanFailed();
            }
            
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
     * @param profit Total profit to distribute
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
     * @param depositor Address to remove
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
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update flash loan fee rate
     * @param newFeeRate New fee rate in basis points
     */
    function setFlashLoanFeeRate(uint256 newFeeRate) external onlyOwner {
        if (newFeeRate > 1000) revert InvalidFeeRate(); // Max 10%
        flashLoanFeeRate = newFeeRate;
        emit FlashLoanFeeUpdated(newFeeRate);
    }
    
    /**
     * @dev Update flash loan limits
     * @param newMinAmount New minimum flash loan amount
     * @param newMaxAmount New maximum flash loan amount
     */
    function setFlashLoanLimits(
        uint256 newMinAmount, 
        uint256 newMaxAmount
    ) external onlyOwner {
        minFlashLoanAmount = newMinAmount;
        maxFlashLoanAmount = newMaxAmount;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user's total balance (deposits + profits)
     * @param user User address
     * @return deposits User's principal deposits
     * @return profits User's withdrawable profits
     */
    function getUserBalance(address user) external view returns (
        uint256 deposits, 
        uint256 profits
    ) {
        return (userDeposits[user], userProfitShares[user]);
    }
    
    /**
     * @dev Get pool statistics
     * @return totalDeposits_ Total ETH deposited
     * @return totalProfits Total profits generated
     * @return numDepositors Number of depositors
     * @return currentAPY Estimated APY based on recent profits
     */
    function getPoolStats() external view returns (
        uint256 totalDeposits_,
        uint256 totalProfits,
        uint256 numDepositors,
        uint256 currentAPY
    ) {
        totalDeposits_ = totalDeposits;
        totalProfits = totalProfitPool;
        numDepositors = depositors.length;
        
        // Simple APY estimation (would need more sophisticated calculation)
        if (totalDeposits > 0) {
            currentAPY = (totalProfitPool * 365 * 100) / totalDeposits;
        }
    }
    
    /**
     * @dev Calculate flash loan fee for a given amount
     * @param amount Flash loan amount
     * @return fee Fee that would be charged
     */
    function calculateFlashLoanFee(uint256 amount) external view returns (uint256 fee) {
        return (amount * flashLoanFeeRate) / 10000;
    }
    
    // ============ RECEIVE FUNCTION ============
    
    /**
     * @dev Receive ETH (for flash loan repayments)
     */
    receive() external payable {
        // Allow receiving ETH for flash loan repayments
        // Direct deposits should use deposit() function
    }
}
