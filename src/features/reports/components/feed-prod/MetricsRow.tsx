import { useAppTheme } from '@/styles/themeContext';
import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { spacing } from '@/styles';
import { PondIndexCard } from '@/features/reports/components/env-chart/PondIndexCard';

interface MetricsRowProps {
    production?: string;
    consumed?: string;
    fcr?: string;
    forecast?: string;
    cardVariant?: 'default' | 'prodSummary';
    activeFilters?: Record<string, boolean>;
    onToggleFilter?: (id: string) => void;
    tooltipProduction?: string;
    tooltipConsumed?: string;
}

const METRIC_ITEMS = (
    production: string,
    consumed: string,
    fcr: string,
    forecast: string,
    theme: any
): { id: string; name: string; value: string; color: string; unit?: string }[] => [
    {
        id: 'production',
        name: 'Sản lượng',
        value: production,
        color: theme.isDark ? '#fb923c' : '#f97316',
    },
    { id: 'consumed', name: 'Đã ăn', value: consumed, color: '#22c55e' },
    { id: 'forecast', name: 'Dự báo', value: forecast, color: '#F59E0B', unit: 'tấn' },
    { id: 'fcr', name: 'FCR', value: fcr, color: theme.isDark ? theme.border : '#E6E8EC' },
];

export const MetricsRow: React.FC<MetricsRowProps> = ({
    production = '28.38 tấn',
    consumed = '39.91 tấn',
    fcr = '1.37',
    forecast = '3.37',
    cardVariant = 'default',
    activeFilters,
    onToggleFilter,
    tooltipProduction,
    tooltipConsumed,
}) => {
    const theme = useAppTheme();
    const items = METRIC_ITEMS(production, consumed, fcr, forecast, theme);

    const getTooltipValue = (id: string): string | undefined => {
        if (id === 'production') return tooltipProduction;
        if (id === 'consumed') return tooltipConsumed;
        return undefined;
    };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            {items.map(item => (
                <PondIndexCard
                    key={item.id}
                    item={item}
                    variant={cardVariant}
                    onPress={onToggleFilter ? () => onToggleFilter(item.id) : undefined}
                    isActive={activeFilters ? activeFilters[item.id] !== false : true}
                    tooltipValue={getTooltipValue(item.id)}
                />
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 0,
        overflow: 'visible',
        zIndex: 10,
    },
    scrollContent: {
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
});
