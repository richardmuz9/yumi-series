import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

type LanguageCode = 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US' | 'en-GB' | 'ja-JP' | 'ko-KR';
type LanguageMap = Record<LanguageCode, string>;

const languageMapping: LanguageMap = {
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  'zh-HK': 'zh',
  'en-US': 'en',
  'en-GB': 'en',
  'ja-JP': 'ja',
  'ko-KR': 'ko'
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    ns: [
      'main',          // Main page translations
      'writing',       // Writing screen translations
      'report',        // Report writer section
      'helper',        // Writing helper section
      'anime',         // Anime character helper
      'image',         // AI image generation
      'billing',       // Charge page
      'download',      // Download page
      'common'         // Shared translations
    ],
    defaultNS: 'main',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
      cookieMinutes: 60 * 24 * 30, // 30 days
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng'
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    }
  } as const);

export default i18n; 