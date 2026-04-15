import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';

export interface HarvestSummaryCardItem {
    label: string;
    value: string | number;
    unit: string;
    isError?: boolean;
}

export interface HarvestSummaryCardsProps {
    cards: HarvestSummaryCardItem[];
    containerStyle?: ViewStyle;
}

export const HarvestSummaryCards: React.FC<HarvestSummaryCardsProps> = ({
    cards,
    containerStyle,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const renderCard = (card: HarvestSummaryCardItem, index: number) => (
        <View key={index} style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{card.label}</Text>
            <View style={styles.summaryValueContainer}>
                <Text style={[styles.summaryValue, card.isError && styles.errorText]}>
                    {card.value}
                </Text>
                <Text style={[styles.summaryUnit, card.isError && styles.errorText]}>
                    {' '}
                    {card.unit}
                </Text>
            </View>
        </View>
    );

    return <View style={[styles.summaryRow, containerStyle]}>{cards.map(renderCard)}</View>;
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        summaryRow: {
            flexDirection: 'row',
            gap: spacing.sm,
        },
        summaryCard: {
            flex: 1,
            backgroundColor: theme.background,
            borderRadius: 12,
            padding: spacing.sm,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        summaryLabel: {
            fontSize: 12,
            color: theme.textSecondary,
            marginBottom: spacing.xs,
            fontWeight: '400',
        },
        summaryValueContainer: {
            flexDirection: 'row',
            alignItems: 'baseline',
        },
        summaryValue: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.text,
        },
        summaryUnit: {
            fontSize: 14,
            color: theme.textSecondary,
        },
        errorText: {
            color: theme.error,
        },
    });
