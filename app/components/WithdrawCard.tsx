"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { BANK_ADDRESS, BANK_ABI } from "../constants";
import { Loader2 } from "lucide-react";

export default function WithdrawCard() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");

  // 读取我的存款余额 (用于判断是否余额不足，以及 Max 按钮)
  const { data: stakedBalance, refetch: refetchStake } = useReadContract({
    address: BANK_ADDRESS,
    abi: BANK_ABI,
    functionName: "balances",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 2000,
    },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  useEffect(() => {
    if (isSuccess) {
      refetchStake(); // 立即刷新银行余额
      setAmount(""); // 清空输入框
    }
  }, [isSuccess, refetchStake]);

  const handleWithdraw = () => {
    if (!amount || amount === "0") return;
    writeContract({
      address: BANK_ADDRESS,
      abi: BANK_ABI,
      functionName: "withdraw",
      args: [parseEther(amount)],
    });
  };

  const handleMax = () => {
    if (stakedBalance) {
      setAmount(formatEther(stakedBalance as bigint));
    }
  };

  return (
    <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        📤 取出 (Withdraw)
      </h2>

      <div className="relative mb-6">
        <input
          type="text"
          value={amount}
          onChange={(e) =>
            /^\d*\.?\d*$/.test(e.target.value) && setAmount(e.target.value)
          }
          placeholder="0.0"
          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-2xl font-mono text-white focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          onClick={handleMax}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-purple-300 transition-colors"
        >
          MAX
        </button>
      </div>

      <div className="flex justify-between text-sm text-slate-400 mb-6">
        <span>已存余额</span>
        <span>
          {stakedBalance ? formatEther(stakedBalance as bigint) : "0"} DEVT
        </span>
      </div>

      <button
        onClick={handleWithdraw}
        disabled={!amount || amount === "0" || isPending || isConfirming}
        className={`
          w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
          ${
            !amount || amount === "0"
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-500 text-white"
          }
          ${(isPending || isConfirming) && "opacity-80 cursor-wait"}
        `}
      >
        {(isPending || isConfirming) && (
          <Loader2 className="animate-spin w-5 h-5" />
        )}
        {isPending
          ? "钱包签名中..."
          : isConfirming
          ? "提款上链中..."
          : "确认取出 (Withdraw)"}
      </button>

      {isSuccess && (
        <p className="text-green-400 text-xs text-center mt-3 animate-pulse">
          ✅ 提款成功！资金已回到钱包。
        </p>
      )}
    </div>
  );
}
