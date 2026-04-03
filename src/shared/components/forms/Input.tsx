/**
 * @file Input.tsx
 * @description Reusable Input component following Ant Design principles with system colors
 * @author Kindy
 * @created 2025-01-XX
 * @updated 2025-01-XX - Redesigned with full Ant Design styling and password toggle
 *
 * @see https://rn.mobile.ant.design/components/input-item
 */
import { sizes, spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import React, { useState, useCallback } from 'react';
import {
    Platform,
    StyleSheet,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { InputFilters } from '@/shared/regex';

/** Input format types for controlling what characters are allowed */
export enum InputFormat {
    /** Allow any text (default) */
    TEXT = 'TEXT',
    /** Allow only digits (0-9) */
    INTEGER = 'INTEGER',
    /** Allow digits and at most one decimal point */
    DECIMAL = 'DECIMAL',
    /** Use a custom regex pattern to validate each keystroke */
    REGEX = 'REGEX',
}

export interface InputProps extends Omit<TextInputProps, 'style' | 'onChange' | 'value'> {
    /** Label text displayed above the input */
    label?: string | React.ReactNode;
    /** Placeholder text */
    placeholder?: string;
    /** Input value */
    value?: string;
    /** Callback when text changes */
    onChangeText?: (text: string) => void;
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
    inputStyle?: TextStyle;
    /** Custom input container styles (inner box) */
    inputContainerStyle?: ViewStyle;
    /** Content to display at the right end of the input (e.g., units) */
    suffix?: string | React.ReactNode;
    /** Ellipsize mode for the text (only works when disabled) */
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
    /** Input format — controls allowed characters */
    inputFormat?: InputFormat;
    /** Custom regex pattern (used when inputFormat = REGEX) */
    formatPattern?: RegExp;
    /** Maximum number of characters allowed */
    maxDigits?: number;
    /** Always reserve space for error/hint text to prevent layout shift */
    reserveErrorSpace?: boolean;
    /** Hint/warning text displayed below input — does NOT change border color */
    hint?: string;
    /** Maximum number of decimal places allowed (only applies to DECIMAL format) */
    maxDecimalPlaces?: number;
    /** Maximum number of integer digits allowed (only applies to DECIMAL format) */
    maxIntegerPlaces?: number;
}

export const RequiredDot = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    return <View style={styles.requiredDot} />;
};

/**
 * Input component with Ant Design styling and system colors
 * Supports labels, icons, validation, password toggle, and error states
 */
export function Input({
    label,
    placeholder = 'Nhập',
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
    suffix,
    ellipsizeMode,
    inputFormat = InputFormat.TEXT,
    formatPattern,
    maxDigits,
    reserveErrorSpace = false,
    hint,
    maxDecimalPlaces,
    maxIntegerPlaces,
    ...restProps
}: InputProps) {
    const theme = useAppTheme();
    const styles = getStyles(theme);

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

    // Filter text based on inputFormat and maxDigits
    const handleChangeText = useCallback(
        (text: string) => {
            let filtered = text;

            switch (inputFormat) {
                case InputFormat.INTEGER:
                    filtered = InputFilters.integer(text);
                    break;
                case InputFormat.DECIMAL:
                    filtered = InputFilters.decimal(text, maxDecimalPlaces, maxIntegerPlaces);
                    break;
                case InputFormat.REGEX:
                    if (formatPattern) {
                        const result = InputFilters.matchRegex(text, formatPattern);
                        if (result === null) return;
                    }
                    break;
                case InputFormat.TEXT:
                default:
                    break;
            }

            // Apply maxDigits limit
            if (maxDigits !== undefined && filtered.length > maxDigits) {
                filtered = filtered.slice(0, maxDigits);
            }

            onChangeText?.(filtered);
        },
        [inputFormat, formatPattern, maxDigits, maxDecimalPlaces, maxIntegerPlaces, onChangeText]
    );

    // Get border color based on state
    const getBorderColor = (): string => {
        if (error) return theme.error;
        // Focus state uses default border color as requested
        return theme.defaultBorder;
    };

    // Get icon color
    const getIconColor = (): string => {
        if (disabled) return theme.textTertiary;
        if (error) return theme.error;
        if (isFocused) return theme.primary;
        return theme.textSecondary;
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {/* Label */}
            {label && (
                <View style={styles.labelWrapper}>
                    <Text style={styles.label} maxFontSizeMultiplier={1.1}>
                        {label}
                    </Text>
                    {/* Small required dot 4x4 displayed to the right of label */}
                    {required && <RequiredDot />}
                </View>
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
                <View style={{ flex: 1 }}>
                    {disabled && ellipsizeMode ? (
                        <Text
                            numberOfLines={1}
                            ellipsizeMode={ellipsizeMode}
                            style={[
                                styles.input,
                                inputStyle,
                                {
                                    color: theme.textTertiary,
                                    fontSize: 14,
                                    lineHeight: Platform.OS === 'ios' ? 0 : 1.54 * 14,
                                },
                            ]}
                        >
                            {value || placeholder}
                        </Text>
                    ) : (
                        <TextInput
                            value={value}
                            onChangeText={handleChangeText}
                            placeholder={placeholder}
                            placeholderTextColor={theme.textTertiary}
                            editable={!disabled}
                            secureTextEntry={secureTextEntry && !isPasswordVisible}
                            keyboardType={keyboardType}
                            autoCapitalize={autoCapitalize}
                            multiline={multiline}
                            textAlignVertical="center"
                            numberOfLines={numberOfLines}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => {
                                setIsFocused(false);
                                onBlur?.();
                            }}
                            style={[
                                styles.input,
                                inputStyle,
                                multiline && styles.inputMultiline,
                                {
                                    fontSize: 14,
                                    color: disabled
                                        ? theme.textTertiary
                                        : error
                                        ? theme.error
                                        : theme.text,
                                    ...Platform.select({
                                        android: {
                                            lineHeight: 1.54 * 14,
                                        },
                                    }),
                                },
                            ]}
                            {...restProps}
                        />
                    )}
                </View>

                {/* Suffix */}
                {suffix && (
                    <View style={styles.suffixWrapper}>
                        {typeof suffix === 'string' ? (
                            <Text style={styles.suffixText} maxFontSizeMultiplier={1.1}>
                                {suffix}
                            </Text>
                        ) : (
                            suffix
                        )}
                    </View>
                )}

                {/* Right Icon / Password Toggle */}
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
            {/* Error / Hint Message */}
            {(() => {
                const displayText = error || hint;
                if (reserveErrorSpace) {
                    return (
                        <Text
                            style={[
                                styles.errorText,
                                hint && !error && styles.hintText,
                                !displayText && styles.errorTextHidden,
                            ]}
                            maxFontSizeMultiplier={1.1}
                        >
                            {displayText || ' '}
                        </Text>
                    );
                }
                if (error) {
                    return (
                        <Text style={styles.errorText} maxFontSizeMultiplier={1.1}>
                            {error}
                        </Text>
                    );
                }
                if (hint) {
                    return (
                        <Text
                            style={[styles.errorText, styles.hintText]}
                            maxFontSizeMultiplier={1.1}
                        >
                            {hint}
                        </Text>
                    );
                }
                return null;
            })()}
        </View>
    );
}

const INPUT_HEIGHT = 40;

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            marginBottom: 12,
        },
        requiredDot: {
            width: 4,
            height: 4,
            borderRadius: 3,
            backgroundColor: theme.error,
            marginLeft: 2,
        },
        labelWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 6,
        },
        label: {
            fontSize: typography.fontSize.sm,
            fontWeight: '500',
            color: theme.text,
            lineHeight: 20,
        },
        required: {
            color: theme.error,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            borderRadius: 8,
            backgroundColor: theme.background,
            height: INPUT_HEIGHT,
            paddingHorizontal: 12,
        },
        inputContainerFocused: {
            // Focus styles removed to match default border design
        },
        inputContainerError: {
            borderColor: theme.error,
        },
        inputContainerDisabled: {
            backgroundColor: theme.backgroundSecondary,
            opacity: 0.6,
        },
        iconLeft: {
            marginRight: spacing.sm,
        },
        input: {
            flex: 1,
            fontSize: typography.fontSize.sm,
            fontWeight: '400',
            color: theme.text,
            letterSpacing: 0,
            paddingVertical: 0,
            height: '100%',
            ...Platform.select({
                android: {
                    textAlignVertical: 'center',
                    lineHeight: 22,
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
            color: theme.textTertiary,
        },
        iconRightButton: {
            marginLeft: spacing.sm,
            padding: spacing.xs,
        },
        errorText: {
            fontSize: typography.fontSize.xs,
            color: theme.error,
            marginTop: spacing.xs,
        },
        errorTextHidden: {
            color: 'transparent',
        },
        hintText: {
            color: theme.error,
        },
        suffixWrapper: {
            justifyContent: 'center',
            paddingLeft: spacing.sm,
            paddingRight: 0,
        },
        suffixText: {
            fontSize: 14,
            color: theme.textSecondary,
            fontWeight: '400',
        },
    });
