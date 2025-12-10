/**
 * @file colors.ts
 * @description Color palette
 * @author Kindy
 * @created 2025-11-16
 */
export const colors = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0051D5',
  primaryLight: '#5AC8FA',

  // Secondary colors
  secondary: '#5856D6',
  secondaryDark: '#3634A3',
  secondaryLight: '#AF52DE',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',

  // Background colors
  background: '#FFFFFF',
  backgroundPrimary: '#F0F5FF', // Light blue background for screens
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',
  backgroundButton: '#F9FAFB',
  backgroundIconBtn: '#FAFAFA',

  // Text colors
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',

  // Utilities
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Custom colors
  orange: '#FF5630',

  // Status colors (for DevicesStatus)
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
    // Other - Gray
    otherText: '#1F2937',
    otherBg: '#F9FAFB',
  },
} as const;

export type Colors = typeof colors;
