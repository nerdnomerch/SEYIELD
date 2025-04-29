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
import {FaucetUSDCOnly} from "../src/FaucetUSDCOnly.sol";
import {Merchant} from "../src/Merchant.sol";

/**
 * @title DeploySEI
 * @notice Script to deploy all SEYIELD contracts to the SEI testnet without SEI funding
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
    FaucetUSDCOnly public faucet;
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
        deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // OPTION 2: Hardcoded private key (FOR TESTING ONLY - NEVER USE IN PRODUCTION)
        // deployerPrivateKey = 0x7d619c10e25c137bacd56300ee7919b1097325748e45be7a67a4826eade961e7;
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
        // Deploy USDC-only Faucet
        faucet = new FaucetUSDCOnly(address(usdc));

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
        console.log("Faucet (USDC Only): ", address(faucet));
        console.log("Merchant:          ", address(merchant));
        console.log("=================================");
        
        // Save addresses to a file for easy reference
        string memory addressesJson = string(abi.encodePacked(
            '{\n',
            '  "deployer": "', addressToString(deployer), '",\n',
            '  "tokens": {\n',
            '    "usdc": "', addressToString(address(usdc)), '",\n',
            '    "pSYLD": "', addressToString(address(pSYLD)), '",\n',
            '    "ySYLD": "', addressToString(address(ySYLD)), '"\n',
            '  },\n',
            '  "core": {\n',
            '    "treasury": "', addressToString(address(treasury)), '",\n',
            '    "yieldProtocol": "', addressToString(address(yieldProtocol)), '",\n',
            '    "fundsVault": "', addressToString(address(fundsVault)), '"\n',
            '  },\n',
            '  "auxiliary": {\n',
            '    "faucet": "', addressToString(address(faucet)), '",\n',
            '    "merchant": "', addressToString(address(merchant)), '"\n',
            '  }\n',
            '}'
        ));
        
        vm.writeFile("deployment_addresses.json", addressesJson);
        console.log("Addresses saved to deployment_addresses.json");
    }
    
    /**
     * @notice Helper function to convert address to string
     */
    function addressToString(address _addr) internal pure returns (string memory) {
        bytes memory s = new bytes(42);
        s[0] = '0';
        s[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(_addr)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2+2*i] = char(hi);
            s[2+2*i+1] = char(lo);            
        }
        return string(s);
    }
    
    /**
     * @notice Helper function to convert byte to char
     */
    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
