// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract StakingBankV4 is ReentrancyGuard {
    IERC20 public stakingToken;
    IERC20 public rewardsToken;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public lastUpdateTime;
    mapping(address => uint256) public rewards;

    uint256 public totalSupply;
    
    // 🔥 精准计算后的利率：对应 200% APY
    // 算法：(2.0 * 1e18) / (365 * 24 * 60 * 60)
    uint256 public constant REWARD_RATE = 63419583967; 

    constructor(address _stakingToken, address _rewardsToken) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
    }

    // ... 下面的代码完全不变 ...

    function earned(address account) public view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastUpdateTime[account];
        return rewards[account] + ((balances[account] * timeElapsed * REWARD_RATE) / 1e18);
    }

    modifier updateReward(address account) {
        rewards[account] = earned(account);
        lastUpdateTime[account] = block.timestamp;
        _;
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        stakingToken.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        totalSupply += amount;
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalSupply -= amount;
        stakingToken.transfer(msg.sender, amount);
    }

    function getReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards");
        rewards[msg.sender] = 0;
        rewardsToken.transfer(msg.sender, reward);
    }
}