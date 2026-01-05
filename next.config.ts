/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 我们只保留这一行，解决 WalletConnect 报错
  reactStrictMode: false,

  // 2. ❌ 删掉刚才写的 webpack 配置
  // 因为 Turbopack 不支持它，而且最新的 Next.js 其实不需要它也能跑
};

export default nextConfig;
