import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.NEXT_ALLOWED_DEV_ORIGINS
    ? process.env.NEXT_ALLOWED_DEV_ORIGINS.split(',')
    : undefined,
  // webpack resolve.symlinks=false disables auto-detection of workspace packages
  // so we need to list them explicitly here
  transpilePackages: [
    '@nadohq/i18n',
    '@nadohq/react-client',
    '@nadohq/web-common',
    '@nadohq/web-ui',
  ],
  webpack: (config, { dev }) => {
    config.cache = false;
    // only enable symlinks on dev builds (disable on regular builds so SDK local linking works)
    config.resolve.symlinks = !!dev;
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
