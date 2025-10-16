/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@airp/core', '@airp/db'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig
