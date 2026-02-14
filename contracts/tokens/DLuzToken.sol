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
 * Tokenomics:
 * - Max supply: 100,000,000 DLUZ
 * - Initial mint to deployer (treasury): 30,000,000 DLUZ
 * - Remaining supply mintable by owner for farming rewards, airdrops, etc.
 */
contract DLuzToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18;
    uint256 public constant INITIAL_SUPPLY = 30_000_000 * 10 ** 18;

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
