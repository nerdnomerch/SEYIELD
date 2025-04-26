# Deployment Guide for SEI Testnet

This guide provides step-by-step instructions for deploying the SEYIELD contracts to the SEI testnet.

## Prerequisites

1. [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
2. A wallet with SEI testnet tokens (for gas fees)
3. Basic knowledge of Solidity and blockchain deployments

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/seyro-sei.git
   cd seyro-sei/seyro-contracts
   ```

2. Install dependencies:
   ```bash
   forge install
   ```

3. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file and add your private key (without the `0x` prefix):
   ```
   PRIVATE_KEY=your_private_key_here
   ```

## Deployment

### Option 1: Using the No-SEI Script (Recommended)

We've created a deployment script that doesn't fund the Faucet with SEI tokens, avoiding the OutOfFunds error:

```bash
make deploy-sei-testnet-no-sei
```

This script:
- Uses a hardcoded private key for testing (you should replace it with your own in production)
- Only funds contracts with USDC, not SEI
- Uses console2.log for proper logging
- Provides detailed logs and next steps

### Option 2: Using the Original Script

If you prefer to use the original script:

```bash
make deploy-sei-testnet
```

**Note:** This requires your private key in the `.env` file to have the `0x` prefix and may fail if you don't have enough SEI.

### Option 3: Manual Deployment

If you prefer to deploy manually:

```bash
source .env
forge script script/DeploySEI_NoSEI.s.sol:DeploySEI --rpc-url https://evm-rpc-testnet.sei-apis.com --broadcast --verify -vvvv
```

## Verification

After deployment, you can verify the contracts on the SEI testnet explorer:

```bash
make verify-sei CONTRACT_ADDRESS=<address> CONTRACT_NAME=<name>
```

Replace `<address>` with the deployed contract address and `<name>` with the contract name (e.g., `FundsVault`).

## Contract Addresses

After deployment, update your `.env` file with the deployed contract addresses. The script will output these addresses in the console.

## Testing the Deployment

1. **Test the Faucet**:
   - Visit the SEI testnet explorer
   - Connect your wallet
   - Call the `claimTokens` function on the Faucet contract

2. **Test the FundsVault**:
   - Approve USDC for the FundsVault
   - Deposit USDC into the FundsVault
   - Check your pSYLD balance

3. **Test the Merchant**:
   - Register as a merchant
   - List an item
   - Purchase an item (as a user with sufficient ySYLD)

## Troubleshooting

### Common Deployment Issues

#### 1. OutOfFunds Error

```
[OutOfFunds] EvmError: OutOfFunds
revert: Failed to send SEI to Faucet
```

This error occurs when the deployer doesn't have enough SEI to fund the Faucet. We've created a new script (`DeploySEI_NoSEI.s.sol`) that doesn't attempt to fund the Faucet with SEI, avoiding this error completely. Use the `deploy-sei-testnet-no-sei` command to deploy with this script.

#### 2. Private Key Format Error

```
vm.envUint: failed parsing $PRIVATE_KEY as type `uint256`: missing hex prefix ("0x") for hex string
```

This error occurs when your private key in the `.env` file doesn't have the `0x` prefix. Make sure your private key includes the `0x` prefix, or use the fixed script which handles this issue.

#### 3. Console Log Error

```
Error (9582): Member "log" not found or not visible after argument-dependent lookup in type(library console).
```

This error occurs when using `console.log` instead of `console2.log` in the deployment script. We've fixed this in the `DeploySEI_Fixed2.s.sol` script by using the correct import and function calls.

#### 4. RPC Connection Issues

```
Error: could not fetch chain ID from the RPC API
```

This error occurs when the RPC URL is incorrect or the SEI testnet is experiencing issues. Try using a different RPC URL or wait and try again later.

### Other Common Issues

- **Insufficient Gas**: Make sure your wallet has enough SEI testnet tokens for gas fees
- **Failed Transactions**: Check the error message in the console output
- **Contract Verification Fails**: Make sure you're using the correct contract name and address

## Contract Architecture

The deployment script deploys the following contracts in this order:

1. **Token Contracts**:
   - MockUSDC: A mock USDC token for testing
   - PSYLD: Principal SEYIELD token received by users when depositing
   - YSYLD: Yield SEYIELD token received by the platform

2. **Core Protocol**:
   - Treasury: Manages protocol fees and payments
   - MockYieldProtocol: Simulates a yield-generating protocol
   - FundsVault: Main contract for user deposits and yield management

3. **Auxiliary Contracts**:
   - Faucet: Provides test tokens to users
   - Merchant: Manages marketplace listings and purchases

The script also sets up the relationships between these contracts and funds them with initial tokens.
