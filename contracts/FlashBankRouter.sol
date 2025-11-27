// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./IL2FlashLoan.sol";
import "./interfaces/IWETH.sol";

contract FlashBankRouter is Ownable, ReentrancyGuard {
	using SafeERC20 for IERC20;

	uint16 public constant FEE_DENOMINATOR = 10_000;
	uint16 public constant MIN_FEE_BPS = 1;        // 0.01% minimum
	uint16 public constant MAX_FEE_BPS = 100;      // 1% maximum
	uint16 public constant MIN_MAX_BORROW_BPS = 100;   // 1% minimum of pool
	uint16 public constant MAX_MAX_BORROW_BPS = 10_000; // 100% maximum (entire pool)
	uint256 public constant SINGLE_PROVIDER_THRESHOLD = 10 ether; // Prefer single provider for loans under this amount
	uint16 public constant DEFAULT_OWNER_FEE_BPS = 200; // 2% of the fee (0.0004% of loan amount)

	struct TokenConfig {
		bool enabled;
		bool supportsPermit;
		uint16 feeBps;
		uint256 maxFlashLoan;
		address wrapper;
		uint16 maxBorrowBps;  // Max % of pool that can be borrowed in one tx (basis points)
		uint16 ownerFeeBps;   // Owner's cut of the fee (basis points of the fee, not the loan)
	}

	struct ProviderConfig {
		uint256 limit;
		uint256 inUse;
		uint48 expiry;
		bool paused;
		bool registered;
	}

	struct Pull {
		address provider;
		uint256 amount;
	}

	struct LoanContext {
		IERC20 tokenContract;
		Pull[] pulls;
		uint256 fee;
		uint256 tokenBalanceBefore;
		uint256 nativeBalanceBefore;
	}

	mapping(address => TokenConfig) public tokenConfigs;
	mapping(address => address[]) private tokenProviders;
	mapping(address => mapping(address => ProviderConfig)) public providerConfigs;
	mapping(address => uint256) public totalCommitted;
	mapping(address => bool) private configuredTokens;
	mapping(address => uint256) public ownerProfits; // Accumulated owner fees per token
	
	address public admin; // Secondary admin for dual-signature control
	mapping(bytes32 => bool) public pendingChanges; // Hash of proposed change => approved by deployer
	
	error TokenNotConfigured();
	error TokenNotEnabled();
	error InvalidToken();
	error InvalidFee();
	error InvalidAmount();
	error InvalidExpiry();
	error NativeBridgeUnavailable();
	error InsufficientCommittedLiquidity();
	error PermitUnsupported();
	error FlashLoanFailed();
	error CommitmentLocked();
	error ExceedsMaxBorrowLimit();
	error NotAdmin();
	error ChangeNotProposed();

	event TokenConfigUpdated(
		address indexed token,
		bool enabled,
		bool supportsPermit,
		uint16 feeBps,
		uint256 maxFlashLoan,
		address wrapper,
		uint16 maxBorrowBps
	);

	event CommitmentUpdated(
		address indexed token,
		address indexed provider,
		uint256 limit,
		uint48 expiry,
		bool paused
	);

	event FlashLoanExecuted(
		address indexed borrower,
		address indexed token,
		uint256 amount,
		uint256 fee,
		bool toNative
	);
	
	event AdminUpdated(address indexed oldAdmin, address indexed newAdmin);
	event ChangeProposed(bytes32 indexed changeHash, address indexed proposer);
	event ChangeExecuted(bytes32 indexed changeHash, address indexed executor);

	constructor(address _admin) {
		admin = _admin;
		emit AdminUpdated(address(0), _admin);
	}

	modifier onlyOwnerOrAdmin() {
		require(msg.sender == owner() || msg.sender == admin, "Not owner or admin");
		_;
	}

	receive() external payable {}

	/**
	 * @notice Update admin address (requires owner)
	 */
	function setAdmin(address newAdmin) external onlyOwner {
		require(newAdmin != address(0), "Invalid admin");
		address oldAdmin = admin;
		admin = newAdmin;
		emit AdminUpdated(oldAdmin, newAdmin);
	}

	/**
	 * @notice Step 1: Owner proposes a token config change
	 */
	function proposeTokenConfig(
		address token,
		TokenConfig calldata config
	) external onlyOwner {
		if (token == address(0)) revert InvalidToken();
		if (config.feeBps < MIN_FEE_BPS || config.feeBps > MAX_FEE_BPS) revert InvalidFee();
		if (config.maxBorrowBps < MIN_MAX_BORROW_BPS || config.maxBorrowBps > MAX_MAX_BORROW_BPS) revert InvalidAmount();
		if (config.ownerFeeBps > FEE_DENOMINATOR) revert InvalidFee();

		bytes32 changeHash = keccak256(abi.encode(token, config));
		pendingChanges[changeHash] = true;
		
		emit ChangeProposed(changeHash, msg.sender);
	}

	/**
	 * @notice Step 2: Admin approves and executes the change
	 */
	function executeTokenConfig(
		address token,
		TokenConfig calldata config
	) external {
		if (msg.sender != admin) revert NotAdmin();
		
		bytes32 changeHash = keccak256(abi.encode(token, config));
		if (!pendingChanges[changeHash]) revert ChangeNotProposed();
		
		// Validate again (in case admin tries different values)
		if (token == address(0)) revert InvalidToken();
		if (config.feeBps < MIN_FEE_BPS || config.feeBps > MAX_FEE_BPS) revert InvalidFee();
		if (config.maxBorrowBps < MIN_MAX_BORROW_BPS || config.maxBorrowBps > MAX_MAX_BORROW_BPS) revert InvalidAmount();
		if (config.ownerFeeBps > FEE_DENOMINATOR) revert InvalidFee();

		tokenConfigs[token] = TokenConfig({
			enabled: config.enabled,
			supportsPermit: config.supportsPermit,
			feeBps: config.feeBps,
			maxFlashLoan: config.maxFlashLoan,
			wrapper: config.wrapper,
			maxBorrowBps: config.maxBorrowBps,
			ownerFeeBps: config.ownerFeeBps
		});

		configuredTokens[token] = true;
		delete pendingChanges[changeHash];

		emit TokenConfigUpdated(
			token,
			config.enabled,
			config.supportsPermit,
			config.feeBps,
			config.maxFlashLoan,
			config.wrapper,
			config.maxBorrowBps
		);
		
		emit ChangeExecuted(changeHash, msg.sender);
	}

	/**
	 * @notice Step 1: Owner proposes ownership transfer (dual control)
	 */
	function proposeOwnershipTransfer(address newOwner) external onlyOwner {
		require(newOwner != address(0), "invalid owner");
		bytes32 changeHash = keccak256(abi.encode("ownership", newOwner));
		pendingChanges[changeHash] = true;
		emit ChangeProposed(changeHash, msg.sender);
	}

	/**
	 * @notice Step 2: Admin executes ownership transfer
	 */
	function executeOwnershipTransfer(address newOwner) external {
		if (msg.sender != admin) revert NotAdmin();
		require(newOwner != address(0), "invalid owner");

		bytes32 changeHash = keccak256(abi.encode("ownership", newOwner));
		if (!pendingChanges[changeHash]) revert ChangeNotProposed();

		delete pendingChanges[changeHash];
		_transferOwnership(newOwner);
		emit ChangeExecuted(changeHash, msg.sender);
	}

	function transferOwnership(address) public view override onlyOwner {
		revert("Use proposeOwnershipTransfer");
	}

	function renounceOwnership() public view override onlyOwner {
		revert("Ownership cannot be renounced");
	}

	/**
	 * @notice Emergency: Set token config with single signature (owner or admin)
	 * @dev Use for initial setup or emergencies only
	 */
	function setTokenConfig(
		address token,
		TokenConfig calldata config
	) external onlyOwnerOrAdmin {
		if (token == address(0)) revert InvalidToken();
		if (config.feeBps < MIN_FEE_BPS || config.feeBps > MAX_FEE_BPS) revert InvalidFee();
		if (config.maxBorrowBps < MIN_MAX_BORROW_BPS || config.maxBorrowBps > MAX_MAX_BORROW_BPS) revert InvalidAmount();
		if (config.ownerFeeBps > FEE_DENOMINATOR) revert InvalidFee();

		tokenConfigs[token] = TokenConfig({
			enabled: config.enabled,
			supportsPermit: config.supportsPermit,
			feeBps: config.feeBps,
			maxFlashLoan: config.maxFlashLoan,
			wrapper: config.wrapper,
			maxBorrowBps: config.maxBorrowBps,
			ownerFeeBps: config.ownerFeeBps
		});

		configuredTokens[token] = true;

		emit TokenConfigUpdated(
			token,
			config.enabled,
			config.supportsPermit,
			config.feeBps,
			config.maxFlashLoan,
			config.wrapper,
			config.maxBorrowBps
		);
	}

	function setCommitment(
		address token,
		uint256 limit,
		uint48 expiry,
		bool paused
	) external {
		_applyCommitment(token, msg.sender, limit, expiry, paused);
	}

	function setCommitmentWithPermit(
		address token,
		uint256 limit,
		uint48 expiry,
		bool paused,
		uint256 permitValue,
		uint256 permitDeadline,
		uint8 v,
		bytes32 r,
		bytes32 s
	) external {
		if (!configuredTokens[token]) revert TokenNotConfigured();
		TokenConfig memory config = tokenConfigs[token];
		if (!config.supportsPermit) revert PermitUnsupported();

		uint256 approveValue = permitValue == 0 ? type(uint256).max : permitValue;
		IERC20Permit(token).permit(
			msg.sender,
			address(this),
			approveValue,
			permitDeadline,
			v,
			r,
			s
		);

		_applyCommitment(token, msg.sender, limit, expiry, paused);
	}

	function flashLoan(
		address token,
		uint256 amount,
		bool toNative,
		bytes calldata data
	) external nonReentrant {
		if (!configuredTokens[token]) revert TokenNotConfigured();
		TokenConfig storage config = tokenConfigs[token];
		if (!config.enabled) revert TokenNotEnabled();
		if (amount == 0) revert InvalidAmount();
		if (config.maxFlashLoan != 0 && amount > config.maxFlashLoan) revert InvalidAmount();
		if (totalCommitted[token] < amount) revert InsufficientCommittedLiquidity();

		// Check max borrow percentage of total pool (uses mulDiv to avoid overflow)
		uint256 maxBorrowAmount = Math.mulDiv(totalCommitted[token], config.maxBorrowBps, FEE_DENOMINATOR);
		if (amount > maxBorrowAmount) revert ExceedsMaxBorrowLimit();

		LoanContext memory ctx;
		ctx.tokenContract = IERC20(token);
		ctx.pulls = _pullLiquidity(token, ctx.tokenContract, amount);
		ctx.fee = (amount * config.feeBps) / FEE_DENOMINATOR;
		(ctx.tokenBalanceBefore, ctx.nativeBalanceBefore) = _sendToBorrower(
			ctx.tokenContract,
			config.wrapper,
			amount,
			toNative,
			msg.sender
		);

		bool strategySuccess = false;
		try IL2FlashLoan(msg.sender).executeFlashLoan(amount, ctx.fee, data) returns (bool ok) {
			strategySuccess = ok;
		} catch {
			strategySuccess = false;
		}

		bool repaymentSuccess = _verifyRepayment(
			ctx.tokenContract,
			config.wrapper,
			toNative,
			ctx.tokenBalanceBefore,
			ctx.nativeBalanceBefore,
			amount,
			ctx.fee
		);

		if (!strategySuccess || !repaymentSuccess) {
			revert FlashLoanFailed();
		}

		if (toNative) {
			IWETH(config.wrapper).deposit{value: amount + ctx.fee}();
		}

		_distribute(token, ctx.tokenContract, ctx.pulls, amount, ctx.fee);

		emit FlashLoanExecuted(msg.sender, token, amount, ctx.fee, toNative);
	}

	function getTokenStats(
		address token
	) external view returns (
		uint256 committed,
		uint256 activeProviders,
		uint16 feeBps,
		uint256 maxFlashLoan,
		bool supportsPermit,
		uint16 maxBorrowBps
	) {
		if (!configuredTokens[token]) revert TokenNotConfigured();

		TokenConfig memory config = tokenConfigs[token];
		address[] storage providers = tokenProviders[token];
		uint256 active;

		for (uint256 i = 0; i < providers.length; i++) {
			ProviderConfig storage cfg = providerConfigs[token][providers[i]];
			if (_calcActive(cfg.limit, cfg.paused, cfg.expiry) > 0) {
				active++;
			}
		}

		return (
			totalCommitted[token],
			active,
			config.feeBps,
			config.maxFlashLoan,
			config.supportsPermit,
			config.maxBorrowBps
		);
	}

	function getOwnerProfits(address token) external view returns (uint256) {
		return ownerProfits[token];
	}

	/**
	 * @notice Get actual available liquidity (checks real balances, not just commitments)
	 * @dev This is more accurate than totalCommitted when providers send/receive tokens
	 * @param token The token address
	 * @return total The actual available liquidity across all active providers
	 */
	function getActualAvailableLiquidity(address token) external view returns (uint256) {
		if (!configuredTokens[token]) return 0;
		
		address[] storage providers = tokenProviders[token];
		uint256 total = 0;
		
		for (uint256 i = 0; i < providers.length; i++) {
			address provider = providers[i];
			ProviderConfig storage cfg = providerConfigs[token][provider];
			
			// Only count active providers
			if (!cfg.paused && cfg.registered && (cfg.expiry == 0 || cfg.expiry > block.timestamp)) {
				uint256 balance = IERC20(token).balanceOf(provider);
				uint256 available = balance > cfg.inUse ? balance - cfg.inUse : 0;
				
				// If provider has unlimited commitment, use their full available balance
				// If provider has a limit, use the minimum of (available balance, remaining limit)
				if (cfg.limit == type(uint256).max) {
					total += available;
				} else {
					uint256 remainingLimit = cfg.limit > cfg.inUse ? cfg.limit - cfg.inUse : 0;
					total += available < remainingLimit ? available : remainingLimit;
				}
			}
		}
		
		return total;
	}

	function _sendToBorrower(
		IERC20 tokenContract,
		address wrapper,
		uint256 amount,
		bool toNative,
		address borrower
	) internal returns (uint256 tokenBalanceBefore, uint256 nativeBalanceBefore) {
		tokenBalanceBefore = tokenContract.balanceOf(address(this));
		if (toNative) {
			if (wrapper == address(0)) revert NativeBridgeUnavailable();
			nativeBalanceBefore = address(this).balance;
			IWETH(wrapper).withdraw(amount);
			(bool sent, ) = borrower.call{value: amount}("");
			require(sent, "native transfer failed");
		} else {
			nativeBalanceBefore = 0;
			tokenContract.safeTransfer(borrower, amount);
		}
	}

	function getProviderInfo(
		address token,
		address provider
	) external view returns (
		uint256 limit,
		uint256 inUse,
		uint48 expiry,
		bool paused,
		bool registered
	) {
		if (!configuredTokens[token]) revert TokenNotConfigured();
		ProviderConfig storage cfg = providerConfigs[token][provider];
		return (cfg.limit, cfg.inUse, cfg.expiry, cfg.paused, cfg.registered);
	}

	function getProviders(address token) external view returns (address[] memory) {
		if (!configuredTokens[token]) revert TokenNotConfigured();
		return tokenProviders[token];
	}

	function quoteFee(address token, uint256 amount) external view returns (uint256) {
		if (!configuredTokens[token]) revert TokenNotConfigured();
		if (amount == 0) return 0;
		return (amount * tokenConfigs[token].feeBps) / FEE_DENOMINATOR;
	}

	function syncCommitment(address token, address provider) external {
		if (!configuredTokens[token]) revert TokenNotConfigured();
		ProviderConfig storage cfg = providerConfigs[token][provider];
		_autoDeactivate(token, provider, cfg);
	}

	function proposeRescueToken(address token, address to, uint256 amount) external onlyOwner {
		require(token != address(0) && to != address(0), "invalid address");
		require(amount > 0, "invalid amount");

		bytes32 changeHash = keccak256(abi.encode("rescueToken", token, to, amount));
		pendingChanges[changeHash] = true;
		emit ChangeProposed(changeHash, msg.sender);
	}

	function executeRescueToken(address token, address to, uint256 amount) external {
		if (msg.sender != admin) revert NotAdmin();
		require(token != address(0) && to != address(0), "invalid address");
		require(amount > 0, "invalid amount");

		bytes32 changeHash = keccak256(abi.encode("rescueToken", token, to, amount));
		if (!pendingChanges[changeHash]) revert ChangeNotProposed();

		delete pendingChanges[changeHash];
		IERC20(token).safeTransfer(to, amount);
		emit ChangeExecuted(changeHash, msg.sender);
	}

	function proposeRescueETH(address payable to, uint256 amount) external onlyOwner {
		require(to != address(0), "invalid recipient");
		require(amount > 0, "invalid amount");

		bytes32 changeHash = keccak256(abi.encode("rescueETH", to, amount));
		pendingChanges[changeHash] = true;
		emit ChangeProposed(changeHash, msg.sender);
	}

	function executeRescueETH(address payable to, uint256 amount) external {
		if (msg.sender != admin) revert NotAdmin();
		require(to != address(0), "invalid recipient");
		require(amount > 0, "invalid amount");

		bytes32 changeHash = keccak256(abi.encode("rescueETH", to, amount));
		if (!pendingChanges[changeHash]) revert ChangeNotProposed();

		delete pendingChanges[changeHash];
		(bool sent, ) = to.call{value: amount}("");
		require(sent, "rescue failed");
		emit ChangeExecuted(changeHash, msg.sender);
	}

	/**
	 * @notice Step 1: Owner proposes profit withdrawal
	 */
	function proposeProfitWithdrawal(address token, address to, uint256 amount) external onlyOwner {
		require(to != address(0), "invalid recipient");
		require(amount > 0 && amount <= ownerProfits[token], "invalid amount");
		
		bytes32 changeHash = keccak256(abi.encode("withdraw", token, to, amount));
		pendingChanges[changeHash] = true;
		
		emit ChangeProposed(changeHash, msg.sender);
	}

	/**
	 * @notice Step 2: Admin approves and executes profit withdrawal
	 */
	function executeProfitWithdrawal(address token, address to, uint256 amount) external {
		if (msg.sender != admin) revert NotAdmin();
		
		bytes32 changeHash = keccak256(abi.encode("withdraw", token, to, amount));
		if (!pendingChanges[changeHash]) revert ChangeNotProposed();
		
		require(to != address(0), "invalid recipient");
		require(amount > 0 && amount <= ownerProfits[token], "invalid amount");
		
		ownerProfits[token] -= amount;
		delete pendingChanges[changeHash];
		IERC20(token).safeTransfer(to, amount);
		
		emit ChangeExecuted(changeHash, msg.sender);
	}

	/**
	 * @notice Emergency: Withdraw profits with single signature (owner or admin)
	 * @dev Use for emergencies only - normal flow should use propose/execute
	 */
	function withdrawOwnerProfits(address token, address to) external onlyOwnerOrAdmin {
		require(to != address(0), "invalid recipient");
		uint256 amount = ownerProfits[token];
		if (amount == 0) revert InvalidAmount();
		
		ownerProfits[token] = 0;
		IERC20(token).safeTransfer(to, amount);
	}

	function _applyCommitment(
		address token,
		address provider,
		uint256 limit,
		uint48 expiry,
		bool paused
	) internal {
		if (!configuredTokens[token]) revert TokenNotConfigured();
		if (!paused && expiry != 0 && expiry <= block.timestamp) revert InvalidExpiry();

		ProviderConfig storage cfg = providerConfigs[token][provider];
		_autoDeactivate(token, provider, cfg);

		if (cfg.inUse > 0 && limit < cfg.inUse) revert CommitmentLocked();

		uint256 previousActive = _calcActive(cfg.limit, cfg.paused, cfg.expiry);

		cfg.limit = limit;
		cfg.expiry = expiry;
		cfg.paused = paused;

		if (!cfg.registered) {
			cfg.registered = true;
			tokenProviders[token].push(provider);
		}

		uint256 newActive = _calcActive(cfg.limit, cfg.paused, cfg.expiry);
		_updateTotals(token, previousActive, newActive);

		emit CommitmentUpdated(token, provider, cfg.limit, cfg.expiry, cfg.paused);
	}

	function _pullLiquidity(
		address token,
		IERC20 tokenContract,
		uint256 amount
	) internal returns (Pull[] memory) {
		address[] storage providers = tokenProviders[token];
		uint256 len = providers.length;
		Pull[] memory pulls = new Pull[](len);
		uint256 remaining = amount;
		uint256 count;

		// Gas optimization: for small loans, try to find a single provider
		if (amount < SINGLE_PROVIDER_THRESHOLD) {
			for (uint256 i = 0; i < len; i++) {
				address provider = providers[i];
				ProviderConfig storage cfg = providerConfigs[token][provider];
				if (!cfg.registered) continue;

				_autoDeactivate(token, provider, cfg);
				if (cfg.paused || cfg.limit == 0) continue;

				uint256 available = _maxBorrowable(cfg, tokenContract, provider, amount);
				if (available >= amount) {
					// Single provider can fulfill the entire loan - use them exclusively
					tokenContract.safeTransferFrom(provider, address(this), amount);
					cfg.inUse += amount;
					Pull[] memory singlePull = new Pull[](1);
					singlePull[0] = Pull({ provider: provider, amount: amount });
					return singlePull;
				}
			}
			// If no single provider found, fall through to multi-provider logic below
		}

		// Multi-provider pull (large loans or fragmented liquidity)
		for (uint256 i = 0; i < len && remaining > 0; i++) {
			address provider = providers[i];
			ProviderConfig storage cfg = providerConfigs[token][provider];
			if (!cfg.registered) continue;

			_autoDeactivate(token, provider, cfg);
			if (cfg.paused || cfg.limit == 0) continue;

			uint256 pullAmount = _maxBorrowable(cfg, tokenContract, provider, remaining);
			if (pullAmount == 0) continue;
			tokenContract.safeTransferFrom(provider, address(this), pullAmount);
			cfg.inUse += pullAmount;
			pulls[count++] = Pull({ provider: provider, amount: pullAmount });
			remaining -= pullAmount;
		}

		if (remaining > 0) revert InsufficientCommittedLiquidity();

		Pull[] memory trimmed = new Pull[](count);
		for (uint256 j = 0; j < count; j++) {
			trimmed[j] = pulls[j];
		}

		return trimmed;
	}

	function _distribute(
		address token,
		IERC20 tokenContract,
		Pull[] memory pulls,
		uint256 amount,
		uint256 fee
	) internal {
		TokenConfig memory config = tokenConfigs[token];
		
		// Calculate owner's cut of the fee
		uint256 ownerCut = (fee * config.ownerFeeBps) / FEE_DENOMINATOR;
		uint256 providerFee = fee - ownerCut;
		
		// Track owner profits (stays in contract until withdrawn)
		if (ownerCut > 0) {
			ownerProfits[token] += ownerCut;
		}

		uint256 distributedFee;

		for (uint256 i = 0; i < pulls.length; i++) {
			Pull memory pull = pulls[i];
			ProviderConfig storage cfg = providerConfigs[token][pull.provider];

			if (cfg.inUse >= pull.amount) {
				cfg.inUse -= pull.amount;
			} else {
				cfg.inUse = 0;
			}

			uint256 share = providerFee == 0 ? 0 : (providerFee * pull.amount) / amount;
			distributedFee += share;

			tokenContract.safeTransfer(pull.provider, pull.amount + share);
			_autoDeactivate(token, pull.provider, cfg);
		}

		// Any rounding dust goes to first provider
		if (providerFee > distributedFee && pulls.length > 0) {
			tokenContract.safeTransfer(pulls[0].provider, providerFee - distributedFee);
		}
	}

	function _verifyRepayment(
		IERC20 tokenContract,
		address wrapper,
		bool toNative,
		uint256 tokenBalanceBefore,
		uint256 nativeBalanceBefore,
		uint256 amount,
		uint256 fee
	) internal view returns (bool) {
		if (toNative) {
			if (wrapper == address(0)) return false;
			uint256 nativeAfter = address(this).balance;
			return nativeAfter >= nativeBalanceBefore + amount + fee;
		}

		uint256 tokenAfter = tokenContract.balanceOf(address(this));
		return tokenAfter >= tokenBalanceBefore + fee;
	}

	function _autoDeactivate(
		address token,
		address provider,
		ProviderConfig storage cfg
	) internal {
		uint256 previousActive = _calcActive(cfg.limit, cfg.paused, cfg.expiry);
		if (previousActive == 0) return;

		if (cfg.expiry != 0 && cfg.expiry <= block.timestamp) {
			cfg.paused = true;
			_updateTotals(token, previousActive, 0);
			emit CommitmentUpdated(token, provider, cfg.limit, cfg.expiry, true);
		}
	}

	function _calcActive(
		uint256 limit,
		bool paused,
		uint48 expiry
	) internal view returns (uint256) {
		if (paused || limit == 0) return 0;
		if (expiry != 0 && expiry <= block.timestamp) return 0;
		return limit;
	}

	function _updateTotals(
		address token,
		uint256 previousActive,
		uint256 newActive
	) internal {
		if (previousActive == newActive) return;

		if (newActive > previousActive) {
			uint256 delta = newActive - previousActive;
			// Cap at MaxUint256 to prevent overflow when multiple providers have unlimited commitments
			if (totalCommitted[token] > type(uint256).max - delta) {
				totalCommitted[token] = type(uint256).max;
			} else {
				totalCommitted[token] += delta;
			}
		} else {
			uint256 delta = previousActive - newActive;
			if (totalCommitted[token] > delta) {
				totalCommitted[token] -= delta;
			} else {
				totalCommitted[token] = 0;
			}
		}
	}

	function _min(uint256 a, uint256 b) internal pure returns (uint256) {
		return a < b ? a : b;
	}

	function _maxBorrowable(
		ProviderConfig storage cfg,
		IERC20 tokenContract,
		address provider,
		uint256 remaining
	) internal view returns (uint256) {
		uint256 available = cfg.limit > cfg.inUse ? cfg.limit - cfg.inUse : 0;
		if (available == 0) return 0;

		uint256 allowance = tokenContract.allowance(provider, address(this));
		if (allowance == 0) return 0;
		if (allowance < available) available = allowance;

		uint256 balance = tokenContract.balanceOf(provider);
		if (balance == 0) return 0;
		if (balance < available) available = balance;

		if (available > remaining) {
			return remaining;
		}
		return available;
	}
}

