import React, { createContext, useContext, useState, ReactNode } from 'react';
import { I18nManager } from 'react-native';
import { i18n } from '../i18n';

type Language = 'en' | 'ar';

interface LanguageContextType {
    language: Language;
    isRTL: boolean;
    setLanguage: (lang: Language) => void;
    t: (key: string, options?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(
        i18n.locale === 'ar' ? 'ar' : 'en'
    );
    const isRTL = language === 'ar';

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        i18n.locale = lang;

        // Handle RTL
        if (lang === 'ar' && !I18nManager.isRTL) {
            I18nManager.allowRTL(true);
            I18nManager.forceRTL(true);
        } else if (lang === 'en' && I18nManager.isRTL) {
            I18nManager.allowRTL(false);
            I18nManager.forceRTL(false);
        }
    };

    const t = (key: string, options?: Record<string, any>): string => {
        return i18n.t(key, options);
    };

    return (
        <LanguageContext.Provider value={{ language, isRTL, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
