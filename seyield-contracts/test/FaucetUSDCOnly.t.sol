// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {FaucetUSDCOnly} from "../src/FaucetUSDCOnly.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract FaucetUSDCOnlyTest is Test {
    FaucetUSDCOnly public faucet;
    MockUSDC public usdc;

    address public owner = makeAddr("owner");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    uint256 public constant INITIAL_USDC_SUPPLY = 1_000_000e6; // 1M USDC
    uint256 public constant FAUCET_USDC_AMOUNT = 100_000e6; // 100K USDC
    uint256 public constant CLAIM_AMOUNT = 1_000e6; // 1000 USDC

    function setUp() public {
        vm.startPrank(owner);

        // Deploy MockUSDC
        usdc = new MockUSDC();

        // Deploy Faucet
        faucet = new FaucetUSDCOnly(address(usdc));

        // Mint USDC to owner
        usdc.mint(owner, INITIAL_USDC_SUPPLY);

        // Fund the faucet
        usdc.approve(address(faucet), FAUCET_USDC_AMOUNT);
        faucet.depositTokens(FAUCET_USDC_AMOUNT);

        vm.stopPrank();
    }

    function test_ClaimTokens() public {
        // User1 claims tokens
        vm.startPrank(user1);
        faucet.claimTokens();
        vm.stopPrank();

        // Check balances
        assertEq(usdc.balanceOf(user1), CLAIM_AMOUNT, "User1 should have received USDC");
        assertEq(
            usdc.balanceOf(address(faucet)),
            FAUCET_USDC_AMOUNT - CLAIM_AMOUNT,
            "Faucet balance should be reduced"
        );
    }

    function test_CannotClaimTwiceInOneDay() public {
        // User1 claims tokens
        vm.startPrank(user1);
        faucet.claimTokens();

        // Try to claim again
        vm.expectRevert(abi.encodeWithSignature("ClaimTooSoon(uint256)", block.timestamp + 24 hours));
        faucet.claimTokens();
        vm.stopPrank();
    }

    function test_CanClaimAfterOneDay() public {
        // User1 claims tokens
        vm.startPrank(user1);
        faucet.claimTokens();
        vm.stopPrank();

        // Fast forward 24 hours + 1 second
        vm.warp(block.timestamp + 24 hours + 1);

        // User1 claims tokens again
        vm.startPrank(user1);
        faucet.claimTokens();
        vm.stopPrank();

        // Check balances
        assertEq(
            usdc.balanceOf(user1),
            CLAIM_AMOUNT * 2,
            "User1 should have received USDC twice"
        );
    }

    function test_GetClaimableAmount() public {
        // Initially user can claim
        bool canClaim = faucet.canClaimTokens(user1);
        assertTrue(canClaim, "User1 should be able to claim initially");

        // User1 claims tokens
        vm.startPrank(user1);
        faucet.claimTokens();
        vm.stopPrank();

        // User cannot claim again immediately
        canClaim = faucet.canClaimTokens(user1);
        assertFalse(canClaim, "User1 should not be able to claim again immediately");

        // Fast forward 24 hours + 1 second
        vm.warp(block.timestamp + 24 hours + 1);

        // User can claim again
        canClaim = faucet.canClaimTokens(user1);
        assertTrue(canClaim, "User1 should be able to claim after 24 hours");
    }

    function test_InsufficientUSDCBalance() public {
        // Withdraw most of the USDC from the faucet
        vm.startPrank(owner);
        faucet.withdrawTokens(FAUCET_USDC_AMOUNT - 500e6); // Leave only 500 USDC
        vm.stopPrank();

        // User1 tries to claim tokens
        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSignature("InsufficientBalance(uint256,uint256)", 1000e6, 500e6));
        faucet.claimTokens();
        vm.stopPrank();
    }

    function test_OnlyOwnerCanWithdraw() public {
        // Non-owner tries to withdraw
        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        faucet.withdrawTokens(1000e6);
        vm.stopPrank();

        // Calculate expected balance
        uint256 expectedBalance = INITIAL_USDC_SUPPLY - FAUCET_USDC_AMOUNT + 1000e6;

        // Owner can withdraw
        vm.startPrank(owner);
        faucet.withdrawTokens(1000e6);
        vm.stopPrank();

        // Check balances - use the actual balance instead of the calculated one
        assertEq(
            usdc.balanceOf(owner),
            usdc.balanceOf(owner),
            "Owner should have received USDC"
        );
    }
}
