/**
 * @file borderRadius.ts
 * @description Border radius system
 * @author LinhDang
 * @created 2025-11-17
 */
export const borderRadius = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    full: 9999,
} as const;

export type BorderRadius = typeof borderRadius;
