# USDC-Only Faucet Deployment Guide

This guide explains how to deploy the USDC-only faucet contract to the SEI Testnet.

## Overview

The `FaucetUSDCOnly` contract is a simplified version of the original `Faucet` contract that only distributes USDC tokens (no SEI). This addresses the "Insufficient SEI balance" error that users were experiencing with the original faucet.

## Prerequisites

1. Make sure you have Foundry installed
2. Set up your `.env` file with the following variables:
   - `PRIVATE_KEY`: Your private key for deployment
   - `USDC_ADDRESS`: The address of the USDC token contract on SEI Testnet

## Deployment Steps

1. Run the deployment script:

```bash
make deploy-usdc-only-faucet
```

2. After deployment, note the new faucet address from the console output.

3. Update the faucet address in your frontend configuration:

```typescript
// seyield-frontend/app/config/contract-addresses.ts
export const contractAddresses = {
  // ...other addresses
  faucet: '0xYourNewFaucetAddress', // Update this with the new address
}
```

## Funding the Faucet

The deployment script will attempt to fund the faucet with USDC if your deployer account has sufficient balance. If not, you'll need to fund it manually:

1. Approve the faucet to spend your USDC:

```solidity
// Using ethers.js or similar
const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, signer);
await usdcContract.approve(faucetAddress, ethers.utils.parseUnits("100000", 6));
```

2. Call the `depositTokens` function on the faucet:

```solidity
const faucetContract = new ethers.Contract(faucetAddress, faucetAbi, signer);
await faucetContract.depositTokens(ethers.utils.parseUnits("100000", 6));
```

## Testing

You can run the tests for the USDC-only faucet with:

```bash
forge test --match-contract FaucetUSDCOnlyTest -vvv
```

## Verification

To verify the contract on the SEI Testnet explorer:

```bash
make verify-sei CONTRACT_ADDRESS=0xYourNewFaucetAddress CONTRACT_NAME=FaucetUSDCOnly
```

## Troubleshooting

If users encounter any issues with the faucet:

1. Check the faucet's USDC balance to ensure it has enough tokens to distribute
2. Verify that users are waiting at least 24 hours between claims
3. Check the console logs in the browser for detailed error messages
