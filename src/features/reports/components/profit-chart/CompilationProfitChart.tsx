import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Loading } from '@/shared/components/ui/Loading';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
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
import { useChartStyles } from '@/features/reports/styles/chart.styles';
import { useAppTheme } from '@/styles/themeContext';
import ProfitChartIcon from '@/assets/Icon/IconReport/ProfitChartIcon.svg';

interface CompilationProfitChartProps {
    zoneId: string;
    pondId?: string;
}

const truncateToDecimals = (value: number, decimals: number) => {
    const multiplier = Math.pow(10, decimals);
    return Math.trunc(value * multiplier) / multiplier;
};

const formatCurrency = (value: number) => {
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    if (abs >= 1e9) {
        const truncated = truncateToDecimals(abs / 1e9, 2);
        return `${sign}${truncated.toFixed(2).replace('.', ',')} tỉ`;
    }
    if (abs >= 1e6) {
        const truncated = truncateToDecimals(abs / 1e6, 2);
        return `${sign}${truncated.toFixed(2).replace('.', ',')} tr`;
    }
    return `${sign}${abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ`;
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
    const chartStyles = useChartStyles();
    const theme = useAppTheme();
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
                prefixIcon={<ProfitChartIcon width={20} height={20} />}
                label="Biểu đồ lợi nhuận"
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
                    ) : !statsData?.byDate || statsData.byDate.length === 0 ? (
                        <EmptyStateCard message="Không có dữ liệu lợi nhuận" />
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
                                rawRevenue={statsData?.kpis?.totalActualRevenue}
                                rawEstimatedRevenue={statsData?.kpis?.totalEstimatedRevenue}
                                rawTotalCost={statsData?.kpis?.totalMaterialCost}
                                rawEstimatedProfit={statsData?.kpis?.totalEstimatedProfit}
                            />
                            <Text style={styles.chartTitle}>Lợi nhuận (Tỉ đồng)</Text>
                            <Chart
                                chartWidth={chartWidth}
                                chartHeight={chartHeight}
                                data={statsData.byDate}
                            />
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
                                        <Text
                                            style={[
                                                styles.legendText,
                                                { color: theme.textSecondary },
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
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
    },
    headerCollapsed: {
        paddingHorizontal: 16,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 12,
        paddingLeft: 16,
        paddingVertical: 8,
        lineHeight: 18,
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
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
    },
});
