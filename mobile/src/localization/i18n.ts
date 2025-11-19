import { I18n } from 'i18n-js';
import es from './translations/es.json';
import en from './translations/en.json';

const i18n = new I18n({
  es,
  en,
});

// Set default locale to Spanish for Ecuador
i18n.defaultLocale = 'es';
i18n.locale = 'es';

// Enable fallbacks
i18n.enableFallback = true;

export default i18n;