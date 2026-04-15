import { useAppTheme } from '@/styles/themeContext';
import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
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
        <View style={styles.wrapper}>
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

            {/* Masks to visualy clip the scroll horizontally at the exact 16px padding edge, while leaving overflow: visible vertically for the tooltips */}
            <View
                style={[styles.maskLeft, { backgroundColor: theme.background }]}
                pointerEvents="none"
            />
            <View
                style={[styles.maskRight, { backgroundColor: theme.background }]}
                pointerEvents="none"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        zIndex: 10,
    },
    container: {
        flexGrow: 0,
        overflow: 'visible',
    },
    scrollContent: {
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    maskLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: spacing.md,
        zIndex: 20,
    },
    maskRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: spacing.md,
        zIndex: 20,
    },
});
