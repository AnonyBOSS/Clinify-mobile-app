// Light theme colors
export const lightColors = {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',
    secondary: '#EC4899',
    secondaryDark: '#DB2777',
    secondaryLight: '#F472B6',

    // Backgrounds
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',

    // Text
    text: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textOnPrimary: '#FFFFFF',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Borders
    border: '#E2E8F0',
    borderLight: '#F1F5F9',

    // Shadows
    shadow: 'rgba(0, 0, 0, 0.1)',

    // Specific
    cardBackground: '#FFFFFF',
    inputBackground: '#F8FAFC',
    tabBarBackground: '#FFFFFF',
    headerBackground: '#FFFFFF',
};

// Dark theme colors
export const darkColors = {
    primary: '#818CF8',
    primaryDark: '#6366F1',
    primaryLight: '#A5B4FC',
    secondary: '#F472B6',
    secondaryDark: '#EC4899',
    secondaryLight: '#F9A8D4',

    // Backgrounds
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',

    // Text
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    textOnPrimary: '#FFFFFF',

    // Status
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    // Borders
    border: '#334155',
    borderLight: '#475569',

    // Shadows
    shadow: 'rgba(0, 0, 0, 0.3)',

    // Specific
    cardBackground: '#1E293B',
    inputBackground: '#334155',
    tabBarBackground: '#1E293B',
    headerBackground: '#1E293B',
};

export type ThemeColors = typeof lightColors;

// Spacing
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Border radius
export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

// Typography
export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        lineHeight: 40,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 28,
    },
    h4: {
        fontSize: 18,
        fontWeight: '500' as const,
        lineHeight: 24,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 24,
    },
};
