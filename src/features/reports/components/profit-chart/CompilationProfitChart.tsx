import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles';
import { Loading } from '@/shared/components/ui/Loading';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { Chart } from '@/features/reports/components/profit-chart/Chart';
import { MetricsRow } from '@/features/reports/components/profit-chart/MetricsRow';
import { useProfitStats } from '@/features/reports/hooks/useProfitStats';
import {
    CHART_WIDTH,
    CHART_HEIGHT,
    PADDING_LEFT,
    PADDING_RIGHT,
    PADDING_TOP,
    PADDING_BOTTOM,
} from '@/features/reports/components/profit-chart/chartData';
import chartStyles from '@/features/reports/styles/chart.styles';
import ProfitChartIcon from '@/assets/Icon/IconReport/ProfitChartIcon.svg';

interface CompilationProfitChartProps {
    zoneId: string;
    pondId?: string;
}

const formatCurrency = (value: number) => {
    if (value >= 1e9) {
        return `${(value / 1e9).toFixed(2)} tỉ`;
    }
    if (value >= 1e6) {
        return `${(value / 1e6).toFixed(2)} tr`;
    }
    return `${value.toLocaleString()} đ`;
};

const LEGEND_ITEMS = [
    { label: 'Đã thu hoạch', color: '#B7EB8F' },
    { label: 'Chi phí', color: '#FFD9CC' },
    { label: 'Chưa thu hoạch', color: '#D9F7BE' },
    { label: 'Lợi nhuận ước tính', color: '#002A66' },
];

export const CompilationProfitChart: React.FC<CompilationProfitChartProps> = ({
    zoneId,
    pondId,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data: response, isLoading: queryLoading } = useProfitStats({
        ZoneId: zoneId,
        Id: pondId,
    });
    const isLoading = isExpanded && queryLoading;

    const statsData = response?.data;

    const chartWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const chartHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    return (
        <View style={chartStyles.container}>
            {/* Collapsible Chart Section */}
            <BasicDropDownButton
                prefixIcon={<ProfitChartIcon width={16} height={16} />}
                label="BIỂU ĐỒ LỢI NHUẬN"
                isExpanded={isExpanded}
                onPress={() => setIsExpanded(!isExpanded)}
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
                            <MetricsRow
                                revenue={formatCurrency(statsData?.kpis?.totalActualRevenue ?? 0)}
                                estimatedRevenue={formatCurrency(
                                    statsData?.kpis?.totalEstimatedRevenue ?? 0
                                )}
                                totalCost={formatCurrency(statsData?.kpis?.totalMaterialCost ?? 0)}
                                estimatedProfit={formatCurrency(
                                    statsData?.kpis?.totalEstimatedProfit ?? 0
                                )}
                            />
                            <Text style={styles.chartTitle}>Lợi nhuận(Tỉ đồng)</Text>
                            {statsData?.byDate && statsData.byDate.length > 0 ? (
                                <Chart
                                    chartWidth={chartWidth}
                                    chartHeight={chartHeight}
                                    data={statsData.byDate}
                                />
                            ) : null}
                            {/* Legend (2x2 grid) */}
                            <View style={styles.legendContainer}>
                                {LEGEND_ITEMS.map(item => (
                                    <View key={item.label} style={styles.legendItem}>
                                        <View
                                            style={[
                                                styles.legendDash,
                                                { backgroundColor: item.color },
                                            ]}
                                        />
                                        <Text style={styles.legendText}>{item.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
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
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 12,
        color: colors.text,
        paddingLeft: 16,
        paddingVertical: 8,
        backgroundColor: colors.white,
        lineHeight: 18,
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
        backgroundColor: colors.white,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: 8,
    },
    legendDash: {
        width: 16,
        height: 3,
        borderRadius: 1.5,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});
