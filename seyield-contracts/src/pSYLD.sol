// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PSYLD
 * @notice Principal SEYIELD token received by users when depositing
 * @dev This token represents the principal amount deposited by users
 */
contract PSYLD is ERC20, Ownable {
    /// @notice The address of the FundsVault contract that can mint and burn tokens
    address public fundsVault;

    /// @notice Emitted when the FundsVault address is updated
    /// @param newVault The new FundsVault address
    event FundsVaultUpdated(address indexed newVault);

    /// @dev Error thrown when an unauthorized address tries to call a restricted function
    error UnauthorizedCaller(address caller);

    /// @dev Error thrown when an invalid address is provided
    error InvalidAddress();

    /**
     * @notice Constructs the PSYLD token
     */
    constructor() ERC20("Principal SEYIELD", "pSYLD") Ownable(msg.sender) {}

    /**
     * @notice Restricts function access to the FundsVault contract
     */
    modifier onlyFundsVault() {
        if (msg.sender != fundsVault) {
            revert UnauthorizedCaller(msg.sender);
        }
        _;
    }

    /**
     * @notice Mints new tokens to the specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     * @dev Can only be called by the FundsVault contract
     */
    function mint(address to, uint256 amount) external onlyFundsVault {
        _mint(to, amount);
    }

    /**
     * @notice Burns tokens from the specified address
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     * @dev Can only be called by the FundsVault contract
     */
    function burn(address from, uint256 amount) external onlyFundsVault {
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
     * @notice Returns the number of decimals used by the token
     * @return The number of decimals (6)
     */
    function decimals() public view override returns(uint8) {
        return 6;
    }
}
