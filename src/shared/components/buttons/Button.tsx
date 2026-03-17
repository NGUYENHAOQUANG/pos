/**
 * @file Button.tsx
 * @description Reusable Button component following Ant Design principles with system colors
 * @author Kindy
 * @created 2025-01-XX
 * @updated 2025-01-XX - Redesigned with full variant support and icon integration
 *
 * @see https://rn.mobile.ant.design/components/button
 */
import { borderRadius, colors, sizes, spacing, typography } from '@/styles';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
    TextStyle,
    StyleProp,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
    /** Text to display on the button */
    title: string;
    /** Callback when button is pressed */
    onPress: () => void;
    /** Button variant style */
    variant?: ButtonVariant;
    /** Button size */
    size?: ButtonSize;
    /** Show loading indicator */
    loading?: boolean;
    /** Disable button interaction */
    disabled?: boolean;
    /** Button takes full width */
    fullWidth?: boolean;
    /** Icon name from Ionicons (left side) */
    iconLeft?: string;
    /** Icon name from Ionicons (right side) */
    iconRight?: string;
    /** Custom React node to render as left icon (overrides iconLeft) */
    renderLeftIcon?: React.ReactNode;
    /** Custom styles */
    style?: StyleProp<ViewStyle>;
    /** Custom text styles */
    textStyle?: TextStyle;
}

/**
 * Button component with Ant Design styling and system colors
 * Supports multiple variants, sizes, icons, and states
 */
export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    fullWidth = false,
    iconLeft,
    iconRight,
    renderLeftIcon,
    style,
    textStyle,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    // Get button styles based on variant and size
    const buttonStyles = [
        styles.button,
        styles[variant],
        styles[`${size}Size`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
    ];

    // Get text styles based on variant and size
    const textStyles = [
        styles.buttonText,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        isDisabled && styles.disabledText,
        textStyle,
    ];

    // Get icon color based on variant
    const getIconColor = (): string => {
        if (isDisabled) {
            return variant === 'primary' || variant === 'outline'
                ? colors.textTertiary
                : colors.textTertiary;
        }
        switch (variant) {
            case 'primary':
                return colors.white;
            case 'outline':
                return colors.text;
            case 'ghost':
            case 'text':
                return colors.primary;
            default:
                return colors.white;
        }
    };

    // Get icon size based on button size
    const getIconSize = (): number => {
        switch (size) {
            case 'small':
                return sizes.icon.sm;
            case 'medium':
                return sizes.icon.md;
            case 'large':
                return sizes.icon.lg;
            default:
                return sizes.icon.md;
        }
    };

    const iconColor = getIconColor();
    const iconSize = getIconSize();

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'primary' ? colors.white : colors.primary}
                />
            ) : (
                <View style={styles.content}>
                    {/* Custom SVG icon takes priority over Ionicons iconLeft */}
                    {renderLeftIcon ? (
                        <View style={styles.iconLeft}>{renderLeftIcon}</View>
                    ) : (
                        iconLeft && (
                            <Ionicons
                                name={iconLeft as any}
                                size={iconSize}
                                color={iconColor}
                                style={styles.iconLeft}
                            />
                        )
                    )}
                    {/* title: title, adjustsFontSizeToFit: true */}
                    <Text
                        style={textStyles}
                        maxFontSizeMultiplier={1.1}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {title}
                    </Text>
                    {iconRight && (
                        <Ionicons
                            name={iconRight as any}
                            size={iconSize}
                            color={iconColor}
                            style={styles.iconRight}
                        />
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: 'transparent',
    },

    // Variant styles
    primary: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    outline: {
        backgroundColor: colors.white,
        borderColor: colors.border,
    },
    ghost: {
        backgroundColor: 'transparent',
        borderColor: colors.primary,
    },
    text: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
    },

    // Size styles
    smallSize: {
        minHeight: sizes.button.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    mediumSize: {
        minHeight: sizes.button.md,
        paddingHorizontal: 12,
        paddingVertical: spacing.sm,
    },
    largeSize: {
        minHeight: sizes.button.lg,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },

    // Text styles
    buttonText: {
        fontWeight: typography.fontWeight.medium,
        textAlign: 'center',
    },
    primaryText: {
        color: colors.white,
    },
    outlineText: {
        color: colors.text,
    },
    ghostText: {
        color: colors.primary,
    },
    textText: {
        color: colors.primary,
    },

    // Size text styles
    smallText: {
        fontSize: typography.fontSize.sm,
        lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    },
    mediumText: {
        fontSize: typography.fontSize.base,
        lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    },
    largeText: {
        fontSize: typography.fontSize.lg,
        lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
    },

    // Content layout
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLeft: {
        marginRight: spacing.xs,
    },
    iconRight: {
        marginLeft: spacing.xs,
    },

    // States
    disabled: {
        opacity: 0.5,
    },
    disabledText: {
        opacity: 0.7,
    },

    // Full width
    fullWidth: {
        width: '100%',
    },
});
