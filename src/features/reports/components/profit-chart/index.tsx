import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';
import { CollapseHead } from '@/features/farm/components/CollapseHead';
import { Chart } from '@/features/reports/components/profit-chart/Chart';
import { Legend, getProfitChartLegendItems } from '@/features/reports/components/Legend';
import { MetricsRow } from '@/features/reports/components/profit-chart/MetricsRow';
import {
    CHART_WIDTH,
    CHART_HEIGHT,
    PADDING_LEFT,
    PADDING_RIGHT,
    PADDING_TOP,
    PADDING_BOTTOM,
    ProfitChartDataRange,
} from '@/features/reports/components/profit-chart/chartData';

interface ProfitChartProps {
    /**
     * Optional data range for filtering chart data
     * This parameter is reserved for future feature development
     */
    dataRange?: ProfitChartDataRange;
}

export const ProfitChart: React.FC<ProfitChartProps> = ({}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const chartWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const chartHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    return (
        <View style={styles.container}>
            {/* Collapsible Chart Section */}
            <View style={styles.chartSection}>
                <CollapseHead
                    title="BIỂU ĐỒ LỢI NHUẬN"
                    isExpanded={isExpanded}
                    onToggle={() => setIsExpanded(!isExpanded)}
                    style={isExpanded ? styles.headerExpanded : styles.headerCollapsed}
                />

                {isExpanded && (
                    <>
                        <MetricsRow />
                        <Chart chartWidth={chartWidth} chartHeight={chartHeight} />
                        <Legend items={getProfitChartLegendItems()} />
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    headerExpanded: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        backgroundColor: colors.white,
    },
    headerCollapsed: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        paddingVertical: 16,
    },
    chartSection: {
        backgroundColor: colors.white,
        marginTop: spacing.sm,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
});
