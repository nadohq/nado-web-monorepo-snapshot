import { defineConfig } from 'i18next-cli';
import { I18N } from './index';

export default defineConfig({
  locales: I18N.supportedLanguages,
  extract: {
    defaultNS: I18N.defaultNs,
    input: ['../../apps/trade/client/**/*.{ts,tsx}'],
    output: './locales/{{language}}/{{namespace}}.json',

    // explicitly set primary language to avoid issues in case of sorted `locales`
    // i18next's default is to pick first language in the `locales` array
    primaryLanguage: 'en',

    removeUnusedKeys: true,
  },
});
