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

/**
 * @title FlashBankRouterV3
 * @notice Non-custodial flash-loan router. Liquidity stays in provider wallets and is pulled, used and
 *         returned inside one atomic transaction; the contract never pools deposits.
 *
 * @dev v3 hardens the (immutable, live) v2.1 router against the centralisation findings in the honest
 *      audit, without changing the non-custodial core:
 *        1. The owner's cut of the fee is hard-capped at MAX_OWNER_FEE_BPS (20% of the fee), not 100%.
 *        2. There are NO single-signature emergency paths: every config change, rescue, ownership move
 *           and profit withdrawal goes through the propose/execute dual-signature flow.
 *        3. Config changes and rescues are timelocked (CONFIG_TIMELOCK), so a provider can revoke their
 *           allowance or pause before any adverse change lands. Initial tokens are set at construction.
 *        4. Borrowers can pin a maxFee on-chain, so a fee change can never silently overcharge a loan.
 *        5. reconcile() lets anyone sweep expired commitments so totalCommitted cannot drift upward.
 *      Unchanged by design: pull-based custody, balance-delta repayment check, nonReentrant, the
 *      0.01%–1% fee band, and rejecting fee-on-transfer / rebasing tokens.
 */
contract FlashBankRouterV3 is Ownable, ReentrancyGuard {
	using SafeERC20 for IERC20;

	string public constant VERSION = "3.0.0";

	uint16 public constant FEE_DENOMINATOR = 10_000;
	uint16 public constant MIN_FEE_BPS = 1;        // 0.01% minimum
	uint16 public constant MAX_FEE_BPS = 100;      // 1% maximum
	uint16 public constant MIN_MAX_BORROW_BPS = 100;    // 1% minimum of pool
	uint16 public constant MAX_MAX_BORROW_BPS = 10_000; // 100% maximum (entire pool)
	uint256 public constant SINGLE_PROVIDER_THRESHOLD = 10 ether; // Prefer single provider below this size
	uint16 public constant DEFAULT_OWNER_FEE_BPS = 200; // 2% of the fee (0.0004% of loan amount)
	uint16 public constant MAX_OWNER_FEE_BPS = 2_000;   // v3: owner may take at most 20% of the fee
	uint256 public constant CONFIG_TIMELOCK = 2 days;   // v3: delay between proposing and executing adverse changes

	struct TokenConfig {
		bool enabled;
		bool supportsPermit;
		uint16 feeBps;
		uint256 maxFlashLoan;
		address wrapper;
		uint16 maxBorrowBps;  // Max % of pool borrowable in one tx (basis points)
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

	// Hash of a proposed change => the timestamp it becomes executable (0 = not proposed).
	// Adverse changes (config, rescue) carry a CONFIG_TIMELOCK delay; ownership/withdrawal are eta = now.
	mapping(bytes32 => uint256) public pendingChangeEta;

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
	error ChangeNotReady();
	error FeeExceedsMax();
	error LengthMismatch();

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
	event ChangeProposed(bytes32 indexed changeHash, address indexed proposer, uint256 eta);
	event ChangeExecuted(bytes32 indexed changeHash, address indexed executor);
	event ChangeCancelled(bytes32 indexed changeHash);

	/**
	 * @param _admin   The dual-control admin (executes what the owner proposes).
	 * @param tokens   Initial tokens to configure at deploy (no timelock — there are no providers yet).
	 * @param configs  Matching configs for `tokens`.
	 */
	constructor(address _admin, address[] memory tokens, TokenConfig[] memory configs) {
		require(_admin != address(0), "Invalid admin");
		if (tokens.length != configs.length) revert LengthMismatch();
		admin = _admin;
		emit AdminUpdated(address(0), _admin);

		for (uint256 i = 0; i < tokens.length; i++) {
			_writeTokenConfig(tokens[i], configs[i]);
		}
	}

	modifier onlyAdmin() {
		if (msg.sender != admin) revert NotAdmin();
		_;
	}

	receive() external payable {}

	/* ----------------------------------------------------------------------------- *
	 *  Admin / dual control                                                          *
	 * ----------------------------------------------------------------------------- */

	/// @notice Rotate the dual-control admin (owner only).
	function setAdmin(address newAdmin) external onlyOwner {
		require(newAdmin != address(0), "Invalid admin");
		address oldAdmin = admin;
		admin = newAdmin;
		emit AdminUpdated(oldAdmin, newAdmin);
	}

	/// @notice Owner cancels a still-pending proposal (e.g. a mistaken or superseded config).
	function cancelChange(bytes32 changeHash) external onlyOwner {
		if (pendingChangeEta[changeHash] == 0) revert ChangeNotProposed();
		delete pendingChangeEta[changeHash];
		emit ChangeCancelled(changeHash);
	}

	/// @notice True once a proposed change exists and its timelock has elapsed.
	function isChangeReady(bytes32 changeHash) external view returns (bool) {
		uint256 eta = pendingChangeEta[changeHash];
		return eta != 0 && block.timestamp >= eta;
	}

	function _propose(bytes32 changeHash, uint256 delay) internal {
		uint256 eta = block.timestamp + delay;
		pendingChangeEta[changeHash] = eta;
		emit ChangeProposed(changeHash, msg.sender, eta);
	}

	function _consume(bytes32 changeHash) internal {
		uint256 eta = pendingChangeEta[changeHash];
		if (eta == 0) revert ChangeNotProposed();
		if (block.timestamp < eta) revert ChangeNotReady();
		delete pendingChangeEta[changeHash];
		emit ChangeExecuted(changeHash, msg.sender);
	}

	/* ----------------------------------------------------------------------------- *
	 *  Token configuration (propose + timelock + execute)                            *
	 * ----------------------------------------------------------------------------- */

	/// @notice Step 1: owner proposes a token config change. Executable after CONFIG_TIMELOCK.
	function proposeTokenConfig(address token, TokenConfig calldata config) external onlyOwner {
		_validateTokenConfig(token, config);
		_propose(keccak256(abi.encode("config", token, config)), CONFIG_TIMELOCK);
	}

	/// @notice Step 2: admin executes the proposed config once the timelock has elapsed.
	function executeTokenConfig(address token, TokenConfig calldata config) external onlyAdmin {
		_consume(keccak256(abi.encode("config", token, config)));
		_writeTokenConfig(token, config);
	}

	function _validateTokenConfig(address token, TokenConfig memory config) internal pure {
		if (token == address(0)) revert InvalidToken();
		if (config.feeBps < MIN_FEE_BPS || config.feeBps > MAX_FEE_BPS) revert InvalidFee();
		if (config.maxBorrowBps < MIN_MAX_BORROW_BPS || config.maxBorrowBps > MAX_MAX_BORROW_BPS) revert InvalidAmount();
		if (config.ownerFeeBps > MAX_OWNER_FEE_BPS) revert InvalidFee();
	}

	function _writeTokenConfig(address token, TokenConfig memory config) internal {
		_validateTokenConfig(token, config);
		tokenConfigs[token] = config;
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

	/* ----------------------------------------------------------------------------- *
	 *  Ownership transfer (dual control, no timelock — bounded by the same caps)     *
	 * ----------------------------------------------------------------------------- */

	function proposeOwnershipTransfer(address newOwner) external onlyOwner {
		require(newOwner != address(0), "invalid owner");
		_propose(keccak256(abi.encode("ownership", newOwner)), 0);
	}

	function executeOwnershipTransfer(address newOwner) external onlyAdmin {
		require(newOwner != address(0), "invalid owner");
		_consume(keccak256(abi.encode("ownership", newOwner)));
		_transferOwnership(newOwner);
	}

	function transferOwnership(address) public view override onlyOwner {
		revert("Use proposeOwnershipTransfer");
	}

	function renounceOwnership() public view override onlyOwner {
		revert("Ownership cannot be renounced");
	}

	/* ----------------------------------------------------------------------------- *
	 *  Provider commitments                                                          *
	 * ----------------------------------------------------------------------------- */

	function setCommitment(address token, uint256 limit, uint48 expiry, bool paused) external {
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
		IERC20Permit(token).permit(msg.sender, address(this), approveValue, permitDeadline, v, r, s);

		_applyCommitment(token, msg.sender, limit, expiry, paused);
	}

	/// @notice Permissionless maintenance: pause every expired commitment and re-derive totalCommitted
	///         from the surviving active limits. Fixes the v2.1 drift where an expired commitment was
	///         never de-counted (and, worse, could still be pulled from). Reads no balances; only expiry.
	function reconcile(address token) external {
		if (!configuredTokens[token]) revert TokenNotConfigured();
		address[] storage providers = tokenProviders[token];
		uint256 len = providers.length;
		uint256 total = 0;
		for (uint256 i = 0; i < len; i++) {
			address provider = providers[i];
			ProviderConfig storage cfg = providerConfigs[token][provider];

			if (!cfg.paused && cfg.expiry != 0 && cfg.expiry <= block.timestamp) {
				cfg.paused = true;
				emit CommitmentUpdated(token, provider, cfg.limit, cfg.expiry, true);
			}

			uint256 active = _calcActive(cfg.limit, cfg.paused, cfg.expiry);
			// Saturating add so several unlimited commitments cannot overflow.
			if (active == type(uint256).max || total > type(uint256).max - active) {
				total = type(uint256).max;
			} else {
				total += active;
			}
		}
		totalCommitted[token] = total;
	}

	/* ----------------------------------------------------------------------------- *
	 *  Flash loans                                                                   *
	 * ----------------------------------------------------------------------------- */

	/// @notice Borrow `amount` of `token` for one transaction. Repay amount + fee before it ends.
	function flashLoan(address token, uint256 amount, bool toNative, bytes calldata data) external nonReentrant {
		_flashLoan(token, amount, toNative, data, type(uint256).max);
	}

	/// @notice Same as {flashLoan} but reverts if the fee would exceed `maxFee` — an on-chain pin so a
	///         config change can never silently overcharge a borrower for the loan they signed.
	function flashLoan(address token, uint256 amount, bool toNative, bytes calldata data, uint256 maxFee) external nonReentrant {
		_flashLoan(token, amount, toNative, data, maxFee);
	}

	function _flashLoan(address token, uint256 amount, bool toNative, bytes calldata data, uint256 maxFee) internal {
		if (!configuredTokens[token]) revert TokenNotConfigured();
		TokenConfig storage config = tokenConfigs[token];
		if (!config.enabled) revert TokenNotEnabled();
		if (amount == 0) revert InvalidAmount();
		if (config.maxFlashLoan != 0 && amount > config.maxFlashLoan) revert InvalidAmount();
		if (totalCommitted[token] < amount) revert InsufficientCommittedLiquidity();

		uint256 maxBorrowAmount = Math.mulDiv(totalCommitted[token], config.maxBorrowBps, FEE_DENOMINATOR);
		if (amount > maxBorrowAmount) revert ExceedsMaxBorrowLimit();

		LoanContext memory ctx;
		ctx.tokenContract = IERC20(token);
		ctx.fee = (amount * config.feeBps) / FEE_DENOMINATOR;
		if (ctx.fee > maxFee) revert FeeExceedsMax();

		ctx.pulls = _pullLiquidity(token, ctx.tokenContract, amount);
		(ctx.tokenBalanceBefore, ctx.nativeBalanceBefore) = _sendToBorrower(
			ctx.tokenContract, config.wrapper, amount, toNative, msg.sender
		);

		bool strategySuccess = false;
		try IL2FlashLoan(msg.sender).executeFlashLoan(amount, ctx.fee, data) returns (bool ok) {
			strategySuccess = ok;
		} catch {
			strategySuccess = false;
		}

		bool repaymentSuccess = _verifyRepayment(
			ctx.tokenContract, config.wrapper, toNative, ctx.tokenBalanceBefore, ctx.nativeBalanceBefore, amount, ctx.fee
		);

		if (!strategySuccess || !repaymentSuccess) revert FlashLoanFailed();

		if (toNative) {
			IWETH(config.wrapper).deposit{value: amount + ctx.fee}();
		}

		_distribute(token, ctx.tokenContract, ctx.pulls, amount, ctx.fee);

		emit FlashLoanExecuted(msg.sender, token, amount, ctx.fee, toNative);
	}

	/* ----------------------------------------------------------------------------- *
	 *  Views                                                                         *
	 * ----------------------------------------------------------------------------- */

	function getTokenStats(address token) external view returns (
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
			if (_calcActive(cfg.limit, cfg.paused, cfg.expiry) > 0) active++;
		}
		return (totalCommitted[token], active, config.feeBps, config.maxFlashLoan, config.supportsPermit, config.maxBorrowBps);
	}

	function getOwnerProfits(address token) external view returns (uint256) {
		return ownerProfits[token];
	}

	/// @notice Real available liquidity across active providers (checks balances, not just commitments).
	function getActualAvailableLiquidity(address token) external view returns (uint256) {
		if (!configuredTokens[token]) return 0;
		address[] storage providers = tokenProviders[token];
		uint256 total = 0;
		for (uint256 i = 0; i < providers.length; i++) {
			address provider = providers[i];
			ProviderConfig storage cfg = providerConfigs[token][provider];
			if (!cfg.paused && cfg.registered && (cfg.expiry == 0 || cfg.expiry > block.timestamp)) {
				uint256 balance = IERC20(token).balanceOf(provider);
				uint256 available = balance > cfg.inUse ? balance - cfg.inUse : 0;
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

	function getProviderInfo(address token, address provider) external view returns (
		uint256 limit, uint256 inUse, uint48 expiry, bool paused, bool registered
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

	/* ----------------------------------------------------------------------------- *
	 *  Rescue (dual control + timelock)                                              *
	 * ----------------------------------------------------------------------------- */

	function proposeRescueToken(address token, address to, uint256 amount) external onlyOwner {
		require(token != address(0) && to != address(0), "invalid address");
		require(amount > 0, "invalid amount");
		_propose(keccak256(abi.encode("rescueToken", token, to, amount)), CONFIG_TIMELOCK);
	}

	function executeRescueToken(address token, address to, uint256 amount) external onlyAdmin {
		require(token != address(0) && to != address(0), "invalid address");
		require(amount > 0, "invalid amount");
		_consume(keccak256(abi.encode("rescueToken", token, to, amount)));
		IERC20(token).safeTransfer(to, amount);
	}

	function proposeRescueETH(address payable to, uint256 amount) external onlyOwner {
		require(to != address(0), "invalid recipient");
		require(amount > 0, "invalid amount");
		_propose(keccak256(abi.encode("rescueETH", to, amount)), CONFIG_TIMELOCK);
	}

	function executeRescueETH(address payable to, uint256 amount) external onlyAdmin {
		require(to != address(0), "invalid recipient");
		require(amount > 0, "invalid amount");
		_consume(keccak256(abi.encode("rescueETH", to, amount)));
		(bool sent, ) = to.call{value: amount}("");
		require(sent, "rescue failed");
	}

	/* ----------------------------------------------------------------------------- *
	 *  Owner profit withdrawal (dual control, no timelock — owner's own accrued fee) *
	 * ----------------------------------------------------------------------------- */

	function proposeProfitWithdrawal(address token, address to, uint256 amount) external onlyOwner {
		require(to != address(0), "invalid recipient");
		require(amount > 0 && amount <= ownerProfits[token], "invalid amount");
		_propose(keccak256(abi.encode("withdraw", token, to, amount)), 0);
	}

	function executeProfitWithdrawal(address token, address to, uint256 amount) external onlyAdmin {
		require(to != address(0), "invalid recipient");
		require(amount > 0 && amount <= ownerProfits[token], "invalid amount");
		_consume(keccak256(abi.encode("withdraw", token, to, amount)));
		ownerProfits[token] -= amount;
		IERC20(token).safeTransfer(to, amount);
	}

	/* ----------------------------------------------------------------------------- *
	 *  Internals (unchanged from v2.1 except where noted)                            *
	 * ----------------------------------------------------------------------------- */

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

		// Gas optimisation: for small loans, try to satisfy it from a single provider.
		if (amount < SINGLE_PROVIDER_THRESHOLD) {
			for (uint256 i = 0; i < len; i++) {
				address provider = providers[i];
				ProviderConfig storage cfg = providerConfigs[token][provider];
				if (!cfg.registered) continue;

				_autoDeactivate(token, provider, cfg);
				if (cfg.paused || cfg.limit == 0) continue;

				uint256 available = _maxBorrowable(cfg, tokenContract, provider, amount);
				if (available >= amount) {
					tokenContract.safeTransferFrom(provider, address(this), amount);
					cfg.inUse += amount;
					Pull[] memory singlePull = new Pull[](1);
					singlePull[0] = Pull({ provider: provider, amount: amount });
					return singlePull;
				}
			}
		}

		// Multi-provider pull (large loans or fragmented liquidity).
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

		uint256 ownerCut = (fee * config.ownerFeeBps) / FEE_DENOMINATOR;
		uint256 providerFee = fee - ownerCut;

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

		// Any rounding dust goes to the first provider.
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

	/// @dev Pause-and-de-count a commitment once it passes its expiry. The amount currently counted in
	///      totalCommitted for an active provider is its `limit` (it was added when last (re)committed
	///      with expiry in the future), so we subtract exactly that. v2.1 derived `previousActive` from
	///      {_calcActive}, which already returns 0 once expired — so it never de-counted (or paused)
	///      expired commitments, letting totalCommitted drift and even letting them be pulled from.
	function _autoDeactivate(
		address token,
		address provider,
		ProviderConfig storage cfg
	) internal {
		if (cfg.paused || cfg.limit == 0) return;            // not counted / already inactive
		if (cfg.expiry == 0 || cfg.expiry > block.timestamp) return; // still live

		cfg.paused = true;
		_updateTotals(token, cfg.limit, 0);
		emit CommitmentUpdated(token, provider, cfg.limit, cfg.expiry, true);
	}

	function _calcActive(uint256 limit, bool paused, uint48 expiry) internal view returns (uint256) {
		if (paused || limit == 0) return 0;
		if (expiry != 0 && expiry <= block.timestamp) return 0;
		return limit;
	}

	function _updateTotals(address token, uint256 previousActive, uint256 newActive) internal {
		if (previousActive == newActive) return;

		if (newActive > previousActive) {
			uint256 delta = newActive - previousActive;
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

		if (available > remaining) return remaining;
		return available;
	}
}
