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
    activeFilters?: Record<string, boolean>;
    onToggleFilter?: (id: string) => void;
}

const METRIC_ITEMS = (
    production: string,
    consumed: string,
    fcr: string,
    forecast: string
): { id: string; name: string; value: string; color: string; unit?: string }[] => [
    { id: 'production', name: 'Sản lượng', value: production, color: '#f97316' },
    { id: 'consumed', name: 'Đã ăn', value: consumed, color: '#22c55e' },
    { id: 'forecast', name: 'Dự báo', value: forecast, color: '#F59E0B', unit: 'tấn' },
    { id: 'fcr', name: 'FCR', value: fcr, color: '#E6E8EC' },
];

export const MetricsRow: React.FC<MetricsRowProps> = ({
    production = '28.38 tấn',
    consumed = '39.91 tấn',
    fcr = '1.37',
    forecast = '3.37',
    cardVariant = 'default',
    activeFilters,
    onToggleFilter,
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
                <PondIndexCard
                    key={item.id}
                    item={item}
                    variant={cardVariant}
                    onPress={onToggleFilter ? () => onToggleFilter(item.id) : undefined}
                    isActive={activeFilters ? activeFilters[item.id] !== false : true}
                />
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
