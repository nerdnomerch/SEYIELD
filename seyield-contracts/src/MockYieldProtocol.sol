// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MockYieldProtocol
 * @notice Simulates a lending protocol like Aave with fixed 8% APY
 * @dev This contract is only for testing and should not be used in production
 */
contract MockYieldProtocol is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice The USDC token contract
    IERC20 public immutable usdc;

    /// @notice Annual percentage yield (8%)
    uint256 private constant APY = 8;

    /// @notice Denominator for APY calculation (100)
    uint256 private constant APY_DENOMINATOR = 100;

    /// @notice Number of seconds in a year
    uint256 private constant SECONDS_PER_YEAR = 365 days;

    /// @notice Mapping of user deposits
    mapping(address => uint256) public deposits;

    /// @notice Mapping of user deposit timestamps
    mapping(address => uint256) public depositTimestamps;

    /// @notice Emitted when a user deposits USDC
    /// @param depositor The address that deposited
    /// @param amount The amount of USDC deposited
    event Deposited(address indexed depositor, uint256 amount);

    /// @notice Emitted when a user withdraws USDC
    /// @param withdrawer The address that withdrew
    /// @param amount The amount of USDC withdrawn
    event Withdrawn(address indexed withdrawer, uint256 amount);

    /// @notice Emitted when a user claims yield
    /// @param claimer The address that claimed yield
    /// @param amount The amount of yield claimed
    event YieldClaimed(address indexed claimer, uint256 amount);

    /// @notice Emitted when yield is manually generated
    /// @param amount The amount of yield generated
    event YieldGenerated(uint256 amount);

    /// @notice Emitted when yield is distributed to a user
    /// @param recipient The address that received yield
    /// @param amount The amount of yield distributed
    event YieldDistributed(address indexed recipient, uint256 amount);

    /// @dev Error thrown when an invalid token address is provided
    error InvalidToken();

    /// @dev Error thrown when an invalid amount is provided
    error InvalidAmount();

    /// @dev Error thrown when a user has insufficient balance
    error InsufficientBalance();

    /// @dev Error thrown when a transfer fails
    error TransferFailed();

    /// @dev Error thrown when no yield is available
    error NoYieldAvailable();

    /// @dev Error thrown when an unauthorized address tries to call a restricted function
    error NotAuthorized();

    /**
     * @notice Constructs the MockYieldProtocol contract
     * @param _usdc The address of the USDC token contract
     */
    constructor(address _usdc) {
        if (_usdc == address(0)) revert InvalidToken();
        usdc = IERC20(_usdc);
    }

    /**
     * @notice Deposit USDC to start earning yield
     * @param amount Amount of USDC to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();

        // Update state before external calls
        deposits[msg.sender] += amount;
        depositTimestamps[msg.sender] = block.timestamp;

        // Transfer tokens after state updates
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Withdraw deposited USDC
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        if (deposits[msg.sender] < amount) revert InsufficientBalance();

        // Update state before external calls
        deposits[msg.sender] -= amount;

        // Transfer tokens after state updates
        usdc.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Calculate accrued yield for an address
     * @param user Address to calculate yield for
     * @return Accrued yield amount
     */
    function calculateYield(address user) public view returns (uint256) {
        if (deposits[user] == 0) return 0;

        uint256 timeElapsed = block.timestamp - depositTimestamps[user];
        uint256 principal = deposits[user];

        return (principal * APY * timeElapsed) / (APY_DENOMINATOR * SECONDS_PER_YEAR);
    }

    /**
     * @notice Manually generate yield for testing purposes
     * @param amount Amount of yield to generate
     */
    function generateYield(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();

        // Request USDC tokens from sender to simulate yield
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        emit YieldGenerated(amount);
    }

    /**
     * @notice Claim accrued yield
     * @return Amount of yield claimed
     */
    function claimYield() external nonReentrant returns (uint256) {
        uint256 yieldAmount = calculateYield(msg.sender);
        if (yieldAmount == 0) revert NoYieldAvailable();

        // Update state before external calls
        depositTimestamps[msg.sender] = block.timestamp;

        // Transfer tokens after state updates
        usdc.safeTransfer(msg.sender, yieldAmount);

        emit YieldClaimed(msg.sender, yieldAmount);
        return yieldAmount;
    }

    /**
     * @notice Distribute yield to a specific address
     * @param to The address to distribute yield to
     */
    function distributeYield(address to) external nonReentrant {
        if (to == address(0)) revert InvalidToken();
        if (deposits[to] == 0) revert InsufficientBalance();

        uint256 calculatedYield = calculateYield(to);
        if (calculatedYield == 0) revert NoYieldAvailable();

        // Update state before external calls
        depositTimestamps[to] = block.timestamp;

        // Transfer tokens after state updates
        usdc.safeTransfer(to, calculatedYield);

        emit YieldDistributed(to, calculatedYield);
    }
}
