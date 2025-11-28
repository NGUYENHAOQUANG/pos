/**
 * @file commonStyles.ts
 * @description Common reusable styles
 * @author Kindy
 * @created 2025-11-17
 */
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { borderRadius } from './borderRadius';
import { shadows } from './shadows';
import { typography } from './typography';

export const commonStyles = StyleSheet.create({
    // Container styles
    container: {
        flex: 1,
        backgroundColor: colors.background,
    } as ViewStyle,

    containerPadded: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
    } as ViewStyle,

    // Card styles
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        ...shadows.sm,
    } as ViewStyle,

    cardLarge: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.md,
    } as ViewStyle,

    // Header styles
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    } as ViewStyle,

    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    } as TextStyle,

    // Section styles
    section: {
        marginBottom: spacing.lg,
    } as ViewStyle,

    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    } as TextStyle,

    // Empty state styles
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing['3xl'],
    } as ViewStyle,

    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: borderRadius.full,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    } as ViewStyle,

    emptyTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.sm,
    } as TextStyle,

    emptyDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
        maxWidth: 280,
        paddingHorizontal: spacing.sm,
    } as TextStyle,

    // Divider
    divider: {
        height: 1,
        backgroundColor: colors.border,
    } as ViewStyle,

    dividerVertical: {
        width: 1,
        backgroundColor: colors.border,
    } as ViewStyle,

    // Row styles
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,

    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as ViewStyle,

    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,

    // Text styles
    textCenter: {
        textAlign: 'center',
    } as TextStyle,

    textBold: {
        fontWeight: typography.fontWeight.bold,
    } as TextStyle,

    textSemibold: {
        fontWeight: typography.fontWeight.semibold,
    } as TextStyle,

    textMedium: {
        fontWeight: typography.fontWeight.medium,
    } as TextStyle,
});

// Spacing utilities (defined outside StyleSheet.create for nested object support)
export const spacingStyles = {
    mt: {
        xs: { marginTop: spacing.xs } as ViewStyle,
        sm: { marginTop: spacing.sm } as ViewStyle,
        md: { marginTop: spacing.md } as ViewStyle,
        lg: { marginTop: spacing.lg } as ViewStyle,
        xl: { marginTop: spacing.xl } as ViewStyle,
    },

    mb: {
        xs: { marginBottom: spacing.xs } as ViewStyle,
        sm: { marginBottom: spacing.sm } as ViewStyle,
        md: { marginBottom: spacing.md } as ViewStyle,
        lg: { marginBottom: spacing.lg } as ViewStyle,
        xl: { marginBottom: spacing.xl } as ViewStyle,
    },

    mx: {
        xs: { marginHorizontal: spacing.xs } as ViewStyle,
        sm: { marginHorizontal: spacing.sm } as ViewStyle,
        md: { marginHorizontal: spacing.md } as ViewStyle,
        lg: { marginHorizontal: spacing.lg } as ViewStyle,
        xl: { marginHorizontal: spacing.xl } as ViewStyle,
    },

    my: {
        xs: { marginVertical: spacing.xs } as ViewStyle,
        sm: { marginVertical: spacing.sm } as ViewStyle,
        md: { marginVertical: spacing.md } as ViewStyle,
        lg: { marginVertical: spacing.lg } as ViewStyle,
        xl: { marginVertical: spacing.xl } as ViewStyle,
    },

    p: {
        xs: { padding: spacing.xs } as ViewStyle,
        sm: { padding: spacing.sm } as ViewStyle,
        md: { padding: spacing.md } as ViewStyle,
        lg: { padding: spacing.lg } as ViewStyle,
        xl: { padding: spacing.xl } as ViewStyle,
    },

    px: {
        xs: { paddingHorizontal: spacing.xs } as ViewStyle,
        sm: { paddingHorizontal: spacing.sm } as ViewStyle,
        md: { paddingHorizontal: spacing.md } as ViewStyle,
        lg: { paddingHorizontal: spacing.lg } as ViewStyle,
        xl: { paddingHorizontal: spacing.xl } as ViewStyle,
    },

    py: {
        xs: { paddingVertical: spacing.xs } as ViewStyle,
        sm: { paddingVertical: spacing.sm } as ViewStyle,
        md: { paddingVertical: spacing.md } as ViewStyle,
        lg: { paddingVertical: spacing.lg } as ViewStyle,
        xl: { paddingVertical: spacing.xl } as ViewStyle,
    },
};
