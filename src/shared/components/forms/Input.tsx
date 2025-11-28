/**
 * @file Input.tsx
 * @description Reusable Input component following Ant Design principles with system colors
 * @author Kindy
 * @created 2025-01-XX
 * @updated 2025-01-XX - Redesigned with full Ant Design styling and password toggle
 *
 * @see https://rn.mobile.ant.design/components/input-item
 */
import { borderRadius, colors, sizes, spacing, typography } from '@/styles';
import React, { useState } from 'react';
import {
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
  label: string;
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
  inputStyle?: ViewStyle;
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
    if (isFocused) return colors.primary;
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
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
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
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    minHeight: sizes.input.md,
    paddingHorizontal: spacing.md,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
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
    fontSize: typography.fontSize.base,
    color: colors.text,
    paddingVertical: 0,
    minHeight: sizes.input.md - 2,
    fontFamily: typography.fontFamily.regular,
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
