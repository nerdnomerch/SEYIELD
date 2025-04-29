// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {MockUSDC} from "../src/MockUSDC.sol";
import {MockYieldProtocol} from "../src/MockYieldProtocol.sol";
import {PSYLD} from "../src/PSYLD.sol";
import {YSYLD} from "../src/YSYLD.sol";
import {Treasury} from "../src/Treasury.sol";
import {FundsVault} from "../src/Vault.sol";
import {Faucet} from "../src/Faucet.sol";
import {Merchant} from "../src/Merchant.sol";

/**
 * @title DeploySEI
 * @notice Script to deploy all SEYIELD contracts to the SEI testnet
 * @dev This script deploys all contracts in the correct order and sets up their relationships
 */
contract DeploySEI is Script {
    // Contract instances
    MockUSDC public usdc;
    MockYieldProtocol public yieldProtocol;
    PSYLD public pSYLD;
    YSYLD public ySYLD;
    Treasury public treasury;
    FundsVault public fundsVault;
    Faucet public faucet;
    Merchant public merchant;

    // Deployment addresses
    address public deployer;

    // Constants
    uint256 public constant FAUCET_USDC_AMOUNT = 1_000_000e6; // 1M USDC for faucet
    uint256 public constant TREASURY_USDC_AMOUNT = 1_000_000e6; // 1M USDC for treasury

    function run() public {
        // Get private key from environment variable or use hardcoded one for testing
        uint256 deployerPrivateKey;

        // UNCOMMENT ONE OF THESE OPTIONS:

        // OPTION 1: Use environment variable (recommended for production)
        // deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // OPTION 2: Hardcoded private key (FOR TESTING ONLY - NEVER USE IN PRODUCTION)
        deployerPrivateKey = "dont-steal-man"
        // WARNING: Using hardcoded private key for testing. NEVER use in production!

        // Get deployer address
        deployer = vm.addr(deployerPrivateKey);

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy token contracts
        deployTokens();

        // Step 2: Deploy core protocol contracts
        deployProtocol();

        // Step 3: Deploy auxiliary contracts
        deployAuxiliary();

        // Step 4: Configure contract relationships
        setupContractRelationships();

        // Step 5: Fund contracts
        fundContracts();

        // End broadcasting transactions
        vm.stopBroadcast();

        // Log all deployed contract addresses
        logDeployedAddresses();
    }

    /**
     * @notice Deploy token contracts (USDC, pSYLD, ySYLD)
     */
    function deployTokens() internal {
        // Deploy MockUSDC - this will automatically mint 1,000,000 USDC to the deployer
        usdc = new MockUSDC();

        // Deploy pSYLD token
        pSYLD = new PSYLD();

        // Deploy ySYLD token
        ySYLD = new YSYLD();
    }

    /**
     * @notice Deploy core protocol contracts (Treasury, YieldProtocol, FundsVault)
     */
    function deployProtocol() internal {
        // Deploy Treasury
        treasury = new Treasury(address(usdc));

        // Deploy MockYieldProtocol
        yieldProtocol = new MockYieldProtocol(address(usdc));

        // Deploy FundsVault
        FundsVault.InitialSetup memory setup = FundsVault.InitialSetup({
            _initialOwner: deployer,
            _usdc: address(usdc),
            _yieldProtocol: address(yieldProtocol),
            _treasury: address(treasury),
            _pSYLD: address(pSYLD),
            _ySYLD: address(ySYLD)
        });

        fundsVault = new FundsVault(setup);
    }

    /**
     * @notice Deploy auxiliary contracts (Faucet, Merchant)
     */
    function deployAuxiliary() internal {
        // Deploy Faucet
        faucet = new Faucet(address(usdc));

        // Deploy Merchant
        merchant = new Merchant(
            address(usdc),
            address(ySYLD),
            address(fundsVault),
            address(treasury),
            deployer
        );
    }

    /**
     * @notice Set up relationships between contracts
     */
    function setupContractRelationships() internal {
        // Set FundsVault in token contracts
        pSYLD.setFundsVault(address(fundsVault));

        ySYLD.setFundsVault(address(fundsVault));

        // Set Merchant contract in ySYLD to allow burning tokens
        ySYLD.setMerchantContract(address(merchant));

        // Grant Merchant contract permission to use Treasury
        treasury.transferOwnership(address(merchant));
    }

    /**
     * @notice Fund contracts with initial tokens
     */
    function fundContracts() internal {
        // Check deployer's USDC balance
        uint256 deployerUsdcBalance = usdc.balanceOf(deployer);

        // Fund Faucet with USDC
        usdc.transfer(address(faucet), FAUCET_USDC_AMOUNT);

        // Fund Treasury with USDC for initial operations
        usdc.transfer(address(treasury), TREASURY_USDC_AMOUNT);
    }

    /**
     * @notice Log all deployed contract addresses for easy reference
     */
    function logDeployedAddresses() internal view {
        console.log("=== SEYIELD DEPLOYMENT ADDRESSES ===");
        console.log("Deployer:          ", deployer);
        console.log("------------------------");
        console.log("Token Contracts:");
        console.log("------------------------");
        console.log("USDC:              ", address(usdc));
        console.log("pSYLD:             ", address(pSYLD));
        console.log("ySYLD:             ", address(ySYLD));
        console.log("------------------------");
        console.log("Core Contracts:");
        console.log("------------------------");
        console.log("Treasury:          ", address(treasury));
        console.log("YieldProtocol:     ", address(yieldProtocol));
        console.log("FundsVault:        ", address(fundsVault));
        console.log("------------------------");
        console.log("Auxiliary Contracts:");
        console.log("------------------------");
        console.log("Faucet:            ", address(faucet));
        console.log("Merchant:          ", address(merchant));
        console.log("=================================");
    }
}
