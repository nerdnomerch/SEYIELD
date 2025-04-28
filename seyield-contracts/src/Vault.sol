// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {PSYLD} from './PSYLD.sol';
import {YSYLD} from './YSYLD.sol';
import {MockYieldProtocol} from "./MockYieldProtocol.sol";
import {Treasury} from "./Treasury.sol";

/**
 * @title FundsVault
 * @notice Main contract for user deposits and yield management
 * @dev Manages user deposits, mints pSYLD and ySYLD tokens, and interacts with the yield protocol
 */
contract FundsVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Error thrown when a user has insufficient balance
    error InsufficientBalance();

    /// @notice Error thrown when an invalid amount is provided
    error InvalidAmount();

    /// @notice Error thrown when an invalid address is provided
    error InvalidAddress();

    /// @notice Error thrown when a transfer fails
    error TransferFailed();

    /// @notice Error thrown when a withdrawal is attempted during the lock period
    error WithdrawalLocked();

    /// @notice Error thrown when a user has already withdrawn
    error AlreadyWithdrawn();

    /// @notice Error thrown when a zero address is provided
    /// @param field The name of the field that received a zero address
    error ZeroAddress(string field);

    /// @notice The USDC token contract
    IERC20 private immutable usdc;

    /// @notice The Principal SEYIELD token contract
    PSYLD public immutable pSYLD;

    /// @notice The Yield SEYIELD token contract
    YSYLD public immutable ySYLD;

    /// @notice The Treasury contract
    Treasury public immutable treasury;

    /// @notice The Yield Protocol contract
    MockYieldProtocol public immutable yieldProtocol;

    /// @notice Lock period for deposits (30 days)
    uint96 private constant LOCK_PERIOD = 30 days;

    /// @notice Yield ratio (7%)
    uint96 private constant YIELD_RATIO = 7;

    /// @notice Early withdrawal fee (5%)
    uint96 private constant EARLY_WITHDRAWAL_FEE = 5;

    /// @notice Basic points denominator (10000)
    uint96 private constant BASIC_POINTS = 10000;

    /// @notice Pool deployment interval (24 hours)
    uint96 private constant POOL_DEPLOYMENT_INTERVAL = 24 hours;

    /// @notice User deposit information
    struct UserInfo {
        uint128 deposit;      // Amount of USDC deposited
        uint64 depositTime;   // Timestamp of deposit
        bool hasWithdrawn;    // Whether the user has withdrawn
    }

    /// @notice Mapping of user deposit information
    mapping(address => UserInfo) public userInfo;

    /// @notice Total amount of USDC pooled for deployment
    uint256 public totalPooledAmount;

    /// @notice Timestamp of the last pool deployment
    uint256 public lastDeploymentTime;

    /// @notice Emitted when a user deposits USDC
    /// @param user The address that deposited
    /// @param amount The amount of USDC deposited
    event Deposited(address indexed user, uint256 amount);

    /// @notice Emitted when a user withdraws USDC
    /// @param user The address that withdrew
    /// @param amount The amount of USDC withdrawn
    /// @param fee The fee charged for early withdrawal
    event Withdrawn(address indexed user, uint256 amount, uint256 fee);

    /// @notice Emitted when yield is deposited
    /// @param amount The amount of yield deposited
    event YieldDeposited(uint256 amount);

    /// @notice Emitted when yield is harvested
    /// @param amount The amount of yield harvested
    event YieldHarvested(uint256 amount);

    /// @notice Emitted when a pool is deployed
    /// @param amount The amount of USDC deployed
    /// @param timestamp The timestamp of deployment
    event PoolDeployed(uint256 amount, uint256 timestamp);

    /// @notice Initial setup parameters for the contract
    struct InitialSetup {
        address _initialOwner;     // Initial owner of the contract
        address _usdc;             // USDC token address
        address _yieldProtocol;    // Yield protocol address
        address _treasury;         // Treasury address
        address _pSYLD;            // Principal SEYIELD token address
        address _ySYLD;            // Yield SEYIELD token address
    }

    /**
     * @notice Constructs the FundsVault contract
     * @param initParams The initial setup parameters
     */
    constructor(InitialSetup memory initParams) Ownable(initParams._initialOwner) {
        if (initParams._usdc == address(0)) revert ZeroAddress("usdc");
        if (initParams._yieldProtocol == address(0)) revert ZeroAddress("yieldProtocol");
        if (initParams._treasury == address(0)) revert ZeroAddress("treasury");
        if (initParams._pSYLD == address(0)) revert ZeroAddress("pSYLD");
        if (initParams._ySYLD == address(0)) revert ZeroAddress("ySYLD");

        usdc = IERC20(initParams._usdc);
        yieldProtocol = MockYieldProtocol(initParams._yieldProtocol);
        treasury = Treasury(initParams._treasury);
        pSYLD = PSYLD(initParams._pSYLD);
        ySYLD = YSYLD(initParams._ySYLD);
    }

    /**
     * @notice Deposit USDC to receive pSYLD and ySYLD tokens
     * @param amount The amount of USDC to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();

        address sender = msg.sender;
        if (usdc.balanceOf(sender) < amount) revert InsufficientBalance();

        // Update state before external calls
        unchecked {
            // Safe math not needed due to checks
            totalPooledAmount += amount;

            // Update user info
            userInfo[sender] = UserInfo({
                deposit: uint128(amount),
                depositTime: uint64(block.timestamp),
                hasWithdrawn: false
            });
        }

        // Mint tokens
        pSYLD.mint(sender, amount);

        // Mint ySYLD directly to user instead of keeping in vault
        uint256 yieldTokens = (amount * YIELD_RATIO) / 100;
        ySYLD.mint(sender, yieldTokens);

        // Transfer USDC after state updates
        usdc.safeTransferFrom(sender, address(this), amount);

        // Auto deploy if interval passed
        if (block.timestamp >= lastDeploymentTime + POOL_DEPLOYMENT_INTERVAL) {
            _deployPool();
        }

        emit Deposited(sender, amount);
    }

    /**
     * @notice Withdraw USDC by burning pSYLD tokens
     * @param amount The amount of pSYLD to burn and USDC to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();

        address sender = msg.sender;
        UserInfo storage user = userInfo[sender];

        if (pSYLD.balanceOf(sender) < amount) revert InsufficientBalance();

        // Calculate fee if within lock period
        uint256 fee = 0;
        if (block.timestamp < user.depositTime + LOCK_PERIOD) {
            fee = (amount * EARLY_WITHDRAWAL_FEE) / 100;
        }

        // Update state before external calls
        unchecked {
            uint256 withdrawAmount = amount - fee;
            totalPooledAmount -= amount;
            user.deposit -= uint128(amount);
        }

        // Burn tokens
        pSYLD.burn(sender, amount);

        // Transfer USDC after state updates
        if (fee > 0) {
            usdc.safeTransfer(address(treasury), fee);
        }
        usdc.safeTransfer(sender, amount - fee);

        emit Withdrawn(sender, amount - fee, fee);
    }

    /**
     * @notice Deploy pooled USDC to the yield protocol
     * @dev Internal function called automatically after deposits or manually by the owner
     */
    function _deployPool() internal {
        uint256 amount = totalPooledAmount;
        if (amount == 0) return;

        // Update state before external calls
        lastDeploymentTime = block.timestamp;
        totalPooledAmount = 0;

        // Approve and deposit to yield protocol
        address protocolAddress = address(yieldProtocol);
        // First set approval to 0 (to handle non-standard ERC20 tokens)
        usdc.approve(protocolAddress, 0);
        // Then set to the desired amount
        usdc.approve(protocolAddress, amount);
        yieldProtocol.deposit(amount);

        emit PoolDeployed(amount, block.timestamp);
    }

    /**
     * @notice Manually deploy pooled USDC to the yield protocol
     * @dev Can only be called by the contract owner
     */
    function deployPool() external onlyOwner {
        _deployPool();
    }

    /**
     * @notice Harvest yield from the yield protocol and transfer it to the treasury
     * @dev Can only be called by the contract owner
     */
    function harvestYield() external onlyOwner nonReentrant {
        uint256 yieldAmount = yieldProtocol.claimYield();
        if (yieldAmount > 0) {
            usdc.safeTransfer(address(treasury), yieldAmount);
        }
        emit YieldHarvested(yieldAmount);
    }

    /**
     * @notice Estimate yield for a user
     * @param user The address to estimate yield for
     * @return The estimated yield amount
     */
    function estimateYield(address user) external view returns (uint256) {
        return yieldProtocol.calculateYield(user);
    }

    /**
     * @notice Get the total amount of USDC pooled for deployment
     * @return The pooled amount
     */
    function getPooledAmount() external view returns (uint256) {
        return totalPooledAmount;
    }

    /**
     * @notice Get the timestamp of the next scheduled pool deployment
     * @return The next deployment timestamp
     */
    function getNextDeploymentTime() external view returns (uint256) {
        return lastDeploymentTime + POOL_DEPLOYMENT_INTERVAL;
    }

    /**
     * @notice Get the lock period for deposits
     * @return The lock period in seconds
     */
    function getLockPeriod() external pure returns (uint256) {
        return LOCK_PERIOD;
    }

    /**
     * @notice Get the yield ratio
     * @return The yield ratio (percentage)
     */
    function getYieldRatio() external pure returns (uint256) {
        return YIELD_RATIO;
    }

    /**
     * @notice Get the early withdrawal fee
     * @return The early withdrawal fee (percentage)
     */
    function getEarlyWithdrawalFee() external pure returns (uint256) {
        return EARLY_WITHDRAWAL_FEE;
    }
}
