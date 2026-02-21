// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DLuzToken
 * @notice $DLUZ — Governance and utility token for the dLuz Protocol
 * @dev ERC20 with burn, permit (gasless approvals), and owner-controlled minting
 *
 * Tokenomics (1,000,000,000 DLUZ):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ INITIAL MINT: 500,000,000 (50%) — distributed post-deploy  │
 * │  ├─ Presale:      250,000,000 (25%) → PinkSale/DLuzSale    │
 * │  ├─ Liquidity:    100,000,000 (10%) → LP lock 12 months    │
 * │  ├─ Team:         100,000,000 (10%) → TeamVesting (6m+18m) │
 * │  ├─ Marketing:     50,000,000  (5%) → TeamVesting (12m)    │
 * │  └─ Treasury:      50,000,000  (5%) → TeamVesting (3m+12m) │
 * │                                                             │
 * │ RESERVED MINT: 500,000,000 (50%) — minted on demand        │
 * │  ├─ Rewards:      250,000,000 (25%) → DLuzFarming          │
 * │  ├─ Ecosystem:    150,000,000 (15%) → Airdrops, CEX, etc.  │
 * │  └─ Buffer:       100,000,000 (10%) → Marketing extra       │
 * └─────────────────────────────────────────────────────────────┘
 */
contract DLuzToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;
    uint256 public constant INITIAL_SUPPLY = 500_000_000 * 10 ** 18;

    error ExceedsMaxSupply(uint256 requested, uint256 available);

    constructor(
        address initialOwner
    ) ERC20("dLuz Token", "DLUZ") ERC20Permit("dLuz Token") Ownable(initialOwner) {
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    /**
     * @notice Mint new tokens (owner only)
     * @param to Recipient address
     * @param amount Amount to mint (in wei)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert ExceedsMaxSupply(amount, MAX_SUPPLY - totalSupply());
        }
        _mint(to, amount);
    }

    /**
     * @notice Returns remaining mintable supply
     */
    function remainingMintable() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
