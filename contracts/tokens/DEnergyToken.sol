// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DEnergyToken
 * @dev $dENERGY — Tokenized Renewable Energy Certificate for the dLuz Protocol
 *
 * Features:
 * - 1 dENERGY = 1 MWh of verified clean energy
 * - MINTER_ROLE: certified entities can mint (verified RECs)
 * - Burnable: redeeming a REC = burning the token
 * - No max supply (minted based on real-world certifications)
 */
contract DEnergyToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @dev Emitted when RECs are redeemed (burned for compliance purposes)
    event EnergyRedeemed(
        address indexed redeemer,
        uint256 amount,
        string reason
    );

    constructor() ERC20("dLuz Renewable Energy", "dENERGY") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Mint new energy certificates (only certified minters)
     * @param to Recipient address
     * @param amount Amount of RECs (1 token = 1 MWh)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Redeem energy certificates — burns tokens and emits a public record
     * @param amount Amount of RECs to redeem
     * @param reason Description of the redemption
     */
    function redeem(uint256 amount, string calldata reason) external {
        _burn(msg.sender, amount);
        emit EnergyRedeemed(msg.sender, amount, reason);
    }
}
