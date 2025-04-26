include .env

deploy-educhain:; forge script script/DeployScript.s.sol:DeployScript --rpc-url $(EDUCHAIN_SEPOLIA) --interactives 1 --broadcast -vvvvv

deploy-onrollup:; forge script script/DeployScript.s.sol:DeployScript --rpc-url http://94.131.99.79:8547/ --interactives 1 --broadcast -vvvvv

# Test commands
test:; forge test

test-verbose:; forge test -vvv

# Coverage
coverage:; forge coverage


# Verify contracts
verify-sei:
    forge verify-contract \
    --chain-id 713715 \
    --num-of-optimizations 200 \
    --compiler-version v0.8.20 \
    $(CONTRACT_ADDRESS) \
    $(CONTRACT_NAME) \
    $(SEISCAN_API_KEY)


# Example usage
# make deploy-sei-testnet
# make verify-sei CONTRACT_ADDRESS=0x123... CONTRACT_NAME=FundsVault


# Deploy with script that doesn't fund Faucet with SEI (recommended)
deploy-sei-testnet-no-sei:
    forge script script/DeploySEI_NoSEI.s.sol:DeploySEI --rpc-url https://evm-rpc-testnet.sei-apis.com --private-key $(PRIVATE_KEY) --broadcast -vvvv

# Deploy USDC-only faucet
deploy-usdc-only-faucet:
	forge script script/DeployUSDCOnlyFaucet.s.sol:DeployUSDCOnlyFaucet --rpc-url https://evm-rpc-testnet.sei-apis.com --broadcast -vvvv

# Fund the faucet with USDC
fund-faucet:
	forge script script/FundFaucet.s.sol:FundFaucet --rpc-url https://evm-rpc-testnet.sei-apis.com --private-key $(PRIVATE_KEY) --broadcast -vvvv

# Fund the faucet with USDC (simplified version with hardcoded addresses)
fund-faucet-simple:
	forge script script/FundFaucetSimple.s.sol:FundFaucetSimple --rpc-url https://evm-rpc-testnet.sei-apis.com --private-key $(PRIVATE_KEY) --broadcast -vvvv

# Fund the faucet with USDC (no mint attempt, uses IERC20 interface)
fund-faucet-no-mint:
	forge script script/FundFaucetNoMint.s.sol:FundFaucetNoMint --rpc-url https://evm-rpc-testnet.sei-apis.com --private-key $(PRIVATE_KEY) --broadcast -vvvv

# Other commands can be added here as needed
