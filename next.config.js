/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  output: 'standalone',
  swcMinify: true,
  experimental: {
    serverActions: false
  }
};

module.exports = nextConfig;