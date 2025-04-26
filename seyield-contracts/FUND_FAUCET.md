# Funding the USDC-Only Faucet

This guide explains how to fund the USDC-only faucet contract with USDC tokens.

## Problem: "Insufficient USDC balance"

If users are seeing the error "Insufficient USDC balance" when trying to claim from the faucet, it means the faucet contract doesn't have enough USDC tokens to fulfill the claim requests.

## Solution: Fund the Faucet

There are three different ways to fund the faucet. Choose the one that works best for you.

### Option 1: Using Foundry with Environment Variables

#### Prerequisites

1. Make sure you have Foundry installed
2. Set up your `.env` file with the following variables:
   - `PRIVATE_KEY`: Your private key for deployment
   - `USDC_ADDRESS`: The address of the USDC token contract on SEI Testnet
   - `FAUCET_ADDRESS`: The address of the faucet contract on SEI Testnet

Example `.env` file:
```
PRIVATE_KEY=your_private_key_here
USDC_ADDRESS=0x855036d27d0B0691ac6FC8A958fF90d394Db9b62
FAUCET_ADDRESS=0x56fCEf10AAE54E7e7325eF6Eb1C1eF175C7034aD
```

#### Funding Steps

1. Run the funding script:

```bash
make fund-faucet
```

### Option 2: Using Foundry with Hardcoded Addresses (No Mint)

#### Prerequisites

1. Make sure you have Foundry installed
2. Set up your `.env` file with just your private key:
   - `PRIVATE_KEY`: Your private key for deployment

#### Funding Steps

1. Run the simplified funding script that doesn't try to mint tokens:

```bash
make fund-faucet-no-mint
```

This script uses the standard IERC20 interface and doesn't attempt to mint tokens, which should avoid the "Member 'mint' not found" error.

### Option 3: Using Node.js (Easiest)

#### Prerequisites

1. Make sure you have Node.js installed
2. Install the required dependencies:

```bash
cd seyield-contracts
npm install
```

3. Set up your `.env` file with just your private key:
   - `PRIVATE_KEY`: Your private key for deployment

#### Funding Steps

1. Run the Node.js funding script:

```bash
npm run fund-faucet
```

### What These Scripts Do

All of these scripts will:
- Check your USDC balance
- Verify you have enough USDC to fund the faucet
- Approve the faucet to spend your USDC
- Call the `depositTokens` function on the faucet to transfer the USDC

Verify the funding was successful by checking the faucet's USDC balance in the console output.

### Getting USDC Tokens

Since the scripts no longer attempt to mint USDC tokens (which was causing errors), you'll need to acquire USDC tokens before running the scripts. Here are some ways to get USDC on the SEI Testnet:

1. Use a faucet that distributes USDC tokens
2. Ask a team member who has USDC tokens to send you some
3. If you have admin access to the USDC contract, you can mint tokens using a separate script or contract call

## Manual Funding

If you prefer to fund the faucet manually or the script doesn't work, you can:

1. Get USDC tokens (either by minting or from another source)
2. Approve the faucet to spend your USDC:

```javascript
// Using ethers.js
const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, signer);
await usdcContract.approve(faucetAddress, ethers.utils.parseUnits("100000", 6));
```

3. Call the `depositTokens` function on the faucet:

```javascript
const faucetContract = new ethers.Contract(faucetAddress, faucetAbi, signer);
await faucetContract.depositTokens(ethers.utils.parseUnits("100000", 6));
```

## Checking Faucet Balance

You can check the faucet's USDC balance using the SEI Testnet explorer:

1. Go to [https://sei.explorers.guru/](https://sei.explorers.guru/)
2. Search for the USDC token contract address
3. Look for the "Holders" tab
4. Find the faucet address in the list of holders

Alternatively, you can use the following code to check the balance:

```javascript
const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);
const balance = await usdcContract.balanceOf(faucetAddress);
console.log(`Faucet USDC balance: ${ethers.utils.formatUnits(balance, 6)} USDC`);
```

## Troubleshooting

If you're still having issues:

1. Make sure you have the correct USDC and faucet addresses
2. Verify that you have permission to mint USDC tokens (if needed)
3. Check that you have enough gas to execute the transactions
4. Ensure your private key has enough SEI tokens to pay for gas
