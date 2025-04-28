// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YSYLD
 * @notice Yield SEYIELD token received by users when depositing
 * @dev This token represents the yield generated from user deposits
 */
contract YSYLD is ERC20, Ownable {
    /// @notice The address of the FundsVault contract that can mint tokens
    address public fundsVault;

    /// @notice The address of the Merchant contract that can burn tokens
    address public merchantContract;

    /// @notice Emitted when the FundsVault address is updated
    /// @param newVault The new FundsVault address
    event FundsVaultUpdated(address indexed newVault);

    /// @notice Emitted when the Merchant contract address is updated
    /// @param newMerchant The new Merchant contract address
    event MerchantContractUpdated(address indexed newMerchant);

    /// @dev Error thrown when an unauthorized address tries to call a restricted function
    error UnauthorizedCaller(address caller);

    /// @dev Error thrown when an invalid address is provided
    error InvalidAddress();

    /**
     * @notice Constructs the YSYLD token
     */
    constructor() ERC20("Yield SEYIELD", "ySYLD") Ownable(msg.sender) {}

    /**
     * @notice Restricts function access to authorized contracts (FundsVault or Merchant)
     */
    modifier onlyAuthorized() {
        if (msg.sender != fundsVault && msg.sender != merchantContract) {
            revert UnauthorizedCaller(msg.sender);
        }
        _;
    }

    /**
     * @notice Mints new tokens to the specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     * @dev Can only be called by authorized contracts
     */
    function mint(address to, uint256 amount) external onlyAuthorized {
        _mint(to, amount);
    }

    /**
     * @notice Burns tokens from the specified address
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     * @dev Can only be called by authorized contracts
     */
    function burnFrom(address from, uint256 amount) external onlyAuthorized {
        _burn(from, amount);
    }

    /**
     * @notice Sets the FundsVault address
     * @param _fundsVault The new FundsVault address
     * @dev Can only be called by the contract owner
     */
    function setFundsVault(address _fundsVault) external onlyOwner {
        if (_fundsVault == address(0)) {
            revert InvalidAddress();
        }
        fundsVault = _fundsVault;
        emit FundsVaultUpdated(_fundsVault);
    }

    /**
     * @notice Sets the Merchant contract address
     * @param _merchantContract The new Merchant contract address
     * @dev Can only be called by the contract owner
     */
    function setMerchantContract(address _merchantContract) external onlyOwner {
        if (_merchantContract == address(0)) {
            revert InvalidAddress();
        }
        merchantContract = _merchantContract;
        emit MerchantContractUpdated(_merchantContract);
    }

    /**
     * @notice Returns the number of decimals used by the token
     * @return The number of decimals (6)
     */
    function decimals() public view override returns(uint8) {
        return 6;
    }
}
