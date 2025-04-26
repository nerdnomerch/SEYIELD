# SEYIELD - Buy Now, Pay Never DeFi Platform

SEYIELD is the first Buy Now Pay Never DeFi platform on SEI Network where users can shop using rewards from their deposits while keeping their original deposit intact.

## Project Structure

- `seyield-frontend/` - Next.js frontend application
- `seyield-contracts/` - Solidity smart contracts using Foundry

## Key Features

- 🛡️ Keep Your Deposit Safe - Deposited money remains untouched
- 💰 Fixed 7% APY - Stable and predictable yield on deposits
- 🛍️ Shop Without Spending - Use upfront rewards at partner merchants
- ⏰ Flexible Withdrawals - Access deposits after 30-day minimum period
- ⚡ SEI Network Powered - Built on SEI's fast and efficient blockchain

## Contract Addresses

```text
USDC_ADDRESS=0x855036d27d0B0691ac6FC8A958fF90d394Db9b62
PSYLD_ADDRESS=0xb954f29215Cf0239017f54515F83aBFC5d70dCb4
YSYLD_ADDRESS=0xD461574893Ad06d0100A69833aB17fa0481c80A1
TREASURY_ADDRESS=0x258F16A94BaEe9b8c2499d3974a2bfA872ce805D
YIELD_PROTOCOL_ADDRESS=0x8f31A86E81a1dB175687b4D5B6E9A713A7C69Aaf
FUNDS_VAULT_ADDRESS=0x38E53f2cACc31eD59133938FE806Df0105cc6E88
FAUCET_ADDRESS=0x281E915B324AABB0F69CCeC135709Cf607b4B9D1
MERCHANT_ADDRESS=0x1D1Dc826840C6004b8497BaFD13CDc5351C85d27
```

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/seyield.git
cd seyield
```

2. Install dependencies for both projects
```bash
# Frontend
cd seyield-frontend
pnpm install

# Contracts
cd ../seyield-contracts
forge install
```

3. Run the development environment
```bash
# Frontend
cd seyield-frontend
pnpm dev

# Contracts
cd seyield-contracts
forge test
```

## Documentation

- Frontend: See `seyield-frontend/README.md`
- Smart Contracts: See `seyield-contracts/README.md`

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
