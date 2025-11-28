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
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
} as const;

export type BorderRadius = typeof borderRadius;
