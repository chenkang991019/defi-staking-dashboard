"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { BANK_ADDRESS, BANK_ABI } from "../constants";
import { useEffect, useState } from "react";
import { Loader2, Coins, Wallet, Lock } from "lucide-react";

export default function Dashboard() {
  const { address } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  // 1. 读取我的存款
  const { data: myStake } = useReadContract({
    address: BANK_ADDRESS,
    abi: BANK_ABI,
    functionName: "balances",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 2000, // 每5秒自动刷新一次数据
    },
  });

  // 2. 读取银行总存款 (TVL)
  const { data: totalStaked } = useReadContract({
    address: BANK_ADDRESS,
    abi: BANK_ABI,
    functionName: "totalSupply",
    query: {
      refetchInterval: 2000,
    },
  });

  const formatValue = (val: unknown, fixedNum: number = 2) => {
    if (!val) return "0.00";
    return Number(formatEther(val as bigint)).toFixed(fixedNum);
  };

  // 1. 读取我的实时利息 (earned 函数)
  const { data: earnedData } = useReadContract({
    address: BANK_ADDRESS,
    abi: BANK_ABI,
    functionName: "earned",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 1000, // 🔥 每 1 秒刷新一次！让用户看到钱在跳动！
    },
  });

  // 👇 1. 新增写入合约的 Hook
  const { writeContract, isPending } = useWriteContract();
  // 👇 2. 定义领钱函数
  const handleClaim = () => {
    writeContract({
      address: BANK_ADDRESS,
      abi: BANK_ABI,
      functionName: "getReward", // 调用合约里的 getReward 函数
    });
  };

  if (!isMounted) return null;

  return (
    // 🔴 布局优化：在大屏上改成 3 列，不再是田字格
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto mb-12">
      {/* 1. My Stake 卡片 (蓝色系) */}
      <div className="relative overflow-hidden p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 to-slate-900/50 backdrop-blur-xl group hover:border-indigo-500/40 transition-all">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Wallet className="w-24 h-24 text-indigo-500" />
        </div>
        <div className="flex flex-col gap-1 relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              My Staked
            </span>
          </div>
          <span className="text-3xl font-black text-white tracking-tight">
            {formatValue(myStake)}
          </span>
          <span className="text-sm text-slate-500 font-medium">
            DEVT Locked
          </span>
        </div>
      </div>

      {/* 2. TVL 卡片 (紫色系) */}
      <div className="relative overflow-hidden p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-slate-900 to-slate-900/50 backdrop-blur-xl group hover:border-purple-500/40 transition-all">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Lock className="w-24 h-24 text-purple-500" />
        </div>
        <div className="flex flex-col gap-1 relative z-10">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Value Locked
            </span>
          </div>
          <span className="text-3xl font-black text-white tracking-tight">
            {formatValue(totalStaked)}
          </span>
          <span className="text-sm text-slate-500 font-medium">
            Global Liquidity
          </span>
        </div>
      </div>

      {/* 3. Rewards 卡片 (流光金 - 核心操作区) */}
      <div className="relative overflow-hidden p-6 rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-yellow-900/20 to-black backdrop-blur-xl shadow-[0_0_30px_rgba(234,179,8,0.1)] group">
        {/* 背景光效 */}
        <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors"></div>

        <div className="flex flex-col justify-between h-full relative z-10">
          {/* 上半部分：数字 */}
          <div>
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <Coins className="w-4 h-4 animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Unclaimed Rewards
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tracking-tight tabular-nums">
                {formatValue(earnedData, 6)}
              </span>
              <span className="text-sm text-yellow-500/80 font-bold">DEVT</span>
            </div>
          </div>

          {/* 下半部分：按钮 (整合进来了！) */}
          <div className="mt-6">
            <button
              onClick={handleClaim}
              disabled={earnedData === 0n || isPending}
              className={`
                w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                ${
                  (earnedData as bigint) > 0n
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-95 transform"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }
              `}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  领取中...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  领取利息 (Claim)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
