// This script can be used to fund the faucet with USDC
// Run with: node scripts/fund-faucet.js

const { ethers } = require('ethers');
require('dotenv').config();

// Configuration
const USDC_ADDRESS = '0x855036d27d0B0691ac6FC8A958fF90d394Db9b62';
const FAUCET_ADDRESS = '0x56fCEf10AAE54E7e7325eF6Eb1C1eF175C7034aD';
const AMOUNT_TO_FUND = ethers.utils.parseUnits('100000', 6); // 100,000 USDC

// ABI for the USDC token (ERC20)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function mint(address to, uint256 amount)',
];

// ABI for the Faucet contract
const FAUCET_ABI = [
  'function depositTokens(uint256 usdcAmount)',
];

async function main() {
  try {
    // Connect to the provider
    const provider = new ethers.providers.JsonRpcProvider('wss://evm-ws-testnet.sei-apis.com');

    // Create a wallet from the private key
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error('Error: PRIVATE_KEY not found in .env file');
      process.exit(1);
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`Connected with address: ${wallet.address}`);

    // Create contract instances
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, wallet);
    const faucetContract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, wallet);

    // Check balances
    const deployerBalance = await usdcContract.balanceOf(wallet.address);
    console.log(`Deployer USDC balance: ${ethers.utils.formatUnits(deployerBalance, 6)} USDC`);

    const faucetBalance = await usdcContract.balanceOf(FAUCET_ADDRESS);
    console.log(`Faucet USDC balance before funding: ${ethers.utils.formatUnits(faucetBalance, 6)} USDC`);

    // Check if deployer has enough USDC
    if (deployerBalance.lt(AMOUNT_TO_FUND)) {
      console.error(`Insufficient USDC balance to fund the faucet.`);
      console.log(`Required: ${ethers.utils.formatUnits(AMOUNT_TO_FUND, 6)} USDC`);
      console.log(`Available: ${ethers.utils.formatUnits(deployerBalance, 6)} USDC`);
      console.log(`Please acquire more USDC before running this script again.`);
      process.exit(1);
    }

    // Approve the faucet to spend USDC
    console.log(`Approving faucet to spend ${ethers.utils.formatUnits(AMOUNT_TO_FUND, 6)} USDC`);
    const approveTx = await usdcContract.approve(FAUCET_ADDRESS, AMOUNT_TO_FUND);
    await approveTx.wait();
    console.log(`Approve transaction: ${approveTx.hash}`);

    // Fund the faucet
    console.log(`Funding faucet with ${ethers.utils.formatUnits(AMOUNT_TO_FUND, 6)} USDC`);
    const fundTx = await faucetContract.depositTokens(AMOUNT_TO_FUND);
    await fundTx.wait();
    console.log(`Fund transaction: ${fundTx.hash}`);

    // Check faucet balance after funding
    const newFaucetBalance = await usdcContract.balanceOf(FAUCET_ADDRESS);
    console.log(`Faucet USDC balance after funding: ${ethers.utils.formatUnits(newFaucetBalance, 6)} USDC`);

    console.log('\n=== FUNDING SUMMARY ===');
    console.log(`Faucet funded with ${ethers.utils.formatUnits(AMOUNT_TO_FUND, 6)} USDC`);
    console.log(`Faucet can now handle ${Math.floor(Number(ethers.utils.formatUnits(AMOUNT_TO_FUND, 6)) / 1000)} claims of 1000 USDC each`);
    console.log('======================\n');
  } catch (error) {
    console.error('An error occurred:');
    console.error(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
