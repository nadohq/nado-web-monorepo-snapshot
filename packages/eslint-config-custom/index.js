import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettierConfig from 'eslint-config-prettier';
import turboConfig from 'eslint-config-turbo/flat';
import importPlugin from 'eslint-plugin-import';
import noRelativeImportPathsPlugin from 'eslint-plugin-no-relative-import-paths';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(nextVitals, turboConfig, prettierConfig, {
  files: ['**/*.{js,ts,tsx}'],
  plugins: {
    '@typescript-eslint': typescriptEslintPlugin,
    import: importPlugin,
    'no-relative-import-paths': noRelativeImportPathsPlugin,
  },
  languageOptions: {
    parser: tseslint.parser,
  },
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'local',
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/switch-exhaustiveness-check': [
      'error',
      { considerDefaultExhaustiveForUnions: true },
    ],
    'import/newline-after-import': 'error',
    'no-relative-import-paths/no-relative-import-paths': 'error',
    'no-restricted-properties': [
      'error',
      {
        object: 'JSON',
        property: 'stringify',
        message:
          'Use safe-stable-stringify instead of JSON.stringify to safely handle circular references. Import: import safeStringify from "safe-stable-stringify"',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@nadohq/contracts', '@nadohq/contracts/*'],
            message: 'Please use `@nadohq/client` instead.',
          },
          {
            group: ['@nadohq/engine-client', '@nadohq/engine-client/*'],
            message: 'Please use `@nadohq/client` instead.',
          },
          {
            group: ['@nadohq/indexer-client', '@nadohq/indexer-client/*'],
            message: 'Please use `@nadohq/client` instead.',
          },
          {
            group: ['@nadohq/trigger-client', '@nadohq/trigger-client/*'],
            message: 'Please use `@nadohq/client` instead.',
          },
          {
            group: ['@nadohq/utils', '@nadohq/utils/*'],
            message: 'Please use `@nadohq/client` instead.',
          },
          {
            group: ['@wagmi/core', '@wagmi/core/*'],
            message: 'Please use `wagmi` or `wagmi/actions` instead.',
          },
        ],
      },
    ],
    'react-hooks/exhaustive-deps': 'error',
  },
});
