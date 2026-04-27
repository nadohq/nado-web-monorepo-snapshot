import en from './locales/en';
import es from './locales/es';
import ja from './locales/ja';
import zh from './locales/zh';

const ALL_TRANSLATIONS = { en, es, ja, zh } as const;

export const I18N = {
  allTranslations: ALL_TRANSLATIONS,
  defaultNs: 'common',
  fallbackLng: 'en',
  supportedLanguages: Object.keys(ALL_TRANSLATIONS),
  languageSelector: Object.entries(ALL_TRANSLATIONS).map(
    ([code, { languageSelector }]) => ({
      code,
      label: languageSelector.languageName,
    }),
  ),
} as const;
