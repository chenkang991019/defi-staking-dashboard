import Header from "./components/Header";
import StakeCard from "./components/StakeCard";
import Dashboard from "./components/Dashboard";
import WithdrawCard from "./components/WithdrawCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* 标题区域 */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Stake & Earn
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            存入你的 DEVT 代币，享受高达
            <span className="text-white font-bold mx-1">200% APY</span>
            的被动收益。安全、透明、去中心化。
          </p>
        </div>

        {/* 1. 仪表盘放上面 */}
        <Dashboard />

        {/* 2. 左右两个卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <StakeCard />
          <WithdrawCard />
        </div>
      </main>
    </div>
  );
}
