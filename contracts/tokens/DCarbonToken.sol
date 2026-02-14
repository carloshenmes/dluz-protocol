// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DCarbonToken
 * @dev $dCARBON — Tokenized carbon credit for the dLuz Protocol
 *
 * Features:
 * - 1 dCARBON = 1 tonne CO2 offset
 * - MINTER_ROLE: certified entities can mint (verified carbon credits)
 * - Burnable: retiring a credit = burning the token (permanent removal)
 * - No max supply (minted based on real-world certifications)
 */
contract DCarbonToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @dev Emitted when credits are retired (burned for offset purposes)
    event CarbonRetired(
        address indexed retiree,
        uint256 amount,
        string reason
    );

    constructor() ERC20("dLuz Carbon Credit", "dCARBON") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Mint new carbon credits (only certified minters)
     * @param to Recipient address
     * @param amount Amount of credits (1 token = 1 tonne CO2)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Retire carbon credits — burns tokens and emits a public record
     * @param amount Amount of credits to retire
     * @param reason Description of the retirement (e.g., "2026 company offset")
     */
    function retire(uint256 amount, string calldata reason) external {
        _burn(msg.sender, amount);
        emit CarbonRetired(msg.sender, amount, reason);
    }
}
