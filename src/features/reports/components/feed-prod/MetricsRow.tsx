import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '@/styles';
import { PondIndexCard } from '@/features/reports/components/env-chart/PondIndexCard';

interface MetricsRowProps {
    production?: string;
    consumed?: string;
    fcr?: string;
    forecast?: string;
    cardVariant?: 'default' | 'prodSummary';
}

const METRIC_ITEMS = (
    production: string,
    consumed: string,
    fcr: string,
    forecast: string
): { id: string; name: string; value: string; color: string; unit?: string }[] => [
    { id: 'production', name: 'Sản lượng', value: production, color: '#22c55e' },
    { id: 'consumed', name: 'Đã ăn', value: consumed, color: '#f97316' },
    { id: 'forecast', name: 'Dự báo', value: forecast, color: colors.gray[500], unit: 'tấn' },
    { id: 'fcr', name: 'FCR', value: fcr, color: colors.gray[500] },
];

export const MetricsRow: React.FC<MetricsRowProps> = ({
    production = '28.38 tấn',
    consumed = '39.91 tấn',
    fcr = '1.37',
    forecast = '3.37',
    cardVariant = 'default',
}) => {
    const items = METRIC_ITEMS(production, consumed, fcr, forecast);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.container}
        >
            {items.map(item => (
                <PondIndexCard key={item.id} item={item} variant={cardVariant} />
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 0,
        backgroundColor: colors.white,
    },
    scrollContent: {
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
});
