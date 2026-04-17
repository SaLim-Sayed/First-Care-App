'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../public/locales/en/translation.json';
import arTranslation from '../public/locales/ar/translation.json';

// Locale is driven by the `[lng]` URL segment; `LocaleSync` calls `changeLanguage`.
i18next.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    ar: { translation: arTranslation },
  },
  fallbackLng: 'en',
  supportedLngs: ['en', 'ar'],
  defaultNS: 'translation',
  ns: ['translation'],
  keySeparator: '.',
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
