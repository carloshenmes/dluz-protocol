// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title CarbonRegistry
 * @notice Public registry for dCARBON retirement (burn).
 *         Each retirement is permanently recorded on-chain.
 * @dev    Part of dLuz Protocol — https://dluz.cc
 */
contract CarbonRegistry is Ownable {

    // ─── State ───────────────────────────────────────────────

    ERC20Burnable public immutable dCarbonToken;

    struct Retirement {
        address retiree;
        uint256 amount;
        string reason;
        uint256 timestamp;
        uint256 blockNumber;
    }

    Retirement[] private _retirements;

    mapping(address => uint256) public totalRetiredBy;
    uint256 public totalRetired;

    // ─── Events ──────────────────────────────────────────────

    event CarbonRetired(
        uint256 indexed retirementId,
        address indexed retiree,
        uint256 amount,
        string reason,
        uint256 timestamp
    );

    // ─── Errors ──────────────────────────────────────────────

    error ZeroAmount();
    error EmptyReason();
    error InvalidToken();

    // ─── Constructor ─────────────────────────────────────────

    /**
     * @param _dCarbonToken Address of the deployed DCarbonToken (ERC20Burnable)
     */
    constructor(address _dCarbonToken) Ownable(msg.sender) {
        if (_dCarbonToken == address(0)) revert InvalidToken();
        dCarbonToken = ERC20Burnable(_dCarbonToken);
    }

    // ─── Core ────────────────────────────────────────────────

    /**
     * @notice Retire (burn) dCARBON tokens and record on-chain.
     * @param amount Amount of dCARBON to retire (18 decimals). 1 token = 1 tonne CO2.
     * @param reason Description or project name for the retirement.
     *
     * Requirements:
     * - Caller must have approved this contract to spend `amount` of dCARBON.
     * - `amount` must be > 0.
     * - `reason` must not be empty.
     */
    function retire(uint256 amount, string calldata reason) external {
        if (amount == 0) revert ZeroAmount();
        if (bytes(reason).length == 0) revert EmptyReason();

        // Transfer dCARBON from caller to this contract, then burn
        dCarbonToken.transferFrom(msg.sender, address(this), amount);
        dCarbonToken.burn(amount);

        // Record retirement
        uint256 retirementId = _retirements.length;

        _retirements.push(Retirement({
            retiree: msg.sender,
            amount: amount,
            reason: reason,
            timestamp: block.timestamp,
            blockNumber: block.number
        }));

        totalRetiredBy[msg.sender] += amount;
        totalRetired += amount;

        emit CarbonRetired(retirementId, msg.sender, amount, reason, block.timestamp);
    }

    // ─── Views ───────────────────────────────────────────────

    /**
     * @notice Get a specific retirement record by ID.
     */
    function getRetirement(uint256 id) external view returns (Retirement memory) {
        return _retirements[id];
    }

    /**
     * @notice Total number of retirements recorded.
     */
    function totalRetirements() external view returns (uint256) {
        return _retirements.length;
    }

    /**
     * @notice Get a paginated list of retirements.
     * @param offset Starting index.
     * @param limit  Max number of records to return.
     */
    function getRetirements(uint256 offset, uint256 limit)
        external
        view
        returns (Retirement[] memory)
    {
        uint256 total = _retirements.length;
        if (offset >= total) {
            return new Retirement[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 size = end - offset;
        Retirement[] memory page = new Retirement[](size);

        for (uint256 i = 0; i < size; i++) {
            page[i] = _retirements[offset + i];
        }

        return page;
    }
}
