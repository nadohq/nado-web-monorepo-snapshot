import { I18N } from './index';

// Declaration required for full type safety support
// See https://www.i18next.com/overview/typescript#create-a-declaration-file
declare module 'i18next' {
  interface CustomTypeOptions {
    /**
     * We can't use 'optimize' for now due to:
     * https://github.com/i18next/i18next/issues/2362#issuecomment-3498017057
     */
    enableSelector: true;
    defaultNS: typeof I18N.defaultNs;
    resources: (typeof I18N.allTranslations)['en'];
  }
}
