import React, { useState, useEffect } from 'react';
import { View, I18nManager, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { RootNavigator } from './src/navigation';

const LANGUAGE_KEY = '@clinify_language';

function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeRTL = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
        const shouldBeRTL = savedLang === 'ar';

        // Force RTL based on saved language preference
        if (shouldBeRTL && !I18nManager.isRTL) {
          I18nManager.allowRTL(true);
          I18nManager.forceRTL(true);
        } else if (!shouldBeRTL && I18nManager.isRTL) {
          I18nManager.allowRTL(false);
          I18nManager.forceRTL(false);
        }
      } catch (error) {
        console.error('Failed to initialize RTL:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeRTL();
  }, []);

  if (!isReady) {
    // Show a minimal loading state while checking RTL
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0E1A' }} />
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
