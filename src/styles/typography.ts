/**
 * @file typography.ts
 * @description Typography system
 * @author Kindy
 * @created 2025-11-16
 */
import { Platform } from 'react-native';

export const typography = {
    // Font families
    fontFamily: {
        regular: Platform.select({
            ios: 'System',
            android: 'sans-serif',
            default: 'System',
        }),
        medium: Platform.select({
            ios: 'System',
            android: 'sans-serif-medium',
            default: 'System',
        }),
        bold: Platform.select({
            ios: 'System',
            android: 'sans-serif',
            default: 'System',
        }),
        light: Platform.select({
            ios: 'System',
            android: 'sans-serif-light',
            default: 'System',
        }),
    },

    // Font sizes
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
    },

    // Line heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Font weights
    // React Native accepts both string and number for fontWeight
    // Using string format for better compatibility
    fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
} as const;

export type Typography = typeof typography;
