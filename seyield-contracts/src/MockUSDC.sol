// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice A mock USDC token for testing purposes
 * @dev This contract is only for testing and should not be used in production
 */
contract MockUSDC is ERC20 {
    /**
     * @notice Constructs the MockUSDC token and mints initial supply
     */
    constructor() ERC20("SEYIELD USDC", "USDC") {
        _mint(msg.sender, 1_000_000_000 * 1e6); // Mint 1,000,000 USDC with 6 decimals
    }

    /**
     * @notice Mints new tokens to the specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     * @dev This function is only for testing
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Returns the number of decimals used by the token
     * @return The number of decimals (6)
     */
    function decimals() public view override returns(uint8) {
        return 6;
    }
}
