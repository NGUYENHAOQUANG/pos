import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import { SurveyOption } from '../types/survey.types';
import CheckboxActiveIcon from '@/assets/Icon/CheckboxActive.svg';
import CheckboxIcon from '@/assets/Icon/Checkbox.svg';
import { Checkbox } from '@/shared/components/forms/Checkbox';

export interface SurveyOptionListProps {
    options: SurveyOption[];
    value?: string | number | string[];
    onSelect: (value: string | number | string[]) => void;
    isMultiSelect?: boolean;
    maxSelections?: number;
}

export const SurveyOptionList: React.FC<SurveyOptionListProps> = ({
    options,
    value,
    onSelect,
    isMultiSelect,
    maxSelections,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const handleSelect = (optionValue: string | number) => {
        if (!isMultiSelect) {
            onSelect(optionValue);
            return;
        }

        const currentValue = Array.isArray(value) ? value : [];
        const isCurrentlySelected = currentValue.includes(optionValue as string);

        if (isCurrentlySelected) {
            onSelect(currentValue.filter(v => v !== optionValue));
        } else {
            if (maxSelections && currentValue.length >= maxSelections) {
                return; // Reached max
            }
            onSelect([...currentValue, optionValue as string]);
        }
    };

    return (
        <View style={styles.container}>
            {options.map((option, index) => {
                const isSelected = isMultiSelect
                    ? Array.isArray(value) && value.includes(option.value as string)
                    : value === option.value;

                const isDisabled = Boolean(
                    isMultiSelect &&
                        maxSelections &&
                        !isSelected &&
                        Array.isArray(value) &&
                        value.length >= maxSelections
                );

                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.optionCard,
                            isSelected && styles.optionCardSelected,
                            isDisabled && { opacity: 0.5 },
                        ]}
                        onPress={() => handleSelect(option.value)}
                        activeOpacity={0.8}
                        disabled={isDisabled}
                    >
                        <Text
                            style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}
                        >
                            {option.label}
                        </Text>

                        {!isMultiSelect ? (
                            isSelected ? (
                                <CheckboxActiveIcon
                                    width={24}
                                    height={24}
                                    color={theme.primaryOrange}
                                />
                            ) : (
                                <CheckboxIcon width={24} height={24} color={theme.defaultBorder} />
                            )
                        ) : (
                            <View pointerEvents="none">
                                <Checkbox
                                    checked={isSelected as boolean}
                                    activeColor={theme.primaryOrange}
                                    size="lg"
                                />
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: spacing.lg,
            gap: 4,
        },
        optionCard: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 16,
            paddingHorizontal: spacing.md,
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 12,
        },
        optionCardSelected: {
            borderColor: theme.primaryOrange,
            backgroundColor: theme.isDark
                ? 'rgba(253, 105, 0, 0.15)'
                : theme.orange[50] || theme.backgroundPrimary,
        },
        optionLabel: {
            fontSize: 16,
            fontWeight: '400',
            color: theme.text,
        },
        optionLabelSelected: {
            fontWeight: '500',
            color: theme.text,
        },
    });
