// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./tokens/DLuzToken.sol";
import "./tokens/DCarbonToken.sol";
import "./tokens/DEnergyToken.sol";

contract RetirementVault is Ownable, ReentrancyGuard {
    
    DLuzToken public dluz;
    DCarbonToken public dcarbon;
    DEnergyToken public denergy;

    // --- Ratios ---
    uint256 public dluzPerRetirement = 1 ether;
    uint256 public denergyPerRetirement = 0.1 ether;
    uint256 public carbonPerRetirement = 10 ether;

    // --- Fee ---
    uint256 public platformFeeBps = 1000;
    address public feeReceiver;

    // --- Anti-baleia ---
    uint256 public maxDailyPerWallet = 100 ether;
    uint256 public cooldownPeriod = 1 hours;

    mapping(address => uint256) public lastRetirement;
    mapping(address => uint256) public dailyRetired;
    mapping(address => uint256) public dailyResetTime;

    // --- Stats ---
    uint256 public totalCarbonRetired;
    uint256 public totalRetirements;
    uint256 public totalDluzDistributed;
    uint256 public totalDenergyMinted;

    mapping(address => uint256) public userCarbonRetired;
    mapping(address => uint256) public userRetirements;
    mapping(address => uint256) public userDluzEarned;
    mapping(address => uint256) public userDenergyEarned;

    // --- Events ---
    event CarbonRetired(address indexed user, uint256 carbonAmount, uint256 dluzReward, uint256 denergyReward);
    event RatioUpdated(uint256 newDluzRatio, uint256 newDenergyRatio);
    event FeeUpdated(uint256 newFeeBps);
    event LimitsUpdated(uint256 newDailyMax, uint256 newCooldown);

    constructor(
        address _dluz,
        address _dcarbon,
        address _denergy,
        address _feeReceiver
    ) Ownable(msg.sender) {
        dluz = DLuzToken(_dluz);
        dcarbon = DCarbonToken(_dcarbon);
        denergy = DEnergyToken(_denergy);
        feeReceiver = _feeReceiver;
    }

    function retire(uint256 carbonAmount) external nonReentrant {
        require(carbonAmount >= carbonPerRetirement, "Min 10 dCarbon");
        require(carbonAmount % carbonPerRetirement == 0, "Must be multiple of 10");

        require(
            block.timestamp >= lastRetirement[msg.sender] + cooldownPeriod,
            "Cooldown active"
        );

        if (block.timestamp >= dailyResetTime[msg.sender] + 1 days) {
            dailyRetired[msg.sender] = 0;
            dailyResetTime[msg.sender] = block.timestamp;
        }
        require(
            dailyRetired[msg.sender] + carbonAmount <= maxDailyPerWallet,
            "Daily limit reached"
        );

        uint256 retirements = carbonAmount / carbonPerRetirement;

        uint256 dluzTotal = retirements * dluzPerRetirement;
        uint256 denergyTotal = retirements * denergyPerRetirement;

        uint256 dluzFee = (dluzTotal * platformFeeBps) / 10000;
        uint256 denergyFee = (denergyTotal * platformFeeBps) / 10000;

        uint256 dluzUser = dluzTotal - dluzFee;
        uint256 denergyUser = denergyTotal - denergyFee;

        dcarbon.burnFrom(msg.sender, carbonAmount);

        dluz.transfer(msg.sender, dluzUser);
        dluz.transfer(feeReceiver, dluzFee);

        denergy.mint(msg.sender, denergyUser);
        denergy.mint(feeReceiver, denergyFee);

        lastRetirement[msg.sender] = block.timestamp;
        dailyRetired[msg.sender] += carbonAmount;

        totalCarbonRetired += carbonAmount;
        totalRetirements += retirements;
        totalDluzDistributed += dluzTotal;
        totalDenergyMinted += denergyTotal;

        userCarbonRetired[msg.sender] += carbonAmount;
        userRetirements[msg.sender] += retirements;
        userDluzEarned[msg.sender] += dluzUser;
        userDenergyEarned[msg.sender] += denergyUser;

        emit CarbonRetired(msg.sender, carbonAmount, dluzUser, denergyUser);
    }

    function setRatio(uint256 _dluz, uint256 _denergy) external onlyOwner {
        dluzPerRetirement = _dluz;
        denergyPerRetirement = _denergy;
        emit RatioUpdated(_dluz, _denergy);
    }

    function setFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 2000, "Max 20%");
        platformFeeBps = _feeBps;
        emit FeeUpdated(_feeBps);
    }

    function setLimits(uint256 _dailyMax, uint256 _cooldown) external onlyOwner {
        maxDailyPerWallet = _dailyMax;
        cooldownPeriod = _cooldown;
        emit LimitsUpdated(_dailyMax, _cooldown);
    }

    function setFeeReceiver(address _receiver) external onlyOwner {
        feeReceiver = _receiver;
    }

    function emergencyWithdraw(uint256 amount) external onlyOwner {
        dluz.transfer(owner(), amount);
    }
}
