// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TeamVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public dluz;
    
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 claimed;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
        bool revoked;
    }

    mapping(address => VestingSchedule) public schedules;

    event VestingCreated(address indexed beneficiary, uint256 amount, uint256 cliff, uint256 duration);
    event TokensClaimed(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 returned);

    constructor(address _dluz) Ownable(msg.sender) {
        dluz = IERC20(_dluz);
    }

    function createVesting(
        address beneficiary,
        uint256 amount,
        uint256 cliffDuration,
        uint256 vestingDuration
    ) external onlyOwner {
        require(schedules[beneficiary].totalAmount == 0, "Vesting already exists");
        require(amount > 0, "Amount must be > 0");
        require(vestingDuration > 0, "Duration must be > 0");
        require(cliffDuration <= vestingDuration, "Cliff > duration");

        dluz.safeTransferFrom(msg.sender, address(this), amount);

        schedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            claimed: 0,
            startTime: block.timestamp,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            revoked: false
        });

        emit VestingCreated(beneficiary, amount, cliffDuration, vestingDuration);
    }

    function claimable(address beneficiary) public view returns (uint256) {
        VestingSchedule memory schedule = schedules[beneficiary];
        
        if (schedule.revoked || schedule.totalAmount == 0) return 0;

        uint256 elapsed = block.timestamp - schedule.startTime;

        // Cliff not reached
        if (elapsed < schedule.cliffDuration) return 0;

        // Fully vested
        if (elapsed >= schedule.vestingDuration) {
            return schedule.totalAmount - schedule.claimed;
        }

        // Linear vesting
        uint256 vested = (schedule.totalAmount * elapsed) / schedule.vestingDuration;
        return vested - schedule.claimed;
    }

    function claim() external nonReentrant {
        uint256 amount = claimable(msg.sender);
        require(amount > 0, "Nothing to claim");

        schedules[msg.sender].claimed += amount;
        dluz.safeTransfer(msg.sender, amount);

        emit TokensClaimed(msg.sender, amount);
    }

    function revoke(address beneficiary) external onlyOwner {
        VestingSchedule storage schedule = schedules[beneficiary];
        require(!schedule.revoked, "Already revoked");
        require(schedule.totalAmount > 0, "No vesting");

        uint256 unvested = schedule.totalAmount - schedule.claimed - claimable(beneficiary);
        schedule.revoked = true;

        // Claim pending for beneficiary
        uint256 pending = claimable(beneficiary);
        if (pending > 0) {
            schedule.claimed += pending;
            dluz.safeTransfer(beneficiary, pending);
        }

        // Return unvested to owner
        if (unvested > 0) {
            dluz.safeTransfer(owner(), unvested);
        }

        emit VestingRevoked(beneficiary, unvested);
    }

    function getSchedule(address beneficiary) external view returns (
        uint256 totalAmount,
        uint256 claimed,
        uint256 pendingClaim,
        uint256 startTime,
        uint256 cliffEnd,
        uint256 vestingEnd,
        bool revoked
    ) {
        VestingSchedule memory s = schedules[beneficiary];
        return (
            s.totalAmount,
            s.claimed,
            claimable(beneficiary),
            s.startTime,
            s.startTime + s.cliffDuration,
            s.startTime + s.vestingDuration,
            s.revoked
        );
    }
}
