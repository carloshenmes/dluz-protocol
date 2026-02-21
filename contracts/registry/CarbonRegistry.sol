// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title CarbonRegistry
 * @notice Public registry for dCARBON retirement (burn) with dENERGY mint and DLUZ rewards.
 *         Each retirement is permanently recorded on-chain.
 * @dev    Part of dLuz Protocol — https://dluz.cc
 *
 * Flow: retire dCARBON → burn → mint dENERGY (1:1) → transfer DLUZ reward (10:1)
 */

interface IMintable {
    function mint(address to, uint256 amount) external;
}

contract CarbonRegistry is Ownable, ReentrancyGuard, Pausable {

    // ─── State ───────────────────────────────────────────────

    ERC20Burnable public immutable dCarbonToken;
    IMintable public immutable dEnergyToken;
    IERC20 public immutable dluzToken;

    /// @notice dENERGY minted per 1 dCARBON retired (18 decimals). Default: 1e18 (1:1)
    uint256 public energyRate = 1e18;

    /// @notice DLUZ rewarded per 1 dCARBON retired (18 decimals). Default: 10e18 (10:1)
    uint256 public dluzRewardRate = 10e18;

    /// @notice Address holding DLUZ treasury for rewards
    address public dluzTreasury;

    uint256 public constant MAX_ENERGY_RATE = 100e18;
    uint256 public constant MAX_DLUZ_REWARD_RATE = 100e18;
    uint256 public constant MAX_REASON_LENGTH = 280;

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

    event EnergyMinted(
        address indexed retiree,
        uint256 amount
    );

    event DluzRewarded(
        address indexed retiree,
        uint256 amount
    );

    event EnergyRateUpdated(uint256 oldRate, uint256 newRate);
    event DluzRewardRateUpdated(uint256 oldRate, uint256 newRate);
    event DluzTreasuryUpdated(address oldTreasury, address newTreasury);

    // ─── Errors ──────────────────────────────────────────────

    error ZeroAmount();
    error EmptyReason();
    error InvalidAddress();
    error DluzTransferFailed();
    error RateTooHigh();
    error ReasonTooLong();

    // ─── Constructor ─────────────────────────────────────────

    /**
     * @param _dCarbonToken  Address of DCarbonToken (ERC20Burnable)
     * @param _dEnergyToken  Address of DEnergyToken (IMintable)
     * @param _dluzToken     Address of DLuzToken (IERC20)
     * @param _dluzTreasury  Address holding DLUZ for rewards (must approve this contract)
     */
    constructor(
        address _dCarbonToken,
        address _dEnergyToken,
        address _dluzToken,
        address _dluzTreasury
    ) Ownable(msg.sender) {
        if (_dCarbonToken == address(0)) revert InvalidAddress();
        if (_dEnergyToken == address(0)) revert InvalidAddress();
        if (_dluzToken == address(0)) revert InvalidAddress();
        if (_dluzTreasury == address(0)) revert InvalidAddress();

        dCarbonToken = ERC20Burnable(_dCarbonToken);
        dEnergyToken = IMintable(_dEnergyToken);
        dluzToken = IERC20(_dluzToken);
        dluzTreasury = _dluzTreasury;
    }

    // ─── Core ────────────────────────────────────────────────

    /**
     * @notice Retire (burn) dCARBON, mint dENERGY, and receive DLUZ reward.
     * @param amount Amount of dCARBON to retire (18 decimals). 1 token = 1 tonne CO2.
     * @param reason Description or project name for the retirement.
     *
     * Requirements:
     * - Caller must have approved this contract to spend `amount` of dCARBON.
     * - `amount` must be > 0.
     * - `reason` must not be empty.
     * - DLUZ treasury must have approved this contract with sufficient allowance.
     */
    function retire(uint256 amount, string calldata reason) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        if (bytes(reason).length == 0) revert EmptyReason();
        if (bytes(reason).length > MAX_REASON_LENGTH) revert ReasonTooLong();

        // 1. Burn dCARBON directly from caller
        dCarbonToken.burnFrom(msg.sender, amount);

        // 2. Record retirement
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

        // 3. Mint dENERGY to retiree
        if (energyRate > 0) {
            uint256 energyAmount = (amount * energyRate) / 1e18;
            if (energyAmount > 0) {
                dEnergyToken.mint(msg.sender, energyAmount);
                emit EnergyMinted(msg.sender, energyAmount);
            }
        }

        // 4. Transfer DLUZ reward from treasury
        if (dluzRewardRate > 0 && dluzTreasury != address(0)) {
            uint256 rewardAmount = (amount * dluzRewardRate) / 1e18;
            if (rewardAmount > 0) {
                bool success = dluzToken.transferFrom(dluzTreasury, msg.sender, rewardAmount);
                if (!success) revert DluzTransferFailed();
                emit DluzRewarded(msg.sender, rewardAmount);
            }
        }
    }

    // ─── Admin ───────────────────────────────────────────────

    /**
     * @notice Update dENERGY mint rate per dCARBON retired.
     * @param newRate New rate (18 decimals). 1e18 = 1:1. Set 0 to disable.
     */
    function setEnergyRate(uint256 newRate) external onlyOwner {
        if (newRate > MAX_ENERGY_RATE) revert RateTooHigh();
        emit EnergyRateUpdated(energyRate, newRate);
        energyRate = newRate;
    }

    /**
     * @notice Update DLUZ reward rate per dCARBON retired.
     * @param newRate New rate (18 decimals). 10e18 = 10:1. Set 0 to disable.
     */
    function setDluzRewardRate(uint256 newRate) external onlyOwner {
        if (newRate > MAX_DLUZ_REWARD_RATE) revert RateTooHigh();
        emit DluzRewardRateUpdated(dluzRewardRate, newRate);
        dluzRewardRate = newRate;
    }

    /**
     * @notice Update DLUZ treasury address.
     * @param newTreasury New treasury address (must approve this contract).
     */
    function setDluzTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidAddress();
        emit DluzTreasuryUpdated(dluzTreasury, newTreasury);
        dluzTreasury = newTreasury;
    }

    // ─── Emergency ─────────────────────────────────────────

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
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
