// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://clinic-web-app-two.vercel.app';

// App Configuration
export const APP_NAME = 'Clinify';
export const APP_VERSION = '1.0.0';

// Default values
export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
