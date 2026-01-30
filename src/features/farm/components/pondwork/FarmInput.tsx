import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '@/styles';
import { Input, InputProps } from '@/shared/components/forms/Input';

interface FarmInputProps extends Omit<InputProps, 'inputContainerStyle' | 'containerStyle'> {
    /** Label text displayed above the input */
    label?: string;
    /** Whether to show required indicator (*) */
    required?: boolean;
    /** Height of the input (default: 40) */
    height?: number;
    /** Whether to show label */
    showLabel?: boolean;
    /** Custom style for the input container */
    style?: ViewStyle;
}

/**
 * FarmInput - A reusable input component for the farm module
 *
 * @example
 * // Basic usage with label
 * <FarmInput
 *   label="pH (1-14)"
 *   value={pH}
 *   onChangeText={setPH}
 *   keyboardType="numeric"
 * />
 *
 * @example
 * // With required indicator
 * <FarmInput
 *   label="Số tôm hao (kg)"
 *   value={lossAmount}
 *   onChangeText={setLossAmount}
 *   required
 *   keyboardType="numeric"
 * />
 *
 * @example
 * // Without label (just the input)
 * <FarmInput
 *   value={value}
 *   onChangeText={setValue}
 *   showLabel={false}
 *   placeholder="Input"
 * />
 */
export const FarmInput: React.FC<FarmInputProps> = ({
    label,
    required = false,
    height = 40,
    showLabel = true,
    placeholder = 'Nhập',
    placeholderTextColor = colors.borderSubtle,
    keyboardType = 'numeric',
    style,
    ...inputProps
}) => {
    return (
        <View style={styles.container}>
            <Input
                label={showLabel ? label : undefined}
                required={required}
                inputContainerStyle={{
                    ...styles.textInput,
                    height,
                    ...(style as object),
                }}
                containerStyle={styles.inputWrapper}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor}
                keyboardType={keyboardType}
                {...inputProps}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: spacing.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
    },
    required: {
        color: colors.error,
    },
    inputWrapper: {
        marginBottom: 0,
    },
    textInput: {
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
    },
});
