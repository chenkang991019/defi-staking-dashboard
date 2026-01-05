"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { trustWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const { wallets } = getDefaultWallets();
console.log("当前的项目ID:", process.env.NEXT_PUBLIC_RPC_URL);
const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID || "cb4d11f64e1d082ff0754a462235ab49";
const config = getDefaultConfig({
  appName: "DeFi Staking",
  projectId: projectId, // 记得填 ID，没有就留空
  wallets: [
    ...wallets,
    { groupName: "Other", wallets: [trustWallet, ledgerWallet] },
  ],
  chains: [sepolia],
  ssr: true,
  transports: {
    // 使用环境变量里的 RPC，如果没有就用默认的
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_RPC_URL || "https://api.zan.top/eth-sepolia"
    ),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
