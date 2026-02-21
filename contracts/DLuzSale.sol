// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DLuzSale is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable dluzToken;
    uint256 public rate;
    bool public saleActive;
    uint256 public totalSold;
    uint256 public totalRaised;

    event Purchased(address indexed buyer, uint256 ethAmount, uint256 dluzAmount);
    event RateUpdated(uint256 oldRate, uint256 newRate);
    event SaleToggled(bool active);

    error SaleNotActive();
    error ZeroAmount();
    error InsufficientDLuz();
    error TransferFailed();

    constructor(address _dluzToken, uint256 _rate, address _owner) Ownable(_owner) {
        dluzToken = IERC20(_dluzToken);
        rate = _rate;
        saleActive = true;
    }

    receive() external payable { buy(); }

    function buy() public payable nonReentrant {
        if (!saleActive) revert SaleNotActive();
        if (msg.value == 0) revert ZeroAmount();
        uint256 dluzAmount = (msg.value * rate) / 1 ether;
        if (dluzToken.balanceOf(address(this)) < dluzAmount) revert InsufficientDLuz();
        totalSold += dluzAmount;
        totalRaised += msg.value;
        dluzToken.safeTransfer(msg.sender, dluzAmount);
        emit Purchased(msg.sender, msg.value, dluzAmount);
    }

    function setRate(uint256 _newRate) external onlyOwner {
        emit RateUpdated(rate, _newRate);
        rate = _newRate;
    }

    function toggleSale() external onlyOwner {
        saleActive = !saleActive;
        emit SaleToggled(saleActive);
    }

    function withdrawETH() external onlyOwner {
        (bool sent, ) = owner().call{value: address(this).balance}("");
        if (!sent) revert TransferFailed();
    }

    function withdrawDLuz() external onlyOwner {
        dluzToken.safeTransfer(owner(), dluzToken.balanceOf(address(this)));
    }

    function availableDLuz() external view returns (uint256) {
        return dluzToken.balanceOf(address(this));
    }

    function getEstimate(uint256 ethAmount) external view returns (uint256) {
        return (ethAmount * rate) / 1 ether;
    }
}
