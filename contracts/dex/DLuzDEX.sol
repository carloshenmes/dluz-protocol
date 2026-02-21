// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DLuzDEX
 * @notice AMM simples (constant product x*y=k) para pares DLUZ↔dCARBON e DLUZ↔dENERGY
 * @dev Pools unidirecionais — DLUZ é sempre um dos lados do par
 */
contract DLuzDEX is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Pool {
        address tokenA;       // sempre DLUZ
        address tokenB;       // dCARBON ou dENERGY
        uint256 reserveA;
        uint256 reserveB;
        bool active;
    }

    uint256 public constant FEE_BPS = 30; // 0.3%
    uint256 public constant BPS = 10_000;

    mapping(bytes32 => Pool) public pools;
    bytes32[] public poolIds;

    address public feeCollector;

    event PoolCreated(bytes32 indexed poolId, address tokenA, address tokenB);
    event LiquidityAdded(bytes32 indexed poolId, uint256 amountA, uint256 amountB, address indexed provider);
    event LiquidityRemoved(bytes32 indexed poolId, uint256 amountA, uint256 amountB, address indexed provider);
    event Swapped(
        bytes32 indexed poolId,
        address indexed trader,
        address tokenIn,
        uint256 amountIn,
        address tokenOut,
        uint256 amountOut
    );

    error PoolAlreadyExists();
    error PoolNotFound();
    error PoolNotActive();
    error ZeroAmount();
    error InsufficientOutput();
    error InvalidToken();
    error InsufficientLiquidity();

    constructor(address initialOwner, address _feeCollector) Ownable(initialOwner) {
        feeCollector = _feeCollector;
    }

    // ─── Pool Management ────────────────────────────────────────────

    function createPool(address tokenA, address tokenB) external onlyOwner returns (bytes32) {
        bytes32 poolId = _getPoolId(tokenA, tokenB);
        if (pools[poolId].active) revert PoolAlreadyExists();

        pools[poolId] = Pool({
            tokenA: tokenA,
            tokenB: tokenB,
            reserveA: 0,
            reserveB: 0,
            active: true
        });
        poolIds.push(poolId);

        emit PoolCreated(poolId, tokenA, tokenB);
        return poolId;
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant {
        if (amountA == 0 || amountB == 0) revert ZeroAmount();

        bytes32 poolId = _getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];
        if (!pool.active) revert PoolNotFound();

        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        pool.reserveA += amountA;
        pool.reserveB += amountB;

        emit LiquidityAdded(poolId, amountA, amountB, msg.sender);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external onlyOwner nonReentrant {
        bytes32 poolId = _getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];
        if (!pool.active) revert PoolNotFound();
        if (pool.reserveA < amountA || pool.reserveB < amountB) revert InsufficientLiquidity();

        pool.reserveA -= amountA;
        pool.reserveB -= amountB;

        IERC20(tokenA).safeTransfer(msg.sender, amountA);
        IERC20(tokenB).safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(poolId, amountA, amountB, msg.sender);
    }

    // ─── Swap ───────────────────────────────────────────────────────

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();

        bytes32 poolId = _resolvePoolId(tokenIn, tokenOut);
        Pool storage pool = pools[poolId];
        if (!pool.active) revert PoolNotActive();

        bool isAtoB = (tokenIn == pool.tokenA);
        uint256 reserveIn = isAtoB ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = isAtoB ? pool.reserveB : pool.reserveA;

        if (reserveIn == 0 || reserveOut == 0) revert InsufficientLiquidity();

        // Fee
        uint256 fee = (amountIn * FEE_BPS) / BPS;
        uint256 amountInAfterFee = amountIn - fee;

        // Constant product: amountOut = (reserveOut * amountInAfterFee) / (reserveIn + amountInAfterFee)
        amountOut = (reserveOut * amountInAfterFee) / (reserveIn + amountInAfterFee);

        if (amountOut < minAmountOut) revert InsufficientOutput();
        if (amountOut > reserveOut) revert InsufficientLiquidity();

        // Transfers
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Fee to collector
        if (fee > 0 && feeCollector != address(0)) {
            IERC20(tokenIn).safeTransfer(feeCollector, fee);
        }

        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        // Update reserves
        if (isAtoB) {
            pool.reserveA += amountInAfterFee;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountInAfterFee;
            pool.reserveA -= amountOut;
        }

        emit Swapped(poolId, msg.sender, tokenIn, amountIn, tokenOut, amountOut);
    }

    // ─── Views ──────────────────────────────────────────────────────

    function getEstimatedOutput(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256) {
        if (amountIn == 0) return 0;

        bytes32 poolId = _resolvePoolId(tokenIn, tokenOut);
        Pool storage pool = pools[poolId];
        if (!pool.active) return 0;

        bool isAtoB = (tokenIn == pool.tokenA);
        uint256 reserveIn = isAtoB ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = isAtoB ? pool.reserveB : pool.reserveA;

        if (reserveIn == 0 || reserveOut == 0) return 0;

        uint256 amountInAfterFee = amountIn - (amountIn * FEE_BPS) / BPS;
        return (reserveOut * amountInAfterFee) / (reserveIn + amountInAfterFee);
    }

    function getPool(address tokenA, address tokenB) external view returns (Pool memory) {
        return pools[_getPoolId(tokenA, tokenB)];
    }

    function getPoolCount() external view returns (uint256) {
        return poolIds.length;
    }

    function setFeeCollector(address _feeCollector) external onlyOwner {
        feeCollector = _feeCollector;
    }

    // ─── Internal ───────────────────────────────────────────────────

    function _getPoolId(address tokenA, address tokenB) internal pure returns (bytes32) {
        (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        return keccak256(abi.encodePacked(t0, t1));
    }

    function _resolvePoolId(address tokenIn, address tokenOut) internal view returns (bytes32) {
        bytes32 poolId = _getPoolId(tokenIn, tokenOut);
        if (!pools[poolId].active) revert PoolNotFound();
        return poolId;
    }
}
