import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.NEXT_ALLOWED_DEV_ORIGINS
    ? process.env.NEXT_ALLOWED_DEV_ORIGINS.split(',')
    : undefined,
  webpack: (config) => {
    config.cache = false;
    config.externals.push(
      'utf-8-validate',
      'bufferutil',
      'encoding',
      'pino-pretty',
    );
    return config;
  },
  devIndicators: false,
  experimental: {
    optimizePackageImports: [
      '@nadohq/react-client',
      '@nadohq/web-common',
      '@nadohq/web-ui',
    ],
  },
};

export default nextConfig;
