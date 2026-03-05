import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';
import { PondIndexCard } from '@/features/reports/components/env-chart/PondIndexCard';

interface MetricsRowProps {
    revenue?: string;
    estimatedRevenue?: string;
    totalCost?: string;
    estimatedProfit?: string;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({
    revenue = '5.45 tỉ',
    estimatedRevenue = '5.45 tỉ',
    totalCost = '3.53 tỉ',
    estimatedProfit = '1.92 tỉ',
}) => {
    const items = [
        {
            id: 'revenue',
            name: 'Doanh thu',
            value: revenue,
            color: colors.green[600],
        },
        {
            id: 'estimatedRevenue',
            name: 'Tổng doanh thu ước tính',
            value: estimatedRevenue,
            color: colors.blue[600],
        },
        {
            id: 'totalCost',
            name: 'Tổng chi phí',
            value: totalCost,
            color: colors.volcano[900],
        },
        {
            id: 'estimatedProfit',
            name: 'Tổng lợi nhuận ước tính',
            value: estimatedProfit,
            color: colors.green[600],
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.metricsTopRow}>
                {items.slice(0, 2).map(item => (
                    <View key={item.id} style={styles.metricItem}>
                        <PondIndexCard item={item} variant="prodSummary" />
                    </View>
                ))}
            </View>
            <View style={styles.metricsBottomRow}>
                {items.slice(2, 4).map(item => (
                    <View key={item.id} style={styles.metricItem}>
                        <PondIndexCard item={item} variant="prodSummary" />
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: spacing.md,
        backgroundColor: colors.white,
    },
    metricsTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    metricsBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricItem: {
        flex: 1,
        alignItems: 'stretch',
        paddingHorizontal: spacing.xs,
    },
});
