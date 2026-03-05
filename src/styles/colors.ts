/**
 * @file colors.ts
 * @description Color palette
 * @author Kindy
 * @created 2025-11-16
 */
export const colors = {
    transparent: 'transparent',
    // Primary colors
    primary: '#006AFF',
    primaryDark: '#0051D5',
    primaryLight: '#5AC8FA',

    // Secondary colors
    secondary: '#5856D6',
    secondaryDark: '#3634A3',
    secondaryLight: '#AF52DE',

    // Neutral colors
    white: '#FFFFFF',
    black: '#000000',
    neutral: '#F7FAFD',
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E6E8EC',
        240: '#F0F0F0',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
        950: '#0B1117',
    },
    volcano: {
        200: '#FFFCF5',
        300: '#FEDF89',
        400: '#FFA39E',
        600: '#e7412bff',
        100: '#FFF1F0',
        900: '#DC6803',
    },
    magenta: {
        100: '#FEF6FB',
        300: '#FCCEEE',
        900: '#DD2590',
    },
    cyan: {
        50: '#E6FFFB',
        600: '#87E8DE',
        800: '#08979C',
    },
    blue: {
        50: '#E6F4FF',
        200: '#C3E6FF',
        300: '#BAE0FF',
        400: '#91CAFF',
        600: '#1677FF',
        700: '#003EB3',
        800: '#061178',
    },
    geekblue: {
        100: '#F5FAFF',
        300: '#B2DDFF',
        900: '#1570EF',
    },
    orange: {
        50: '#FFF2E8',
        100: '#FFE7BA',
        200: '#FFBB96',
        500: '#D48806',
        600: '#FA541C',
        700: '#FF7A45',
        800: '#FD6900',
    },
    green: {
        25: '#F6FEF9',
        50: '#F6FFED',
        100: '#D9F7BE',
        300: '#B7EB8F',
        500: '#4dff00a2',
        600: '#16A34A',
        800: '#237804',
    },
    purple: {
        50: '#F9F0FF',
        300: '#D3ADF7',
        600: '#722ED1',
    },
    pink: {
        50: '#FFF0F6',
        300: '#FFADD2',
        600: '#EB2F96',
    },
    red: {
        50: '#FFF0F6',
        300: '#FFADD2',
        500: '#F5222D',
        600: '#eb2f2fff',
        900: '#FF4D4F',
    },
    yellow: {
        25: '#FFFCF5',
        50: '#FFFBE6',
        200: '#FEDF89',
        300: '#FFE58F',
        600: '#DC6803',
        700: '#FFC107',
        800: '#876800',
    },
    brown: {
        900: '#610B00',
    },
    // Semantic colors
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    errorBackground: '#FFF1F0', // Light error background
    info: '#007AFF',

    // Background colors
    background: '#FFFFFF',
    backgroundPrimary: '#F0F5FF',
    //backgroundPrimary: '#FAFAF9',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',
    backgroundButton: '#F9FAFB',
    backgroundIconBtn: '#FAFAFA',
    backgroundSubtle: '#00000005', // Very light black background (5% opacity)

    // Text colors
    text: '#000000E0',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textMuted: '#000000A6', // Text with reduced opacity (65% opacity)
    textInverse: '#FFFFFF',

    // Border colors
    defaultBorder: '#DEE4ED',
    border: '#E5E7EB',
    borderMedium: '#E2E8F0', // Medium border color
    borderLight: '#F3F4F6',
    borderDark: '#D1D5DB',
    borderDisabled: '#E0E0E0', // Disabled border color
    borderSubtle: '#00000040', // Subtle black border (40% opacity)

    // Utilities
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.45)', // Lighter overlay for modals
    overlayLoading: 'rgba(255, 255, 255, 0.7)',
    // Status colors (for DevicesStatus)
    healthStatus: {
        healthy: '#4CAF50',
        warning: '#FF6E6E',
        critical: '#FF6E6E',
        default: '#9E9E9E',
    },
    status: {
        // Total ponds - Blue
        totalText: '#2F6BFF',
        totalBg: '#F0F6FF',
        // Active - Green
        activeText: '#2E7D32',
        activeBg: '#F1F8E9',
        // Warning - Red
        warningText: '#D32F2F',
        warningBg: '#FFEBEE',
        // Warning highlight (yellow background for warnings like pH)
        warningHighlightBg: '#FFFBE6',
        warningHighlightText: '#D48806', // Using orange[500]
        // Other - Gray
        otherText: '#1F2937',
        otherBg: '#F9FAFB',
    },

    // Schedule colors
    schedule: {
        remote: '#D6E4FF',
        schedule: '#FFF3CD',
        local: '#D4EDDA',
    },

    onboarding: {
        gradientTop: 'rgba(233,253,255, 1)',
        gradientBottom: 'rgba(252,242,240, 1)',
    },
} as const;

export type Colors = typeof colors;
