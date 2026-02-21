// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockFailToken is ERC20 {
    constructor() ERC20("MockFail", "FAIL") {
        _mint(msg.sender, 1_000_000e18);
    }

    function transferFrom(address, address, uint256) public pure override returns (bool) {
        return false;
    }
}
