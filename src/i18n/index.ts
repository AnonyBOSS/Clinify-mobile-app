import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import { en } from './en';
import { ar } from './ar';

const i18n = new I18n({
    en,
    ar,
});

// Set default locale from device
const deviceLocale = getLocales()[0]?.languageCode || 'en';
i18n.locale = deviceLocale === 'ar' ? 'ar' : 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export { i18n };
export { en, ar };
