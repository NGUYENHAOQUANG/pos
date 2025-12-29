import React from 'react';
import { View, Text, StyleSheet, TextInput, TextInputProps } from 'react-native';
import { colors, spacing } from '@/styles';

interface FarmInputProps extends TextInputProps {
    /** Label text displayed above the input */
    label?: string;
    /** Whether to show required indicator (*) */
    required?: boolean;
    /** Height of the input (default: 40) */
    height?: number;
    /** Whether to show label */
    showLabel?: boolean;
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
    placeholder = 'Input',
    placeholderTextColor = colors.borderSubtle,
    keyboardType = 'numeric',
    style,
    ...textInputProps
}) => {
    return (
        <View style={styles.container}>
            {showLabel && label && (
                <Text style={styles.label}>
                    {required && <Text style={styles.required}>* </Text>}
                    {label}
                </Text>
            )}
            <TextInput
                style={[
                    styles.textInput,
                    {
                        height,
                    },
                    style,
                ]}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor}
                keyboardType={keyboardType}
                textAlignVertical="center"
                {...textInputProps}
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
    textInput: {
        paddingHorizontal: spacing.md,
        paddingVertical: 0,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        fontSize: 16,
        color: colors.text,
        lineHeight: 24,
        letterSpacing: 0,
    },
});
