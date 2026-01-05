// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// 这是一个极其简单的代币，你可以无限给自己印钱
contract DevToken is ERC20, Ownable {
    constructor() ERC20("DevToken", "DEVT") Ownable(msg.sender) {
        // 部署时，先给自己印 100 万个币 (18位精度)
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // 水龙头功能：任何人调用这个函数，就给他发 1000 个币
    // (为了方便测试，否则别人没币没法玩)
    function faucet() public {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }
}