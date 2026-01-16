import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing } from '@/styles';

export interface RadioOption<T = string | number | boolean> {
    label: string;
    value: T;
    disabled?: boolean;
}

export interface RadioButtonProps<T = string | number | boolean> {
    /** Array of radio options */
    options: RadioOption<T>[];
    /** Currently selected value */
    value?: T;
    /** Callback when an option is selected */
    onValueChange?: (value: T) => void;
    /** Disable all radio buttons */
    disabled?: boolean;
    /** Custom container styles */
    containerStyle?: ViewStyle;
    /** Custom radio item styles */
    itemStyle?: ViewStyle;
    /** Custom label styles */
    labelStyle?: TextStyle;
    /** Gap between radio items */
    gap?: number;
}

/**
 * RadioButton component with Ant Design styling
 * Supports multiple options with single selection
 */
export function RadioButton<T = string | number | boolean>({
    options,
    value,
    onValueChange,
    disabled = false,
    containerStyle,
    itemStyle,
    labelStyle,
    gap = spacing.lg,
}: RadioButtonProps<T>) {
    const handlePress = (optionValue: T) => {
        if (disabled) return;
        if (optionValue === value) return; // Already selected
        onValueChange?.(optionValue);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {options.map((option, index) => {
                const isSelected = value === option.value;
                const isDisabled = disabled || option.disabled;

                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.radioItem,
                            { marginRight: index < options.length - 1 ? gap : 0 },
                            itemStyle,
                        ]}
                        onPress={() => handlePress(option.value)}
                        activeOpacity={0.8}
                        disabled={isDisabled}
                    >
                        <View
                            style={[
                                styles.radioOuter,
                                isSelected && styles.radioOuterSelected,
                                isDisabled && styles.radioOuterDisabled,
                            ]}
                        >
                            {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <Text
                            style={[
                                styles.radioLabel,
                                isDisabled && styles.radioLabelDisabled,
                                labelStyle,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.xs,
    },
    radioOuterSelected: {
        borderColor: colors.primary,
    },
    radioOuterDisabled: {
        borderColor: colors.borderLight,
        opacity: 0.5,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    radioLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
        lineHeight: 22,
    },
    radioLabelDisabled: {
        color: colors.textSecondary,
        opacity: 0.5,
    },
});
