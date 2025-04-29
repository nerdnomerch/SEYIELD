// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {FaucetUSDCOnly} from "../src/FaucetUSDCOnly.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title FundFaucetNoMint
 * @notice Script to fund the faucet with USDC (without trying to mint)
 * @dev This script transfers USDC from the deployer to an existing faucet contract
 */
contract FundFaucetNoMint is Script {
    // Constants
    uint256 public constant FAUCET_USDC_AMOUNT = 500_000e6; // 100K USDC
    
    // Hardcoded addresses (update these with your actual addresses)
    address public constant USDC_ADDRESS = 0x855036d27d0B0691ac6FC8A958fF90d394Db9b62;
    address public constant FAUCET_ADDRESS = 0x9Cf81348F36C9EdD04C54BF190012C49fbB0822a;

    function run() external {
        // OPTION 1: Use environment variable (recommended for production)
        // uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // address usdcAddress = vm.envAddress("USDC_ADDRESS");
        // address faucetAddress = vm.envAddress("FAUCET_ADDRESS");
        
        // OPTION 2: Hardcoded values (FOR TESTING ONLY - NEVER USE IN PRODUCTION)
        uint256 deployerPrivateKey = uint256(
            "dont-steal-man"
        );
        address usdcAddress = USDC_ADDRESS;
        address faucetAddress = FAUCET_ADDRESS;
        
        // WARNING: Using hardcoded private key. NEVER use in production!

        // Get deployer address
        address deployer = vm.addr(deployerPrivateKey);
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Get the USDC contract
        IERC20 usdc = IERC20(usdcAddress);
        
        // Check USDC balance of deployer
        uint256 deployerBalance = usdc.balanceOf(deployer);
        
        // Check if deployer has enough USDC
        if (deployerBalance >= FAUCET_USDC_AMOUNT) {
            // Approve the faucet to spend USDC
            usdc.approve(faucetAddress, FAUCET_USDC_AMOUNT);
            
            // Fund the faucet
            FaucetUSDCOnly faucet = FaucetUSDCOnly(faucetAddress);
            faucet.depositTokens(FAUCET_USDC_AMOUNT);
        }
        
        vm.stopBroadcast();
    }
}
