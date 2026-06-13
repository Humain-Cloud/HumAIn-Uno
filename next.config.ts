import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  output: 'standalone',
  allowedDevOrigins: [
    '.space-z.ai',
    'space-z.ai',
    'localhost',
    '127.0.0.1',
    'preview-chat-72b3500b-1b4c-4f01-8e18-b892553f7ce4.space-z.ai',
  ],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
