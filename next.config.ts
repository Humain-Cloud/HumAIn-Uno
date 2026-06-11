import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
