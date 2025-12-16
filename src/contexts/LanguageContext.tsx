import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nManager, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n } from '../i18n';

type Language = 'en' | 'ar';

interface LanguageContextType {
    language: Language;
    isRTL: boolean;
    setLanguage: (lang: Language) => void;
    t: (key: string, options?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const LANGUAGE_KEY = '@clinify_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(
        I18nManager.isRTL ? 'ar' : 'en'
    );
    const isRTL = language === 'ar';

    // Load saved language on mount
    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
                if (savedLang === 'ar' || savedLang === 'en') {
                    setLanguageState(savedLang);
                    i18n.locale = savedLang;
                }
            } catch (error) {
                console.error('Failed to load language:', error);
            }
        };
        loadLanguage();
    }, []);

    const setLanguage = async (lang: Language) => {
        try {
            // Save preference first
            await AsyncStorage.setItem(LANGUAGE_KEY, lang);

            // Update state and i18n
            setLanguageState(lang);
            i18n.locale = lang;

            // Handle RTL - requires app restart
            const needsRTLChange = (lang === 'ar' && !I18nManager.isRTL) || (lang === 'en' && I18nManager.isRTL);

            if (needsRTLChange) {
                if (lang === 'ar') {
                    I18nManager.allowRTL(true);
                    I18nManager.forceRTL(true);
                } else {
                    I18nManager.allowRTL(false);
                    I18nManager.forceRTL(false);
                }

                // Alert user to restart for RTL changes
                Alert.alert(
                    lang === 'ar' ? 'تغيير اللغة' : 'Language Changed',
                    lang === 'ar'
                        ? 'يرجى إغلاق التطبيق وإعادة فتحه لتطبيق التغييرات بالكامل'
                        : 'Please close and reopen the app to fully apply the changes',
                    [{ text: lang === 'ar' ? 'حسناً' : 'OK' }]
                );
            }
        } catch (error) {
            console.error('Failed to save language:', error);
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
