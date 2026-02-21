// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DLuzFarming
 * @notice Staking de DLUZ com rewards em dCARBON e/ou dENERGY
 * @dev Modelo de reward por segundo, distribuição proporcional ao stake
 */
contract DLuzFarming is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct PoolInfo {
        IERC20 rewardToken;           // dCARBON ou dENERGY
        uint256 rewardPerSecond;      // tokens de reward por segundo
        uint256 accRewardPerShare;    // acumulado por share (scaled 1e18)
        uint256 lastRewardTime;
        uint256 totalStaked;
        bool active;
    }

    struct UserInfo {
        uint256 amount;          // DLUZ staked
        uint256 rewardDebt;      // debt pra cálculo
        uint256 pendingRewards;  // rewards acumulados não claimados
    }

    IERC20 public immutable dluzToken;

    PoolInfo[] public pools;
    // poolId => user => info
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    event PoolAdded(uint256 indexed poolId, address rewardToken, uint256 rewardPerSecond);
    event Staked(uint256 indexed poolId, address indexed user, uint256 amount);
    event Unstaked(uint256 indexed poolId, address indexed user, uint256 amount);
    event Claimed(uint256 indexed poolId, address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 indexed poolId, uint256 newRate);

    error PoolNotActive();
    error ZeroAmount();
    error InsufficientStake();
    error InvalidPool();

    constructor(address initialOwner, address _dluzToken) Ownable(initialOwner) {
        dluzToken = IERC20(_dluzToken);
    }

    // ─── Pool Management ────────────────────────────────────────────

    function addPool(address _rewardToken, uint256 _rewardPerSecond) external onlyOwner returns (uint256) {
        uint256 poolId = pools.length;
        pools.push(PoolInfo({
            rewardToken: IERC20(_rewardToken),
            rewardPerSecond: _rewardPerSecond,
            accRewardPerShare: 0,
            lastRewardTime: block.timestamp,
            totalStaked: 0,
            active: true
        }));

        emit PoolAdded(poolId, _rewardToken, _rewardPerSecond);
        return poolId;
    }

    function setRewardRate(uint256 poolId, uint256 _rewardPerSecond) external onlyOwner {
        if (poolId >= pools.length) revert InvalidPool();
        _updatePool(poolId);
        pools[poolId].rewardPerSecond = _rewardPerSecond;
        emit RewardRateUpdated(poolId, _rewardPerSecond);
    }

    function setPoolActive(uint256 poolId, bool _active) external onlyOwner {
        if (poolId >= pools.length) revert InvalidPool();
        _updatePool(poolId);
        pools[poolId].active = _active;
    }

    // ─── User Actions ───────────────────────────────────────────────

    function stake(uint256 poolId, uint256 amount) external nonReentrant {
        if (poolId >= pools.length) revert InvalidPool();
        if (!pools[poolId].active) revert PoolNotActive();
        if (amount == 0) revert ZeroAmount();

        _updatePool(poolId);

        PoolInfo storage pool = pools[poolId];
        UserInfo storage user = userInfo[poolId][msg.sender];

        // Settle pending rewards
        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accRewardPerShare) / 1e18 - user.rewardDebt;
            if (pending > 0) {
                user.pendingRewards += pending;
            }
        }

        dluzToken.safeTransferFrom(msg.sender, address(this), amount);

        user.amount += amount;
        pool.totalStaked += amount;
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / 1e18;

        emit Staked(poolId, msg.sender, amount);
    }

    function unstake(uint256 poolId, uint256 amount) external nonReentrant {
        if (poolId >= pools.length) revert InvalidPool();
        if (amount == 0) revert ZeroAmount();

        UserInfo storage user = userInfo[poolId][msg.sender];
        if (user.amount < amount) revert InsufficientStake();

        _updatePool(poolId);

        PoolInfo storage pool = pools[poolId];

        // Settle pending rewards
        uint256 pending = (user.amount * pool.accRewardPerShare) / 1e18 - user.rewardDebt;
        if (pending > 0) {
            user.pendingRewards += pending;
        }

        user.amount -= amount;
        pool.totalStaked -= amount;
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / 1e18;

        dluzToken.safeTransfer(msg.sender, amount);

        emit Unstaked(poolId, msg.sender, amount);
    }

    function claim(uint256 poolId) external nonReentrant {
        if (poolId >= pools.length) revert InvalidPool();

        _updatePool(poolId);

        PoolInfo storage pool = pools[poolId];
        UserInfo storage user = userInfo[poolId][msg.sender];

        uint256 pending = (user.amount * pool.accRewardPerShare) / 1e18 - user.rewardDebt;
        uint256 totalRewards = user.pendingRewards + pending;

        if (totalRewards == 0) revert ZeroAmount();

        user.pendingRewards = 0;
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / 1e18;

        pool.rewardToken.safeTransfer(msg.sender, totalRewards);

        emit Claimed(poolId, msg.sender, totalRewards);
    }

    // ─── Views ──────────────────────────────────────────────────────

    function pendingReward(uint256 poolId, address _user) external view returns (uint256) {
        if (poolId >= pools.length) return 0;

        PoolInfo storage pool = pools[poolId];
        UserInfo storage user = userInfo[poolId][_user];

        uint256 accRewardPerShare = pool.accRewardPerShare;

        if (block.timestamp > pool.lastRewardTime && pool.totalStaked > 0) {
            uint256 elapsed = block.timestamp - pool.lastRewardTime;
            uint256 reward = elapsed * pool.rewardPerSecond;
            accRewardPerShare += (reward * 1e18) / pool.totalStaked;
        }

        uint256 pending = (user.amount * accRewardPerShare) / 1e18 - user.rewardDebt;
        return user.pendingRewards + pending;
    }

    function poolCount() external view returns (uint256) {
        return pools.length;
    }

    function getPoolInfo(uint256 poolId) external view returns (
        address rewardToken,
        uint256 rewardPerSecond,
        uint256 totalStaked,
        bool active
    ) {
        if (poolId >= pools.length) revert InvalidPool();
        PoolInfo storage pool = pools[poolId];
        return (address(pool.rewardToken), pool.rewardPerSecond, pool.totalStaked, pool.active);
    }

    // ─── Internal ───────────────────────────────────────────────────

    function _updatePool(uint256 poolId) internal {
        PoolInfo storage pool = pools[poolId];

        if (block.timestamp <= pool.lastRewardTime) return;

        if (pool.totalStaked == 0) {
            pool.lastRewardTime = block.timestamp;
            return;
        }

        uint256 elapsed = block.timestamp - pool.lastRewardTime;
        uint256 reward = elapsed * pool.rewardPerSecond;
        pool.accRewardPerShare += (reward * 1e18) / pool.totalStaked;
        pool.lastRewardTime = block.timestamp;
    }
}
