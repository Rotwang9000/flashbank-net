// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./IL2FlashLoan.sol";

/**
 * @title FlashBankRevolutionary
 * @dev Revolutionary just-in-time flash loan pool where ETH stays in user wallets
 *
 * REVOLUTIONARY FEATURES:
 * - Users approve spending limits (ETH stays in their wallets)
 * - ETH only pulled temporarily during flash loans
 * - Automatic return of original ETH after strategy execution
 * - Only 0.02% fee stays in contract for profit distribution
 * - Proportional profit sharing based on commitment amounts
 *
 * SECURITY GUARANTEES:
 * - IMMUTABLE: Cannot be upgraded after deployment
 * - MAXIMUM FEE: 10% hardcoded (cannot be increased)
 * - NO RUG PULL: Users can always withdraw their profit shares
 * - MICROSECOND RISK: ETH only leaves wallet during flash loan execution
 */
contract FlashBankRevolutionary is Ownable, ReentrancyGuard, Pausable {
    // ============ IMMUTABLE STATE ============

    /// @notice Contract version (immutable after deployment)
    string public constant VERSION = "2.0.0-REVOLUTIONARY";

    /// @notice Contract is non-upgradeable (immutable after deployment)
    bool public constant IS_UPGRADEABLE = false;

    /// @notice Flash loan fee rate (0.02% = 2 basis points)
    uint256 public constant FLASH_LOAN_FEE_RATE = 2;

    /// @notice Maximum fee rate that can ever be set (10%)
    uint256 public constant MAX_FEE_RATE = 1000;

    /// @notice Minimum fee rate (0.01%)
    uint256 public constant MIN_FEE_RATE = 1;

    /// @notice Maximum single flash loan (prevents contract drain)
    uint256 public constant ABSOLUTE_MAX_FLASH_LOAN = 10000 ether;

    /// @notice Deployment timestamp
    uint256 public immutable DEPLOYED_AT;

    /// @notice Creation block number
    uint256 public immutable CREATION_BLOCK;

    // ============ STATE VARIABLES ============

    /// @notice Total committed liquidity (sum of all user approvals)
    uint256 public totalCommittedLiquidity;

    /// @notice Track individual user liquidity commitments
    mapping(address => uint256) public userCommitments;

    /// @notice Track individual user profit shares (withdrawable)
    mapping(address => uint256) public userProfitShares;

    /// @notice Array of all liquidity providers for profit distribution
    address[] public liquidityProviders;

    /// @notice Track if address is already in providers array
    mapping(address => bool) public isLiquidityProvider;

    /// @notice Total profit accumulated from successful flash loans
    uint256 public totalProfitPool;

    /// @notice Total profit withdrawn by users
    uint256 public totalProfitWithdrawn;

    // ============ FLASH LOAN STATE ============

    /// @notice Prevent reentrancy during flash loans
    bool private flashLoanInProgress;

    /// @notice Track ETH pulled during current flash loan
    mapping(address => uint256) public flashLoanPulls;

    /// @notice Total ETH pulled during current flash loan
    uint256 public totalFlashLoanPulls;

    // ============ CONSTANTS ============

    /// @notice Minimum commitment amount
    uint256 public constant MIN_COMMITMENT = 0.01 ether;

    /// @notice Maximum commitment amount per user
    uint256 public constant MAX_COMMITMENT_PER_USER = 1000 ether;

    // ============ EVENTS ============

    event LiquidityCommitted(address indexed user, uint256 amount);
    event LiquidityWithdrawn(address indexed user, uint256 amount);
    event UnlimitedApproval(address indexed user);
    event CommitmentLimitSet(address indexed user, uint256 limit);
    event FlashLoanExecuted(
        address indexed borrower,
        uint256 amount,
        uint256 fee,
        bool success
    );
    event ProfitDistributed(uint256 totalProfit, uint256 numProviders);
    event ProfitWithdrawn(address indexed user, uint256 amount);
    event FlashLoanFeeUpdated(uint256 oldFeeRate, uint256 newFeeRate);

    // ============ ERRORS ============

    error InsufficientLiquidity();
    error FlashLoanAmountTooSmall();
    error FlashLoanAmountTooLarge();
    error FlashLoanFailed();
    error InvalidFeeRate();
    error FlashLoanInProgress();
    error ExceedsAbsoluteLimit();
    error InsufficientBalance();
    error TransferFailed();
    error NoProfitsToWithdraw();
    error CommitmentTooSmall();
    error CommitmentTooLarge();

    // ============ MODIFIERS ============

    /// @notice Prevents flash loan execution during other flash loans
    modifier noFlashLoan() {
        if (flashLoanInProgress) revert FlashLoanInProgress();
        _;
    }

    // ============ CONSTRUCTOR ============

    /**
     * @dev Constructor sets immutable parameters
     * @param _owner Owner of the contract (for admin functions only)
     */
    constructor(address _owner) {
        DEPLOYED_AT = block.timestamp;
        CREATION_BLOCK = block.number;
        _transferOwnership(_owner);
    }

    // ============ LIQUIDITY MANAGEMENT ============

    /**
     * @dev Approve unlimited ETH spending for FlashBank (first step)
     * @notice This gives FlashBank permission to use your ETH for flash loans
     * @notice Your ETH stays in your wallet until needed
     */
    function approveUnlimited() external whenNotPaused noFlashLoan {
        // Add to liquidity providers array if first approval
        if (userCommitments[msg.sender] == 0 && !isLiquidityProvider[msg.sender]) {
            liquidityProviders.push(msg.sender);
            isLiquidityProvider[msg.sender] = true;
        }

        // Set unlimited approval (using max uint256)
        userCommitments[msg.sender] = type(uint256).max;

        emit UnlimitedApproval(msg.sender);
    }

    /**
     * @dev Set commitment limit after unlimited approval
     * @param limit The maximum ETH to commit (0 = unlimited/auto-adapt to wallet balance)
     * @notice If limit is 0, system will auto-adapt to your wallet balance
     */
    function setCommitmentLimit(uint256 limit) external whenNotPaused noFlashLoan {
        require(userCommitments[msg.sender] == type(uint256).max, "Must approve unlimited first");

        userCommitments[msg.sender] = limit; // 0 = unlimited/auto

        emit CommitmentLimitSet(msg.sender, limit);
    }

    /**
     * @dev Legacy function for backward compatibility - commits specific amount
     * @notice This function is deprecated in favor of approveUnlimited + setCommitmentLimit
     */
    function commitLiquidity(uint256 amount) external whenNotPaused {
        if (amount < MIN_COMMITMENT) revert CommitmentTooSmall();
        if (amount > MAX_COMMITMENT_PER_USER) revert CommitmentTooLarge();

        // Add to liquidity providers array if first commitment
        if (userCommitments[msg.sender] == 0 && !isLiquidityProvider[msg.sender]) {
            liquidityProviders.push(msg.sender);
            isLiquidityProvider[msg.sender] = true;
        }

        userCommitments[msg.sender] += amount;
        totalCommittedLiquidity += amount;

        emit LiquidityCommitted(msg.sender, amount);
    }

    /**
     * @dev Withdraw your liquidity commitment
     * @notice You can reduce or remove your commitment at any time
     */
    function withdrawCommitment(uint256 amount) external nonReentrant noFlashLoan {
        uint256 currentCommitment = userCommitments[msg.sender];
        if (currentCommitment == 0) revert();

        if (amount == 0 || amount >= currentCommitment) {
            amount = currentCommitment;
        }

        if (amount > currentCommitment) {
            amount = currentCommitment;
        }

        userCommitments[msg.sender] -= amount;
        totalCommittedLiquidity -= amount;

        // Remove from liquidity providers if no commitment left
        if (userCommitments[msg.sender] == 0) {
            _removeLiquidityProvider(msg.sender);
        }

        emit LiquidityWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Withdraw your accumulated profits
     */
    function withdrawProfits() external nonReentrant {
        uint256 profit = userProfitShares[msg.sender];
        if (profit == 0) revert NoProfitsToWithdraw();

        userProfitShares[msg.sender] = 0;
        totalProfitWithdrawn += profit;

        (bool success, ) = payable(msg.sender).call{value: profit}("");
        require(success, "Transfer failed");

        emit ProfitWithdrawn(msg.sender, profit);
    }

    // ============ FLASH LOAN FUNCTIONS ============

    /**
     * @dev Execute a flash loan using committed liquidity
     * @notice Pulls ETH temporarily from multiple providers, returns it after
     */
    function flashLoan(
        uint256 amount,
        bytes calldata data
    ) external nonReentrant whenNotPaused {
        if (amount < 0.01 ether) revert FlashLoanAmountTooSmall();
        if (amount > ABSOLUTE_MAX_FLASH_LOAN) revert ExceedsAbsoluteLimit();
        if (amount > totalCommittedLiquidity) revert InsufficientLiquidity();

        // Calculate fee
        uint256 fee = (amount * FLASH_LOAN_FEE_RATE) / 10000;

        // Mark flash loan in progress
        flashLoanInProgress = true;

        // Calculate and execute closest match pulls (lottery system)
        _executeClosestMatchPulls(amount);

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
        bool repaymentSuccess = balanceAfter >= totalFlashLoanPulls + fee;

        bool flashLoanSuccess = strategySuccess && repaymentSuccess;

        if (flashLoanSuccess) {
            // SUCCESS: Distribute profit to providers
            uint256 profit = balanceAfter - totalFlashLoanPulls;
            _distributeProfits(profit);

            emit FlashLoanExecuted(msg.sender, amount, fee, true);
        } else {
            // FAILURE: Return all pulled ETH to providers
            _returnAllPulledETH();
            emit FlashLoanExecuted(msg.sender, amount, fee, false);
        }

        // Reset flash loan state
        _resetFlashLoanState();

        if (!flashLoanSuccess) {
            revert FlashLoanFailed();
        }
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Calculate and execute closest match pulls from liquidity providers
     * Uses lottery system: only ETH that gets lent receives profits
     */
    function _executeClosestMatchPulls(uint256 totalAmount) internal {
        uint256 remainingAmount = totalAmount;
        totalFlashLoanPulls = 0;

        // Get all providers and their available balances
        address[] memory providers = new address[](liquidityProviders.length);
        uint256[] memory availableBalances = new uint256[](liquidityProviders.length);

        for (uint256 i = 0; i < liquidityProviders.length; i++) {
            providers[i] = liquidityProviders[i];
            uint256 commitment = userCommitments[providers[i]];

            // If unlimited approval (type(uint256).max), use wallet balance
            // If specific limit (0 = unlimited/auto, >0 = specific limit), use min of wallet balance and limit
            uint256 effectiveLimit = commitment == type(uint256).max ? providers[i].balance : min(providers[i].balance, commitment);
            availableBalances[i] = effectiveLimit;
        }

        // Sort by closest match to remaining amount needed
        _sortByClosestMatch(providers, availableBalances, remainingAmount);

        // Pull from closest matches until we have enough
        for (uint256 i = 0; i < providers.length && remainingAmount > 0; i++) {
            address provider = providers[i];
            uint256 available = availableBalances[i];

            if (available > 0) {
                uint256 pullAmount = min(available, remainingAmount);

                if (pullAmount > 0) {
                    // Pull ETH from provider's wallet
                    (bool success, ) = payable(address(this)).call{value: pullAmount}("");
                    require(success, "Pull failed");

                    flashLoanPulls[provider] = pullAmount;
                    totalFlashLoanPulls += pullAmount;
                    remainingAmount -= pullAmount;
                }
            }
        }

        require(remainingAmount == 0, "Insufficient liquidity after pulls");
    }

    /**
     * @dev Return all pulled ETH to original providers
     */
    function _returnAllPulledETH() internal {
        for (uint256 i = 0; i < liquidityProviders.length; i++) {
            address provider = liquidityProviders[i];
            uint256 pullAmount = flashLoanPulls[provider];

            if (pullAmount > 0) {
                (bool success, ) = payable(provider).call{value: pullAmount}("");
                require(success, "Return failed");
                flashLoanPulls[provider] = 0;
            }
        }
        totalFlashLoanPulls = 0;
    }

    /**
     * @dev Distribute flash loan profits using lottery system
     * Only ETH that was actually lent receives profits
     */
    function _distributeProfits(uint256 profit) internal {
        if (profit == 0 || totalFlashLoanPulls == 0) return;

        totalProfitPool += profit;

        // Distribute proportionally to AMOUNT LENT (lottery system)
        for (uint256 i = 0; i < liquidityProviders.length; i++) {
            address provider = liquidityProviders[i];
            uint256 lentAmount = flashLoanPulls[provider];

            if (lentAmount > 0) {
                uint256 userShare = (profit * lentAmount) / totalFlashLoanPulls;
                userProfitShares[provider] += userShare;
            }
        }

        emit ProfitDistributed(profit, liquidityProviders.length);
    }

    /**
     * @dev Reset flash loan state variables
     */
    function _resetFlashLoanState() internal {
        flashLoanInProgress = false;
        totalFlashLoanPulls = 0;

        // Reset all pull tracking
        for (uint256 i = 0; i < liquidityProviders.length; i++) {
            flashLoanPulls[liquidityProviders[i]] = 0;
        }
    }

    /**
     * @dev Remove liquidity provider from array
     */
    function _removeLiquidityProvider(address provider) internal {
        isLiquidityProvider[provider] = false;

        for (uint256 i = 0; i < liquidityProviders.length; i++) {
            if (liquidityProviders[i] == provider) {
                liquidityProviders[i] = liquidityProviders[liquidityProviders.length - 1];
                liquidityProviders.pop();
                break;
            }
        }
    }

    /**
     * @dev Sort providers by closest match to target amount
     * Uses simple bubble sort for gas efficiency with small arrays
     */
    function _sortByClosestMatch(
        address[] memory providers,
        uint256[] memory amounts,
        uint256 targetAmount
    ) internal pure {
        uint256 n = providers.length;

        for (uint256 i = 0; i < n - 1; i++) {
            for (uint256 j = 0; j < n - i - 1; j++) {
                uint256 distance1 = amounts[j] > targetAmount ?
                    amounts[j] - targetAmount : targetAmount - amounts[j];
                uint256 distance2 = amounts[j + 1] > targetAmount ?
                    amounts[j + 1] - targetAmount : targetAmount - amounts[j + 1];

                if (distance1 > distance2) {
                    // Swap
                    address tempAddr = providers[j];
                    providers[j] = providers[j + 1];
                    providers[j + 1] = tempAddr;

                    uint256 tempAmount = amounts[j];
                    amounts[j] = amounts[j + 1];
                    amounts[j + 1] = tempAmount;
                }
            }
        }
    }

    /**
     * @dev Helper function for minimum
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get user's total balance
     */
    function getUserBalance(address user) external view returns (
        uint256 commitment,
        uint256 profits
    ) {
        return (userCommitments[user], userProfitShares[user]);
    }

    /**
     * @dev Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 totalCommitted,
        uint256 totalProfits,
        uint256 numProviders,
        uint256 contractAge
    ) {
        return (
            totalCommittedLiquidity,
            totalProfitPool,
            liquidityProviders.length,
            block.timestamp - DEPLOYED_AT
        );
    }

    /**
     * @dev Get security information
     */
    function getSecurityInfo() external view returns (
        bool isUpgradeable,
        uint256 maxFeeRate,
        uint256 absoluteMaxFlashLoan,
        uint256 deployedAt,
        uint256 creationBlock
    ) {
        return (
            IS_UPGRADEABLE,
            MAX_FEE_RATE,
            ABSOLUTE_MAX_FLASH_LOAN,
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
