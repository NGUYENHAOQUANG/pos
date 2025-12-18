/**
 * @file CustomInput.tsx
 * @description Custom Input component based on Input.tsx,
 * with the label font weight changed from medium (in đậm) to regular (thường),
 * và dấu * nằm trước label.
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

export interface CustomInputProps extends Omit<TextInputProps, 'style'> {
  // ... (các props khác giữ nguyên)
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  icon?: string;
  iconRight?: string;
  onIconPress?: () => void;
  secureTextEntry?: boolean;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  placeholderTextColor?: string;
}

/**
 * Custom Input component: Hoàn toàn giống Input gốc nhưng label không in đậm
 * và dấu * nằm trước label.
 */
export function CustomInput({
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
  placeholderTextColor,
  ...restProps
}: CustomInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // ... (các hàm xử lý sự kiện và style giữ nguyên)

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
        {required && <Text style={styles.required}>* </Text>}
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
          inputStyle,
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
          ]}
          value={value}
          onChangeText={onChangeText}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor || colors.textTertiary}
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
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.white,
    minHeight: 39,
    maxHeight: 39,
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

export default CustomInput;