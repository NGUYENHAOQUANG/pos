/**
 * @file typography.ts
 * @description Typography system using Google Sans Flex 120pt
 * @author Kindy
 * @created 2025-11-16
 * @updated 2026-03-16
 */

/**
 * Google Sans Flex font family mapping
 * Use font file name without extension (works on both iOS and Android)
 */
export const fontFamily = {
    thin: 'GoogleSansFlex_120pt-Thin',
    extraLight: 'GoogleSansFlex_120pt-ExtraLight',
    light: 'GoogleSansFlex_120pt-Light',
    regular: 'GoogleSansFlex_120pt-Regular',
    medium: 'GoogleSansFlex_120pt-Medium',
    semiBold: 'GoogleSansFlex_120pt-SemiBold',
    bold: 'GoogleSansFlex_120pt-Bold',
    extraBold: 'GoogleSansFlex_120pt-ExtraBold',
    black: 'GoogleSansFlex_120pt-Black',
} as const;

export type FontFamily = typeof fontFamily;

/**
 * Map fontWeight string to corresponding fontFamily
 * Used by AppText to auto-resolve font file from weight
 */
export const fontWeightToFamily: Record<string, string> = {
    '100': fontFamily.thin,
    '200': fontFamily.extraLight,
    '300': fontFamily.light,
    '400': fontFamily.regular,
    normal: fontFamily.regular,
    '500': fontFamily.medium,
    '600': fontFamily.semiBold,
    '700': fontFamily.bold,
    bold: fontFamily.bold,
    '800': fontFamily.extraBold,
    '900': fontFamily.black,
};

export const typography = {
    // Font families (backward compatible)
    fontFamily: {
        regular: fontFamily.regular,
        medium: fontFamily.medium,
        bold: fontFamily.bold,
        light: fontFamily.light,
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
