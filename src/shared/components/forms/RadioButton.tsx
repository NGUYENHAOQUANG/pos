import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import CheckboxIcon from '@/assets/Icon/Checkbox.svg';
import CheckboxActiveIcon from '@/assets/Icon/CheckboxActive.svg';

export interface RadioOption<T = string | number | boolean> {
    label: string;
    description?: string;
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
    /** Custom description styles */
    descriptionStyle?: TextStyle;
    /** Gap between radio items */
    gap?: number;
    /** Layout direction of the radio buttons */
    direction?: 'row' | 'column';
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
    descriptionStyle,
    gap = spacing.lg,
    direction = 'row',
}: RadioButtonProps<T>) {
    const handlePress = (optionValue: T) => {
        if (disabled) return;
        if (optionValue === value) return; // Already selected
        onValueChange?.(optionValue);
    };

    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View
            style={[
                styles.container,
                direction === 'column' && styles.containerColumn,
                containerStyle,
            ]}
        >
            {options.map((option, index) => {
                const isSelected = value === option.value;
                const isDisabled = disabled || option.disabled;

                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.radioItem,
                            {
                                marginRight:
                                    direction === 'row' && index < options.length - 1 ? gap : 0,
                                marginBottom:
                                    direction === 'column' && index < options.length - 1 ? gap : 0,
                            },
                            itemStyle,
                        ]}
                        onPress={() => handlePress(option.value)}
                        activeOpacity={0.8}
                        disabled={isDisabled}
                    >
                        <View
                            style={[styles.radioIconWrap, isDisabled && styles.radioOuterDisabled]}
                        >
                            {isSelected ? (
                                <CheckboxActiveIcon
                                    width={24}
                                    height={24}
                                    color={theme.primaryOrange}
                                />
                            ) : (
                                <CheckboxIcon width={24} height={24} color={theme.defaultBorder} />
                            )}
                        </View>
                        <View style={direction === 'column' ? styles.textContainer : undefined}>
                            <Text
                                style={[
                                    styles.radioLabel,
                                    isDisabled && styles.radioLabelDisabled,
                                    labelStyle,
                                ]}
                            >
                                {option.label}
                            </Text>
                            {option.description && (
                                <Text
                                    style={[
                                        styles.radioDesc,
                                        isDisabled && styles.radioLabelDisabled,
                                        descriptionStyle,
                                    ]}
                                >
                                    {option.description}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.sm,
        },
        containerColumn: {
            flexDirection: 'column',
            alignItems: 'stretch',
        },
        radioItem: {
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        radioIconWrap: {
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.sm,
            marginTop: 1, // Align with first line of text
        },
        radioOuterDisabled: {
            opacity: 0.5,
        },
        radioLabel: {
            fontSize: 16,
            color: theme.text,
            fontWeight: '400',
            lineHeight: 22,
        },
        radioLabelDisabled: {
            color: theme.textSecondary,
            opacity: 0.5,
        },
        textContainer: {
            flex: 1,
            justifyContent: 'center',
        },
        radioDesc: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.textSecondary,
            marginTop: 2,
        },
    });
