import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterChipsProps {
    options: FilterOption[];
    activeValue: string;
    onValueChange: (value: string) => void;
    scrollable?: boolean;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
    options,
    activeValue,
    onValueChange,
    scrollable = false,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const content = (
        <View style={styles.container}>
            {options.map(option => {
                const isActive = activeValue === option.value;
                return (
                    <TouchableOpacity
                        key={option.value}
                        style={[styles.button, isActive && styles.buttonActive]}
                        onPress={() => onValueChange(option.value)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.text, isActive && styles.textActive]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    if (scrollable) {
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {content}
            </ScrollView>
        );
    }

    return content;
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        scrollContent: {
            paddingRight: spacing.md,
        },
        container: {
            flexDirection: 'row',
            gap: spacing.sm,
            flexWrap: 'wrap',
        },
        button: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            backgroundColor: theme.background,
        },
        buttonActive: {
            backgroundColor: theme.text,
            borderColor: theme.text,
        },
        text: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.textSecondary,
        },
        textActive: {
            color: theme.background,
        },
    });
