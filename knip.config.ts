import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: [
    '**/public/**',
    // config files used by external scripts
    '**/next-sitemap.config.js',
    '**/eslint.config.js',
    // our CSS setup is a bit tricky for knip currently (ignore for now)
    '**/*.css',
  ],
  ignoreDependencies: [
    // always consider the SDK as used, this avoids false positives
    // when locally linking the SDK during development
    '@nadohq/client',
    // CLI for i18next translations extraction and linting
    'i18next-cli',
    // image optimizer used by Next
    'sharp',
    // peer dependency for wagmi
    '@walletconnect/ethereum-provider',
    // testing-only dependencies
    '@happy-dom/global-registrator',
    '@testing-library/dom',
    '@testing-library/react',
  ],
  // relax unused export rule when the export is used in the file
  // this is to avoid noise with *QueryKey funcs and Props interfaces
  // that are sensible to exports but may not be always used externally
  // future version of knip may allow pattern-based ignores
  ignoreExportsUsedInFile: true,
  rules: {
    dependencies: 'error',
    exports: 'warn',
    files: 'warn',
    types: 'warn',
  },
};

export default config;
