import { withSentryConfig } from '@sentry/nextjs';
import { NextConfig } from 'next';
import nextBuildId from 'next-build-id';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  enabled: process.env.ANALYZE === 'true',
});

// use first 7 characters of git commit hash as build id
const buildId = nextBuildId.sync({ dir: import.meta.dirname }).substring(0, 7);

const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.NEXT_ALLOWED_DEV_ORIGINS
    ? process.env.NEXT_ALLOWED_DEV_ORIGINS.split(',')
    : undefined,
  images: {
    qualities: [100, 75],
  },
  webpack: (config) => {
    // disabling cache as we're hitting issues and do not benefit from it
    // see https://github.com/nadohq/nado-web-monorepo/pull/3246
    config.cache = false;
    config.externals.push(
      // This is currently needed to load the *.wasm files needed for Notifi
      '@xmtp/user-preferences-bindings-wasm',
      'utf-8-validate',
      'bufferutil',
      'encoding',
      'pino-pretty',
    );

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'",
          },
        ],
      },
      {
        source: '/charting_library/bundles/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/perpetuals',
        permanent: true,
      },
      {
        source: '/portfolio',
        destination: '/portfolio/overview',
        permanent: true,
      },
    ];
  },
  generateBuildId: () => buildId,
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
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

export default withSentryConfig(
  withBundleAnalyzer(nextConfig),
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  {
    org: 'nado-g5',
    project: 'frontend-trade',
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,
    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: true,
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
    // Show upload logs in CI (Vercel), silent locally
    silent: !process.env.CI,
    // Delete source maps from build output after upload to prevent public exposure
    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
    },
    // Tie release to buildId for Debug ID consistency
    release: {
      name: buildId,
    },
    // Disable Sentry's own 'product improvement' telemetry
    telemetry: false,
  },
);
