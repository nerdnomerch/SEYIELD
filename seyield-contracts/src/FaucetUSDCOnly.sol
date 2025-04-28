// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FaucetUSDCOnly
 * @notice A faucet contract that only distributes USDC tokens (no SEI)
 * @dev This is a simplified version of the Faucet contract
 */
contract FaucetUSDCOnly is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice The USDC token contract
    IERC20 public immutable usdc;

    /// @notice Amount of USDC to distribute per claim (1000 USDC)
    uint256 public constant USDC_AMOUNT = 1_000e6;

    /// @notice Time interval between claims (24 hours)
    uint256 public constant CLAIM_INTERVAL = 24 hours;

    /// @notice Mapping of user last claim timestamps
    mapping(address => uint256) public lastClaimTime;

    /// @notice Emitted when tokens are claimed
    /// @param user The address that claimed tokens
    /// @param usdcAmount The amount of USDC claimed
    event TokensClaimed(address indexed user, uint256 usdcAmount);

    /// @notice Emitted when tokens are deposited
    /// @param depositor The address that deposited tokens
    /// @param usdcAmount The amount of USDC deposited
    event TokensDeposited(address indexed depositor, uint256 usdcAmount);

    /// @notice Emitted when tokens are withdrawn
    /// @param owner The address that withdrew tokens
    /// @param usdcAmount The amount of USDC withdrawn
    event TokensWithdrawn(address indexed owner, uint256 usdcAmount);

    /// @dev Error thrown when an invalid address is provided
    error InvalidAddress();

    /// @dev Error thrown when a user tries to claim too soon
    error ClaimTooSoon(uint256 nextClaimTime);

    /// @dev Error thrown when the contract has insufficient balance
    error InsufficientBalance(uint256 required, uint256 available);

    /// @dev Error thrown when a transfer fails
    error TransferFailed();

    /**
     * @notice Constructs the FaucetUSDCOnly contract
     * @param _usdc The address of the USDC token contract
     */
    constructor(address _usdc) Ownable(msg.sender) {
        if (_usdc == address(0)) revert InvalidAddress();
        usdc = IERC20(_usdc);
    }

    /**
     * @notice Allows users to claim USDC tokens from the faucet
     * @dev Users can only claim once per CLAIM_INTERVAL
     */
    function claimTokens() external nonReentrant {
        address sender = msg.sender;
        uint256 currentTime = block.timestamp;

        // Check if user can claim
        uint256 lastClaim = lastClaimTime[sender];
        if (lastClaim != 0) {
            uint256 nextClaimTime = lastClaim + CLAIM_INTERVAL;
            if (currentTime < nextClaimTime) {
                revert ClaimTooSoon(nextClaimTime);
            }
        }

        // Check contract balance
        address self = address(this);
        uint256 usdcBalance = usdc.balanceOf(self);
        if (usdcBalance < USDC_AMOUNT) {
            revert InsufficientBalance(USDC_AMOUNT, usdcBalance);
        }

        // Update state before external calls
        lastClaimTime[sender] = currentTime;

        // Transfer tokens
        usdc.safeTransfer(sender, USDC_AMOUNT);

        emit TokensClaimed(sender, USDC_AMOUNT);
    }

    /**
     * @notice Allows the owner to deposit USDC tokens into the faucet
     * @param usdcAmount The amount of USDC to deposit
     */
    function depositTokens(uint256 usdcAmount) external onlyOwner nonReentrant {
        address sender = msg.sender;

        if (usdcAmount > 0) {
            usdc.safeTransferFrom(sender, address(this), usdcAmount);
        }

        emit TokensDeposited(sender, usdcAmount);
    }

    /**
     * @notice Allows the owner to withdraw USDC tokens from the faucet
     * @param usdcAmount The amount of USDC to withdraw
     */
    function withdrawTokens(uint256 usdcAmount) external onlyOwner nonReentrant {
        address sender = msg.sender;

        if (usdcAmount > 0) {
            usdc.safeTransfer(sender, usdcAmount);
            emit TokensWithdrawn(sender, usdcAmount);
        }
    }

    /**
     * @notice Checks if a user can claim tokens
     * @param user The address of the user to check
     * @return Whether the user can claim tokens
     */
    function canClaimTokens(address user) external view returns (bool) {
        if (user == address(0)) revert InvalidAddress();

        uint256 lastClaim = lastClaimTime[user];
        // If user has never claimed, they can claim immediately
        if (lastClaim == 0) return true;
        return block.timestamp >= lastClaim + CLAIM_INTERVAL;
    }

    /**
     * @notice Get the time until a user can claim tokens again
     * @param user The address to check
     * @return The time in seconds until the user can claim again (0 if they can claim now)
     */
    function timeUntilNextClaim(address user) external view returns (uint256) {
        if (user == address(0)) revert InvalidAddress();

        uint256 lastClaim = lastClaimTime[user];
        // If user has never claimed, they can claim immediately
        if (lastClaim == 0) return 0;

        uint256 nextClaimTime = lastClaim + CLAIM_INTERVAL;
        if (block.timestamp >= nextClaimTime) return 0;
        return nextClaimTime - block.timestamp;
    }
}
