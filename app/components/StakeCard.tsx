"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { TOKEN_ADDRESS, TOKEN_ABI, BANK_ADDRESS, BANK_ABI } from "../constants";
import { Loader2 } from "lucide-react"; // 引入个加载图标

export default function StakeCard() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");

  // 1. 读取我的 DEVT 余额 (用于点击 MAX)
  const { data: balance, refetch: refetchTokenBalance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // 2. 读取我已授权给银行的额度 (Allowance)
  // 核心：银行只能动用我们授权的额度
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, BANK_ADDRESS] : undefined,
    query: { refetchInterval: 3000 }, // 👈 加这行
  });

  // 3. 写入合约的 Hook
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
  } = useWriteContract();

  // 4. 监听交易上链确认
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // 交易成功后，刷新一下授权额度
  useEffect(() => {
    if (isConfirmed) {
      console.log("交易确认！正在强制刷新数据...");
      refetchAllowance(); // 立即刷新授权状态 (Approve变Stake)
      refetchTokenBalance(); // 立即刷新余额 (扣钱)
      setAmount(""); // 顺便清空输入框，体验更好
    }
  }, [isConfirmed, refetchAllowance, refetchTokenBalance]);

  // 处理输入框变化
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 只允许输入数字和小数点
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // 点击 Max 按钮
  const handleMax = () => {
    if (balance) {
      setAmount(formatEther(balance as bigint));
    }
  };

  // 核心逻辑：判断是需要 Approve 还是 Stake
  const handleAction = () => {
    if (!amount || amount === "0") return;

    // 把输入的数字 "10" 变成 "1000000...000" (Wei)
    const amountWei = parseEther(amount);
    const currentAllowance = (allowance as bigint) || 0n;

    if (currentAllowance < amountWei) {
      // 场景 A: 授权额度不够 -> 调用 Token 合约的 approve
      console.log("正在授权...");
      writeContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "approve",
        args: [BANK_ADDRESS, amountWei], // 授权给银行，动用这么多钱
      });
    } else {
      // 场景 B: 授权额度够了 -> 调用 Bank 合约的 stake
      console.log("正在质押...");
      writeContract({
        address: BANK_ADDRESS,
        abi: BANK_ABI,
        functionName: "stake",
        args: [amountWei],
      });
    }
  };

  // 计算按钮文案
  const isApproving =
    ((allowance as bigint) || 0n) < (amount ? parseEther(amount) : 0n);
  const btnText = isWritePending
    ? "钱包签名中..."
    : isConfirming
    ? "交易上链中..."
    : isApproving
    ? "第一步: 授权 (Approve)"
    : "第二步: 存款 (Stake)";

  return (
    <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        📥 存入 (Stake)
      </h2>

      {/* 输入框区域 */}
      <div className="relative mb-6">
        <input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.0"
          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-2xl font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={handleMax}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-indigo-300 transition-colors"
        >
          MAX
        </button>
      </div>

      {/* 余额提示 */}
      <div className="flex justify-between text-sm text-slate-400 mb-6">
        <span>可用余额</span>
        <span>{balance ? formatEther(balance as bigint) : "0"} DEVT</span>
      </div>

      {/* 大按钮 */}
      <button
        onClick={handleAction}
        disabled={!amount || amount === "0" || isWritePending || isConfirming}
        className={`
          w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
          ${
            !amount || amount === "0"
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : isApproving
              ? "bg-yellow-600 hover:bg-yellow-500 text-white" // 授权是黄色
              : "bg-indigo-600 hover:bg-indigo-500 text-white" // 存款是蓝色
          }
          ${(isWritePending || isConfirming) && "opacity-80 cursor-wait"}
        `}
      >
        {(isWritePending || isConfirming) && (
          <Loader2 className="animate-spin w-5 h-5" />
        )}
        {btnText}
      </button>

      {/* 步骤提示 */}
      {isApproving && amount && amount !== "0" && (
        <p className="text-xs text-yellow-500/80 text-center mt-3">
          ℹ️ 首次存款需要先授权合约访问你的代币
        </p>
      )}
    </div>
  );
}
