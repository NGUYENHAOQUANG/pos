/**
 * @file Input.tsx
 * @description Reusable Input component following Ant Design principles with system colors
 * @author Kindy
 * @created 2025-01-XX
 * @updated 2025-01-XX - Redesigned with full Ant Design styling and password toggle
 *
 * @see https://rn.mobile.ant.design/components/input-item
 */
import { colors, sizes, spacing, typography } from '@/styles';
import React, { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface InputProps extends Omit<TextInputProps, 'style'> {
    /** Label text displayed above the input */
    label?: string | React.ReactNode;
    /** Placeholder text */
    placeholder?: string;
    /** Input value */
    value: string;
    /** Callback when text changes */
    onChangeText: (text: string) => void;
    /** Callback when input loses focus */
    onBlur?: () => void;
    /** Icon name from Ionicons (left side) */
    icon?: string;
    /** Icon name from Ionicons (right side) */
    iconRight?: string;
    /** Callback when right icon is pressed */
    onIconPress?: () => void;
    /** Hide text input (for passwords) */
    secureTextEntry?: boolean;
    /** Error message to display */
    error?: string;
    /** Show required indicator (*) */
    required?: boolean;
    /** Disable input interaction */
    disabled?: boolean;
    /** Custom container styles */
    containerStyle?: ViewStyle;
    /** Custom input styles */
    /** Custom input styles */
    inputStyle?: ViewStyle;
    /** Custom input container styles (inner box) */
    inputContainerStyle?: ViewStyle;
}

/**
 * Input component with Ant Design styling and system colors
 * Supports labels, icons, validation, password toggle, and error states
 */
export function Input({
    label,
    placeholder,
    value,
    onChangeText,
    onBlur,
    icon,
    iconRight,
    onIconPress,
    secureTextEntry = false,
    error,
    required = false,
    disabled = false,
    containerStyle,
    inputContainerStyle,
    inputStyle,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    multiline = false,
    numberOfLines = 1,
    ...restProps
}: InputProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Handle password visibility toggle
    const handlePasswordToggle = () => {
        setIsPasswordVisible(!isPasswordVisible);
        if (onIconPress) {
            onIconPress();
        }
    };

    // Determine if we should show password toggle
    const showPasswordToggle = secureTextEntry && !iconRight;

    // Get border color based on state
    const getBorderColor = (): string => {
        if (error) return colors.error;
        // Focus state uses default border color as requested
        return colors.border;
    };

    // Get icon color
    const getIconColor = (): string => {
        if (disabled) return colors.textTertiary;
        if (error) return colors.error;
        if (isFocused) return colors.primary;
        return colors.textSecondary;
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {/* Label */}
            {label && (
                <Text style={styles.label}>
                    {required && <Text style={styles.required}>* </Text>}
                    {label}
                </Text>
            )}

            {/* Input Container */}
            <View
                style={[
                    styles.inputContainer,
                    { borderColor: getBorderColor() },
                    isFocused && styles.inputContainerFocused,
                    error && styles.inputContainerError,
                    disabled && styles.inputContainerDisabled,
                    inputContainerStyle,
                ]}
            >
                {/* Left Icon */}
                {icon && (
                    <Ionicons
                        name={icon as any}
                        size={sizes.icon.sm}
                        color={getIconColor()}
                        style={styles.iconLeft}
                    />
                )}

                {/* Text Input */}
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.inputMultiline,
                        disabled && styles.inputDisabled,
                        inputStyle,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    onBlur={() => {
                        setIsFocused(false);
                        onBlur?.();
                    }}
                    onFocus={() => setIsFocused(true)}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={!disabled}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    {...restProps}
                />

                {/* Right Icon or Password Toggle */}
                {(iconRight || showPasswordToggle) && (
                    <TouchableOpacity
                        onPress={showPasswordToggle ? handlePasswordToggle : onIconPress}
                        activeOpacity={0.7}
                        style={styles.iconRightButton}
                        disabled={disabled}
                    >
                        <Ionicons
                            name={
                                showPasswordToggle
                                    ? isPasswordVisible
                                        ? 'eye-outline'
                                        : 'eye-off-outline'
                                    : (iconRight as any)
                            }
                            size={sizes.icon.sm}
                            color={getIconColor()}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Error Message */}
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
        marginBottom: spacing.sm,
    },
    required: {
        color: colors.error,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.white,
        height: 40,
        paddingHorizontal: spacing.md,
    },
    inputContainerFocused: {
        // Focus styles removed to match default border design
    },
    inputContainerError: {
        borderColor: colors.error,
    },
    inputContainerDisabled: {
        backgroundColor: colors.backgroundSecondary,
        opacity: 0.6,
    },
    iconLeft: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        letterSpacing: 0,
        paddingVertical: 0,
        height: '100%', // Match container height
        // iOS doesn't support textAlignVertical, use lineHeight instead
        ...Platform.select({
            ios: {
                lineHeight: 40, // Same as inputContainer height to center text vertically
            },
            android: {
                textAlignVertical: 'center' as const,
            },
        }),
    },
    inputMultiline: {
        minHeight: sizes.input.md * 2,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
        textAlignVertical: 'top',
    },
    inputDisabled: {
        color: colors.textTertiary,
    },
    iconRightButton: {
        marginLeft: spacing.sm,
        padding: spacing.xs,
    },
    errorText: {
        fontSize: typography.fontSize.xs,
        color: colors.error,
        marginTop: spacing.xs,
    },
});
