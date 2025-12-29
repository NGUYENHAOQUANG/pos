import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles';
import { Loading } from '@/shared/components/ui/Loading';
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

interface CompilationProfitChartProps {
    /**
     * Optional data range for filtering chart data
     * This parameter is reserved for future feature development
     */
    dataRange?: ProfitChartDataRange;
}

export const CompilationProfitChart: React.FC<CompilationProfitChartProps> = ({}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (isExpanded) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isExpanded]);

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
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <Loading />
                            </View>
                        ) : (
                            <>
                                <MetricsRow />
                                <Chart chartWidth={chartWidth} chartHeight={chartHeight} />
                                <Legend items={getProfitChartLegendItems()} />
                            </>
                        )}
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        marginBottom: 8,
    },
    headerExpanded: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        backgroundColor: colors.white,
    },
    headerCollapsed: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        backgroundColor: colors.white,
    },
    chartSection: {
        backgroundColor: colors.white,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
