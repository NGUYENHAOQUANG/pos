import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, colors, spacing } from '@/styles';

/**
 * Interface for a single legend item
 */
export interface LegendItem {
    label: string;
    color: string;
}

interface LegendProps {
    items: LegendItem[];
}

/**
 * Reusable Legend component for charts
 */
export const Legend: React.FC<LegendProps> = ({ items }) => {
    return (
        <View style={styles.container}>
            {items.map((item, index) => (
                <LegendItemComponent key={index} label={item.label} color={item.color} />
            ))}
        </View>
    );
};

/**
 * Legend items for Feed-Prod chart
 */
export const getFeedProdLegendItems = (): LegendItem[] => [
    { label: 'Đã ăn', color: colors.orange[600] }, // Orange line
    { label: 'Sản lượng', color: '#003EB3' }, // Blue line
    { label: 'Dự báo', color: colors.gray[200] },
];

/**
 * Legend items for Profit chart
 */
export const getProfitChartLegendItems = (): LegendItem[] => [
    { label: 'Đã thu hoạch', color: colors.green[300] },
    { label: 'Chưa thu hoạch', color: colors.green[100] },
    { label: 'Chi phí', color: colors.orange[200] },
    { label: 'Lợi nhuận ước tính', color: colors.blue[700] },
];

/**
 * Individual legend item component
 */
interface LegendItemComponentProps {
    label: string;
    color: string;
}

const LegendItemComponent: React.FC<LegendItemComponentProps> = ({ label, color }) => {
    return (
        <View style={styles.legendItem}>
            <View style={[styles.legendSquare, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        borderBottomLeftRadius: borderRadius.sm,
        borderBottomRightRadius: borderRadius.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendSquare: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 20,
    },
});
