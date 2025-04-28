// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {FundsVault} from "../src/Vault.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {MockYieldProtocol} from "../src/MockYieldProtocol.sol";
import {PSYLD} from "../src/PSYLD.sol";
import {YSYLD} from "../src/YSYLD.sol";
import {Treasury} from "../src/Treasury.sol";

contract FundsVaultTest is Test {
    FundsVault public vault;
    MockUSDC public usdc;
    MockYieldProtocol public yieldProtocol;
    PSYLD public pSYLD;
    YSYLD public ySYLD;
    Treasury public treasury;

    address public constant OWNER = address(0x1);
    address public constant USER = address(0x2);
    uint256 public constant INITIAL_BALANCE = 100_000e6; // 100,000 USDC
    uint256 public constant DEPOSIT_AMOUNT = 1_000e6; // 1,000 USDC
    uint256 public constant YIELD_AMOUNT = 100e6; // 100 USDC for yield testing

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 fee);
    event YieldHarvested(uint256 amount);
    event PoolDeployed(uint256 amount, uint256 timestamp);

    function setUp() public {
        vm.startPrank(OWNER);

        usdc = new MockUSDC();
        pSYLD = new PSYLD();
        ySYLD = new YSYLD();
        treasury = new Treasury(address(usdc));
        yieldProtocol = new MockYieldProtocol(address(usdc));

        // Assuming your current constructor takes these parameters
        FundsVault.InitialSetup memory setup = FundsVault.InitialSetup({
            _initialOwner: OWNER,
            _usdc: address(usdc),
            _yieldProtocol: address(yieldProtocol),
            _treasury: address(treasury),
            _pSYLD: address(pSYLD),
            _ySYLD: address(ySYLD)
        });

        vault = new FundsVault(setup);

        pSYLD.setFundsVault(address(vault));
        ySYLD.setFundsVault(address(vault));

        // Transfer initial USDC to USER
        usdc.transfer(USER, INITIAL_BALANCE);

        vm.stopPrank();
    }

    function testInitialState() public view {
        assertEq(address(vault.pSYLD()), address(pSYLD));
        assertEq(address(vault.ySYLD()), address(ySYLD));
        assertEq(vault.getPooledAmount(), 0);
    }

    function testDeposit() public {
        vm.startPrank(USER);
        usdc.approve(address(vault), DEPOSIT_AMOUNT);

        vm.expectEmit(true, true, true, true);
        emit Deposited(USER, DEPOSIT_AMOUNT);

        vault.deposit(DEPOSIT_AMOUNT);

        assertEq(pSYLD.balanceOf(USER), DEPOSIT_AMOUNT);
        // ySYLD tokens are now minted directly to the user, not kept in the vault
        assertEq(ySYLD.balanceOf(USER), DEPOSIT_AMOUNT * 7 / 100);
        assertEq(vault.getPooledAmount(), DEPOSIT_AMOUNT);

        vm.stopPrank();
    }

    function testPoolDeploymentAfter24Hours() public {
        vm.startPrank(USER);
        usdc.approve(address(vault), DEPOSIT_AMOUNT);
        vault.deposit(DEPOSIT_AMOUNT);

        // Advance time by 24 hours
        vm.warp(block.timestamp + 24 hours);

        // Next deposit should trigger pool deployment
        usdc.approve(address(vault), DEPOSIT_AMOUNT);

        vm.expectEmit(true, true, true, true);
        emit PoolDeployed(DEPOSIT_AMOUNT * 2, block.timestamp);

        vault.deposit(DEPOSIT_AMOUNT);

        vm.stopPrank();
    }

    function testWithdrawalWithinLockPeriod() public {
        vm.startPrank(USER);
        usdc.approve(address(vault), DEPOSIT_AMOUNT);
        vault.deposit(DEPOSIT_AMOUNT);

        // Try to withdraw within lock period
        uint256 expectedFee = DEPOSIT_AMOUNT * 5 / 100; // Changed from 10000 to 100 based on your EARLY_WITHDRAWAL_FEE
        uint256 expectedWithdraw = DEPOSIT_AMOUNT - expectedFee;

        vm.expectEmit(true, true, true, true);
        emit Withdrawn(USER, expectedWithdraw, expectedFee);

        vault.withdraw(DEPOSIT_AMOUNT);

        assertEq(usdc.balanceOf(USER), INITIAL_BALANCE - expectedFee);
        assertEq(usdc.balanceOf(address(treasury)), expectedFee);

        vm.stopPrank();
    }

    function testWithdrawalAfterLockPeriod() public {
        vm.startPrank(USER);
        usdc.approve(address(vault), DEPOSIT_AMOUNT);
        vault.deposit(DEPOSIT_AMOUNT);

        // Advance time beyond lock period
        vm.warp(block.timestamp + 31 days);

        vm.expectEmit(true, true, true, true);
        emit Withdrawn(USER, DEPOSIT_AMOUNT, 0);

        vault.withdraw(DEPOSIT_AMOUNT);

        assertEq(usdc.balanceOf(USER), INITIAL_BALANCE);
        assertEq(usdc.balanceOf(address(treasury)), 0);

        vm.stopPrank();
    }

    function testYieldHarvesting() public {
        // Setup initial deposit
        vm.startPrank(USER);
        usdc.approve(address(vault), DEPOSIT_AMOUNT);
        vault.deposit(DEPOSIT_AMOUNT);
        vm.stopPrank();

        // Generate yield (from owner)
        vm.startPrank(OWNER);
        usdc.approve(address(yieldProtocol), YIELD_AMOUNT);
        yieldProtocol.generateYield(YIELD_AMOUNT);

        // Mock the yield protocol behavior
        // Transfer USDC directly to the vault to simulate yield
        usdc.transfer(address(vault), YIELD_AMOUNT);

        // Mock the claimYield function to return YIELD_AMOUNT
        vm.mockCall(
            address(yieldProtocol),
            abi.encodeWithSelector(MockYieldProtocol.claimYield.selector),
            abi.encode(YIELD_AMOUNT)
        );

        // Harvest yield
        vm.expectEmit(true, true, true, true);
        emit YieldHarvested(YIELD_AMOUNT);

        vault.harvestYield();
        vm.stopPrank();

        assertEq(usdc.balanceOf(address(treasury)), YIELD_AMOUNT);
    }

    function test_RevertWhen_ZeroDeposit() public {
        vm.prank(USER);
        vm.expectRevert(abi.encodeWithSignature("InvalidAmount()"));
        vault.deposit(0);
    }

    function test_RevertWhen_ZeroWithdrawal() public {
        vm.prank(USER);
        vm.expectRevert(abi.encodeWithSignature("InvalidAmount()"));
        vault.withdraw(0);
    }

    function test_RevertWhen_WithdrawMoreThanBalance() public {
        vm.startPrank(USER);
        usdc.approve(address(vault), DEPOSIT_AMOUNT);
        vault.deposit(DEPOSIT_AMOUNT);

        vm.expectRevert(abi.encodeWithSignature("InsufficientBalance()"));
        vault.withdraw(DEPOSIT_AMOUNT + 1);
        vm.stopPrank();
    }

    function test_RevertWhen_UnauthorizedYieldHarvest() public {
        vm.prank(USER);
        // This will revert with Ownable's unauthorized error
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", USER));
        vault.harvestYield();
    }
}
