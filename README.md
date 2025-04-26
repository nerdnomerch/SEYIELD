# SEYIELD - Buy Now, Pay Never DeFi Platform

SEYIELD is the first Buy Now Pay Never DeFi platform on SEI Network where users can shop using rewards from their deposits while keeping their original deposit intact.

![SEYIELD Banner](https://via.placeholder.com/1200x300/4F46E5/FFFFFF?text=SEYIELD)

## 🚀 Overview

SEYIELD revolutionizes the DeFi shopping experience by allowing users to make purchases using only the yield generated from their deposits, while keeping their principal amount safe and intact. This innovative approach combines the benefits of yield farming with practical utility.

## ✨ Key Features

- 🛡️ **Keep Your Deposit Safe** - Your deposited money remains untouched
- 💰 **Fixed 7% APY** - Stable and predictable yield on deposits
- 🛍️ **Shop Without Spending** - Use upfront rewards at partner merchants
- ⏰ **Flexible Withdrawals** - Access deposits after 30-day minimum period
- ⚡ **SEI Network Powered** - Built on SEI's fast and efficient blockchain

## 🏗️ Project Structure

The project consists of two main components:

- `seyield-frontend/` - Next.js frontend application with TypeScript
- `seyield-contracts/` - Solidity smart contracts using Foundry

## 🔧 Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- TailwindCSS with shadcn/ui components
- RainbowKit for wallet connection
- wagmi for blockchain interactions
- viem for Ethereum interactions
- Framer Motion for animations

### Smart Contracts
- Solidity 0.8.24
- Foundry for development and testing
- OpenZeppelin contracts for security standards
- SEI Network compatibility

## 📝 Contract Architecture

The protocol consists of the following main contracts:

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

## 🌐 Contract Addresses (SEI Testnet)

```
USDC_ADDRESS=0x855036d27d0B0691ac6FC8A958fF90d394Db9b62
PSYLD_ADDRESS=0xb954f29215Cf0239017f54515F83aBFC5d70dCb4
YSYLD_ADDRESS=0xD461574893Ad06d0100A69833aB17fa0481c80A1
TREASURY_ADDRESS=0x258F16A94BaEe9b8c2499d3974a2bfA872ce805D
YIELD_PROTOCOL_ADDRESS=0x8f31A86E81a1dB175687b4D5B6E9A713A7C69Aaf
FUNDS_VAULT_ADDRESS=0x38E53f2cACc31eD59133938FE806Df0105cc6E88
FAUCET_ADDRESS=0x281E915B324AABB0F69CCeC135709Cf607b4B9D1
MERCHANT_ADDRESS=0x1D1Dc826840C6004b8497BaFD13CDc5351C85d27
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Foundry (for smart contract development)
- Git

### Installation

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

3. Set up environment variables
```bash
# Frontend
cd seyield-frontend
cp .env.example .env.local
# Edit .env.local with your values

# Contracts
cd ../seyield-contracts
cp .env.example .env
# Edit .env with your values
```

4. Run the development environment
```bash
# Frontend
cd seyield-frontend
pnpm dev

# Contracts
cd seyield-contracts
forge test
```

## 🧪 Testing

### Frontend
```bash
cd seyield-frontend
pnpm test
```

### Smart Contracts
```bash
cd seyield-contracts
forge test
```

For detailed test coverage:
```bash
forge coverage
```

## 📦 Deployment

### Frontend
The frontend is configured for deployment on Vercel:

```bash
cd seyield-frontend
pnpm build
```

### Smart Contracts
To deploy to SEI testnet:

```bash
cd seyield-contracts
make deploy-sei-testnet-no-sei
```

For contract verification:
```bash
make verify-sei CONTRACT_ADDRESS=<address> CONTRACT_NAME=<name>
```

## 📚 Documentation

- Frontend: See `seyield-frontend/README.md` for detailed frontend documentation
- Smart Contracts: See `seyield-contracts/README.md` for detailed contract documentation
- Deployment: See `seyield-contracts/DEPLOYMENT.md` for deployment instructions

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For questions or support, please open an issue in the repository.
