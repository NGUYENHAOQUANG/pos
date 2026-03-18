import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { borderRadius, colors } from '@/styles';
import { typography } from '@/styles/typography';
import { BasicDropDownButton } from '../BasicDropDownButton';
import CostChart from './CostChart';
import { CostItem } from './costChartData';

import { Loading } from '@/shared/components/ui/Loading';
import chartStyles from '@/features/reports/styles/chart.styles';
import CostChartIcon from '@/assets/Icon/IconReport/CostChartIcon.svg';
import { PondIndexCard } from '../env-chart/PondIndexCard';
import { useCostDonut } from '../../hooks/useCostDonut';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';

// Color palette for chart slices
const SLICE_COLORS = [
    colors.red[600],
    colors.success,
    colors.green[800],
    colors.orange[600],
    colors.orange[200],
    colors.blue[700],
    colors.blue[400],
    colors.blue[50],
    '#7B2CBF',
    '#CA8A04',
];

/**
 * Format a large number into Vietnamese display: "X tỉ", "X triệu", etc.
 */
const formatCurrency = (value: number, unit: string): string => {
    if (!unit) return value.toLocaleString('vi-VN');
    return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ${unit}`;
};

const formatWeight = (value: number, unit: string): string => {
    return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ${unit}`;
};

interface CompilationCostChartProps {
    zoneId: string;
    pondId?: string;
}

const CompilationCostChart = ({ zoneId, pondId }: CompilationCostChartProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        data: response,
        isLoading,
        isRefetching,
    } = useCostDonut({
        ZoneId: zoneId,
        PondIds: pondId ? [pondId] : undefined,
        enabled: isExpanded,
    });

    const apiData = response?.data;
    const summary = apiData?.summary;
    const chartData = apiData?.chartData;

    // Map API data to CostItem[]
    const costItems: CostItem[] = useMemo(() => {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map((item, index) => ({
            label: item.categoryName,
            percentage: item.percentage,
            value: item.amount,
            color: SLICE_COLORS[index % SLICE_COLORS.length],
        }));
    }, [chartData]);

    // Format total display
    const totalDisplay = useMemo(() => {
        if (!summary) return '0';
        return formatCurrency(summary.totalCost, summary.currencyUnit);
    }, [summary]);

    const showLoading = isLoading || isRefetching;
    const isEmpty = !showLoading && costItems.length === 0;

    return (
        <View style={chartStyles.container}>
            <BasicDropDownButton
                prefixIcon={<CostChartIcon width={16} height={16} />}
                label="BIỂU ĐỒ CHI PHÍ"
                isExpanded={isExpanded}
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.header}
            />

            {isExpanded && (
                <View style={[styles.content, showLoading ? styles.loadingContainer : undefined]}>
                    {showLoading ? (
                        <Loading />
                    ) : isEmpty ? (
                        <EmptyStateCard message="Không có dữ liệu chi phí" />
                    ) : (
                        <>
                            {/* Stats Header */}
                            <View style={styles.statsContainer}>
                                <PondIndexCard
                                    variant="prodSummary"
                                    item={{
                                        id: '1',
                                        name: 'Thức ăn',
                                        value: formatWeight(
                                            summary?.totalFoodUsage ?? 0,
                                            summary?.weightUnit?.toLowerCase() ?? 'tấn'
                                        ),
                                        color: '',
                                    }}
                                />
                                <PondIndexCard
                                    variant="prodSummary"
                                    item={{
                                        id: '2',
                                        name: 'Chi phí',
                                        value: totalDisplay,
                                        color: '',
                                    }}
                                />
                                <PondIndexCard
                                    variant="prodSummary"
                                    item={{
                                        id: '3',
                                        name: 'FCR',
                                        value: (summary?.fcr ?? 0).toLocaleString('vi-VN', {
                                            maximumFractionDigits: 2,
                                        }),
                                        color: '',
                                    }}
                                />
                            </View>

                            {/* Chart */}
                            <View style={styles.chartContainer}>
                                <CostChart
                                    size={300}
                                    data={costItems}
                                    totalDisplay={totalDisplay}
                                />
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    headerTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        textTransform: 'uppercase',
    },
    content: {
        backgroundColor: colors.white,
        paddingBottom: 16,
        borderBottomLeftRadius: borderRadius.sm,
        borderBottomRightRadius: borderRadius.sm,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 16,
        gap: 8,
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    excludeContainer: {
        paddingHorizontal: 8,
        borderBottomLeftRadius: borderRadius.sm,
        borderBottomRightRadius: borderRadius.sm,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginBottom: 8,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CompilationCostChart;
