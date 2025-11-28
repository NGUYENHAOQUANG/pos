/**
 * @file index.ts
 * @description Centralized export for all styles
 * @author Kindy
 * @created 2025-11-17
 */
export { colors } from './colors';
export type { Colors } from './colors';

export { spacing } from './spacing';
export type { Spacing } from './spacing';

export { typography } from './typography';
export type { Typography } from './typography';

export { shadows } from './shadows';
export type { Shadows } from './shadows';

export { borderRadius } from './borderRadius';
export type { BorderRadius } from './borderRadius';

export { layout } from './layout';
export type { Layout } from './layout';

export { sizes } from './sizes';
export type { Sizes } from './sizes';

export { commonStyles, spacingStyles } from './commonStyles';

// Re-export theme for backward compatibility
export { theme } from '../core/config/theme';
