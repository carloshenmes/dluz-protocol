// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IMintableToken {
    function mint(address to, uint256 amount) external;
    function burnFrom(address from, uint256 amount) external;
}

contract CarbonBridge is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    IMintableToken public immutable dcarbon;
    
    mapping(address => bool) public acceptedTokens;
    mapping(address => uint256) public totalDeposited;
    mapping(address => mapping(address => uint256)) public userDeposits;
    
    uint256 public totalBacked;
    bool public paused;

    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event Retire(address indexed user, uint256 amount, string reason);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event Paused(bool state);

    error TokenNotAccepted();
    error ZeroAmount();
    error BridgePaused();
    error InsufficientDeposit();

    constructor(address _dcarbon, address _admin) {
        dcarbon = IMintableToken(_dcarbon);
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MANAGER_ROLE, _admin);
    }

    /// @notice Deposit BCT/NCT and receive dCARBON 1:1
    function deposit(address token, uint256 amount) external nonReentrant {
        if (paused) revert BridgePaused();
        if (!acceptedTokens[token]) revert TokenNotAccepted();
        if (amount == 0) revert ZeroAmount();

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        totalDeposited[token] += amount;
        userDeposits[msg.sender][token] += amount;
        totalBacked += amount;

        dcarbon.mint(msg.sender, amount);

        emit Deposit(msg.sender, token, amount);
    }

    /// @notice Withdraw: burn dCARBON and get back BCT/NCT
    function withdraw(address token, uint256 amount) external nonReentrant {
        if (!acceptedTokens[token]) revert TokenNotAccepted();
        if (amount == 0) revert ZeroAmount();
        if (userDeposits[msg.sender][token] < amount) revert InsufficientDeposit();

        userDeposits[msg.sender][token] -= amount;
        totalDeposited[token] -= amount;
        totalBacked -= amount;

        dcarbon.burnFrom(msg.sender, amount);
        IERC20(token).safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, token, amount);
    }

    /// @notice Retire: burn dCARBON permanently (carbon offset)
    function retire(uint256 amount, string calldata reason) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        dcarbon.burnFrom(msg.sender, amount);
        // BCT stays locked forever = carbon permanently retired
        totalBacked -= amount;

        emit Retire(msg.sender, amount, reason);
    }

    // --- Admin ---

    function addToken(address token) external onlyRole(MANAGER_ROLE) {
        acceptedTokens[token] = true;
        emit TokenAdded(token);
    }

    function removeToken(address token) external onlyRole(MANAGER_ROLE) {
        acceptedTokens[token] = false;
        emit TokenRemoved(token);
    }

    function setPaused(bool _paused) external onlyRole(MANAGER_ROLE) {
        paused = _paused;
        emit Paused(_paused);
    }

    /// @notice Total BCT/NCT backing all dCARBON in circulation
    function getBackingBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
