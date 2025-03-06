/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    serverActions: true, // Next.js 14 の新機能
  },
};

module.exports = nextConfig;
