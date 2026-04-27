import { I18N } from '@nadohq/i18n';
import { baseClientEnv } from 'common/environment/baseClientEnv';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

if (!i18n.isInitialized) {
  i18n.use(LanguageDetector).init({
    // disable i18next+locize advertisement console.info on init
    showSupportNotice: false,
    // enable additional logging on dev/testnet
    debug: baseClientEnv.enableExperimentalFeatures,

    supportedLngs: I18N.supportedLanguages,
    fallbackLng: I18N.fallbackLng,
    fallbackNS: I18N.defaultNs,
    defaultNS: I18N.defaultNs,
    resources: I18N.allTranslations,

    detection: {
      lookupCookie: 'NADO_LNG',
      order: ['cookie'],
      caches: ['cookie'],
    },

    interpolation: {
      escapeValue: false, // not needed with React
    },
  });
}

export default i18n;
