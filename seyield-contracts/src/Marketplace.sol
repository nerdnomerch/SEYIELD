// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {YSYLD} from "./ySYLD.sol";

error InvalidPrice();
error InvalidItem();
error InvalidMerchant();
error ZeroAddress();
error InsufficientBalance();
error InsufficientYield();
error TransferFailed();

contract Marketplace is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;
    YSYLD public immutable ySYLD;

    struct Item {
        string name;
        uint256 price;
        address merchant;
        bool isAvailable;
    }

    struct Purchase {
        address buyer;
        uint256 itemId;
        uint256 price;
        uint256 timestamp;
    }

    mapping(uint256 => Item) public items;
    mapping(address => bool) public approvedMerchants;
    mapping(address => Purchase[]) public userPurchases;  // Fixed: Changed from uint256 to address[]

    uint256 public nextItemId;

    event ItemListed(uint256 indexed itemId, string name, uint256 price, address indexed merchant);
    event ItemPurchased(address indexed buyer, uint256 indexed itemId, uint256 price);  // Fixed: Changed event parameters
    event MerchantApproved(address indexed merchant);
    event MerchantRevoked(address indexed merchant);

    constructor(address _usdc, address _ySYLD) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        ySYLD = YSYLD(_ySYLD);
    }

    /// @notice Add or approve a merchant
    /// @param merchant Merchant address to approve
    function approvedMerchant(address merchant) external onlyOwner {
        if (merchant == address(0)) revert InvalidMerchant();
        approvedMerchants[merchant] = true;
        emit MerchantApproved(merchant);
    }

    /// @notice Remove or revoke a merchant
    /// @param merchant Merchant address to revoke
    function revokeMerchant(address merchant) external onlyOwner {
        if (merchant == address(0)) revert InvalidMerchant();
        approvedMerchants[merchant] = false;
        emit MerchantRevoked(merchant);
    }

    /// @notice List a new item in the marketplace
    /// @param name Item name
    /// @param price Item price in USDC
    /// @param merchant Merchant address
    function listItem(string calldata name, uint256 price, address merchant) external {
        if (price == 0) revert InvalidPrice();
        if (merchant == address(0)) revert InvalidMerchant();
        if (!approvedMerchants[merchant]) revert InvalidMerchant();

        uint256 itemId = nextItemId++;
        items[itemId] = Item({
            name: name,
            price: price,
            merchant: merchant,
            isAvailable: true
        });

        emit ItemListed(itemId, name, price, merchant);
    }

    /// @notice Purchase an item using yield tokens
    /// @param itemId ID of item to purchase
    function purchaseItem(uint256 itemId) external nonReentrant {
        Item storage item = items[itemId];
        if (!item.isAvailable) revert InvalidItem();
        if (item.price == 0) revert InvalidPrice();
        
        // Check if user has enough yield tokens
        if (ySYLD.balanceOf(msg.sender) < item.price) revert InsufficientYield();
        
        // Transfer USDC to merchant
        if (!usdc.transfer(item.merchant, item.price)) revert TransferFailed();
        
        // Burn yield tokens
        ySYLD.burnFrom(msg.sender, item.price);
        
        // Record purchase
        userPurchases[msg.sender].push(Purchase({
            buyer: msg.sender,
            itemId: itemId,
            price: item.price,
            timestamp: block.timestamp
        }));
        
        emit ItemPurchased(msg.sender, itemId, item.price);
    }
    
    /// @notice Get all purchases for a user
    /// @param user Address to get purchases for
    /// @return Array of purchases
    function getUserPurchases(address user) external view returns (Purchase[] memory) {
        return userPurchases[user];
    }
    
    /// @notice Get item details
    /// @param itemId ID of item
    /// @return Item details
    function getItem(uint256 itemId) external view returns (Item memory) {
        return items[itemId];
    }
}
