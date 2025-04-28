// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Treasury
 * @notice Contract for managing protocol fees and payments
 * @dev Holds USDC tokens and distributes them to merchants and other recipients
 */
contract Treasury is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice The USDC token contract
    IERC20 public immutable usdc;

    /// @dev Error thrown when an invalid address is provided
    error InvalidAddress();

    /// @dev Error thrown when a transfer fails
    error TransferFailed();

    /// @notice Emitted when a fee is collected
    /// @param from The address the fee was collected from
    /// @param amount The amount of USDC collected
    event FeeCollected(address indexed from, uint256 amount);

    /// @notice Emitted when USDC is transferred
    /// @param to The recipient of the USDC
    /// @param amount The amount of USDC transferred
    event USDCTransferred(address indexed to, uint256 amount);

    /**
     * @notice Constructs the Treasury contract
     * @param _usdc The address of the USDC token contract
     */
    constructor(address _usdc) Ownable(msg.sender) {
        if (_usdc == address(0)) {
            revert InvalidAddress();
        }
        usdc = IERC20(_usdc);
    }

    /**
     * @notice Collects a fee from the caller
     * @param amount The amount of USDC to collect
     * @dev The caller must have approved the Treasury to spend their USDC
     */
    function collectFee(uint256 amount) external nonReentrant {
        address sender = msg.sender;
        usdc.safeTransferFrom(sender, address(this), amount);
        emit FeeCollected(sender, amount);
    }

    /**
     * @notice Transfers USDC to a recipient
     * @param to The recipient address
     * @param amount The amount of USDC to transfer
     * @dev Can only be called by the contract owner
     */
    function transferUSDC(address to, uint256 amount) external onlyOwner nonReentrant {
        if (to == address(0)) {
            revert InvalidAddress();
        }
        usdc.safeTransfer(to, amount);
        emit USDCTransferred(to, amount);
    }

    /**
     * @notice Returns the USDC balance of the Treasury
     * @return The USDC balance
     */
    function getBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
