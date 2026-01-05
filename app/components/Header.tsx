"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther } from "viem";
import { TOKEN_ADDRESS, TOKEN_ABI } from "../constants";
import { useEffect, useState } from "react";

export default function Header() {
  const { address, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  // 防止 Next.js 水合错误 (Hydration Error)
  useEffect(() => setIsMounted(true), []);

  // 读取钱包里的 DEVT 余额
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: "balanceOf",
    // 👇 关键：如果 address 是 undefined，传 undefined 给 wagmi，它会自动不请求
    args: address ? [address] : undefined,
    query: {
      // 👇 双重保险：只有 address 有值时，才启用这个请求
      enabled: !!address,
      refetchInterval: 3000, // 每3秒自动刷新一次数据
    },
  });

  // 👇 新增：写入合约的 Hook
  const { writeContract, error: writeError, data: hash } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  useEffect(() => {
    if (isSuccess) {
      refetchBalance(); // 刷新余额
    }
  }, [isSuccess, refetchBalance]);

  const handleFaucet = () => {
    writeContract({
      address: TOKEN_ADDRESS,
      abi: TOKEN_ABI,
      functionName: "faucet", // 调用合约里的 faucet 函数
    });
  };
  console.log(writeError);

  // 格式化余额：把 BigInt 转成阅读友好的数字 (保留2位小数)
  const formattedBalance = balance
    ? Number(formatEther(balance as bigint)).toFixed(2)
    : "0.00";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* 左侧：Logo 和 标题 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            D
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            DeFi Bank
          </span>
        </div>
        {/* 👇 新增这个按钮 */}
        {isMounted && isConnected && (
          <button
            onClick={handleFaucet}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-all active:scale-95"
          >
            🚰 领 1000 币
          </button>
        )}
        {/* 右侧：余额 和 连接按钮 */}
        <div className="flex items-center gap-4">
          {/* 只有连接钱包后，才显示 DEVT 余额 */}
          {isMounted && isConnected && (
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs text-slate-400">Wallet Balance</span>
              <span className="font-mono font-bold text-indigo-400">
                {formattedBalance} DEVT
              </span>
            </div>
          )}

          <ConnectButton showBalance={false} />
        </div>
      </div>
    </header>
  );
}
