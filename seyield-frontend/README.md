# SEYIELD Frontend

Next.js frontend application for the SEYIELD DeFi platform.

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- TailwindCSS
- shadcn/ui components
- RainbowKit for wallet connection
- wagmi for blockchain interactions
- viem for Ethereum interactions
- Framer Motion for animations

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env` file:
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

3. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
seyield-frontend/
├── app/                    # Next.js app router pages
├── components/            
│   ├── ui/                # Reusable UI components
│   ├── web3/              # Blockchain-related components
│   └── ...               # Feature-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
├── public/                # Static assets
└── styles/                # Global styles
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Development Guidelines

- Follow TypeScript best practices
- Use wagmi hooks for blockchain interactions
- Prefer viem over ethers.js
- Keep components modular and reusable
- Use custom hooks for complex logic
- Follow the DRY principle

## Deployment

The application is configured for deployment on Vercel. Environment variables must be set in the Vercel dashboard.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT License
