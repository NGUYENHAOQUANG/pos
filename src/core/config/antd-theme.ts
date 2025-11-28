/**
 * @file antd-theme.ts
 * @description Ant Design React Native theme configuration
 * Maps existing design tokens to ANTD-RN theme structure
 * @author LinhDang
 * @created 2025-11-17
 * @see https://rn.mobile.ant.design/docs/react/introduce
 */
import { Theme } from '@ant-design/react-native/lib/style';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { borderRadius } from '../../styles/borderRadius';
import { typography } from '../../styles/typography';

/**
 * Custom Ant Design theme that maps our design tokens
 * to ANTD-RN theme variables
 */
export const antdTheme: Partial<Theme> = {
    // Brand colors
    brand_primary: colors.primary,
    brand_primary_tap: colors.primaryDark,
    brand_success: colors.success,
    brand_warning: colors.warning,
    brand_error: colors.error,
    brand_important: colors.error,
    brand_wait: colors.warning,

    // Text colors
    color_text_base: colors.text,
    color_text_base_inverse: colors.textInverse,
    color_text_secondary: colors.textSecondary,
    color_text_placeholder: colors.textTertiary,
    color_text_disabled: colors.textTertiary,
    color_text_caption: colors.textSecondary,
    color_text_paragraph: colors.text,
    color_link: colors.primary,

    // Background colors
    fill_base: colors.white,
    fill_body: colors.background,
    fill_tap: colors.backgroundSecondary,
    fill_disabled: colors.border,
    fill_mask: 'rgba(0, 0, 0, 0.4)',
    fill_grey: colors.backgroundSecondary,

    // Border colors
    border_color_base: colors.border,
    border_width_sm: 0.5,
    border_width_md: 1,
    border_width_lg: 2,

    // Border radius
    radius_xs: borderRadius.xs,
    radius_sm: borderRadius.sm,
    radius_md: borderRadius.md,
    radius_lg: borderRadius.lg,
    radius_circle: borderRadius.full,

    // Typography
    font_size_icontext: typography.fontSize.xs,
    font_size_caption_sm: typography.fontSize.xs,
    font_size_base: typography.fontSize.base,
    font_size_subhead: typography.fontSize.sm,
    font_size_caption: typography.fontSize.sm,
    font_size_heading: typography.fontSize.xl,
    font_size_display_sm: typography.fontSize['2xl'],
    font_size_display_md: typography.fontSize['3xl'],
    font_size_display_lg: typography.fontSize['4xl'],
    font_size_display_xl: typography.fontSize['5xl'],

    // Spacing - horizontal
    h_spacing_xs: spacing.xs,
    h_spacing_sm: spacing.sm,
    h_spacing_md: spacing.md,
    h_spacing_lg: spacing.lg,
    h_spacing_xl: spacing.xl,

    // Spacing - vertical
    v_spacing_xs: spacing.xs,
    v_spacing_sm: spacing.sm,
    v_spacing_md: spacing.md,
    v_spacing_lg: spacing.lg,
    v_spacing_xl: spacing.xl,

    // Component specific
    button_height: 48,
    button_height_sm: 36,
    button_font_size: typography.fontSize.base,
    button_font_size_sm: typography.fontSize.sm,

    input_font_size: typography.fontSize.base,
    input_color_icon: colors.textSecondary,
    input_color_icon_tap: colors.primary,

    // Opacity
    opacity_disabled: 0.4,

    // Icon sizes
    icon_size_xxs: 12,
    icon_size_xs: 16,
    icon_size_sm: 18,
    icon_size_md: 20,
    icon_size_lg: 24,

    // Z-index
    toast_zindex: 1999,
    action_sheet_zindex: 1000,
    popup_zindex: 999,
    modal_zindex: 999,
};
