import { createI18n } from 'vue-i18n'

import de from './locales/de.json'
import en from './locales/en.json'
import it from './locales/it.json'
import fr from './locales/fr.json'

const i18n = createI18n({
  legacy: false,
  locale: 'de', // Set default to German 🇩🇪
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    de,
    en,
    it,
    fr,
  },
})

export default i18n
