import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import en from '../locales/en/translation.json'
import ru from '../locales/ru/translation.json'

const resources = {
  ru: { translation: ru },
  en: { translation: en },
} satisfies Record<string, { translation: typeof ru }>

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: (typeof resources)['ru']
  }
}

export const I18N_CONFIG = {
  fallbackLng: 'ru',
  supportedLngs: ['ru', 'en'],
  storageKey: 'keitaro-manager.language',
}

export const i18nReady = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: I18N_CONFIG.fallbackLng,
    supportedLngs: I18N_CONFIG.supportedLngs,
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: I18N_CONFIG.storageKey,
    },
  })

export default i18n
