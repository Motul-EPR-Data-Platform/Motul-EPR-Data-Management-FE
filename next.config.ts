import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  typedRoutes: true,
  reactStrictMode: true,
  eslint: {
    dirs: ["src"],
  },
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ["lucide-react"],
  },

}

export default nextConfig
