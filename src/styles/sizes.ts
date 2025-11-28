/**
 * @file sizes.ts
 * @description Common size constants
 * @author LinhDang
 * @created 2025-11-17
 */
export const sizes = {
    // Icon sizes
    icon: {
        xs: 16,
        sm: 20,
        md: 24,
        lg: 32,
        xl: 36,
        '2xl': 48,
    },

    // Button heights
    button: {
        sm: 32,
        md: 44,
        lg: 52,
        xl: 60,
    },

    // Input heights
    input: {
        sm: 36,
        md: 44,
        lg: 52,
    },

    // Avatar sizes
    avatar: {
        xs: 24,
        sm: 32,
        md: 40,
        lg: 56,
        xl: 80,
        '2xl': 120,
    },

    // Badge sizes
    badge: {
        sm: 16,
        md: 20,
        lg: 24,
    },

    // Header heights
    header: {
        default: 56,
        large: 72,
    },

    // Tab bar heights
    tabBar: {
        ios: 88,
        android: 60,
    },

    // Page indicator dot size
    indicator: 8,
} as const;

export type Sizes = typeof sizes;
