import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { MetricsRow } from '@/features/reports/components/feed-prod/MetricsRow';
import { Chart } from '@/features/reports/components/feed-prod/Chart';
import { FeedProdInfoCard } from '@/features/reports/components/feed-prod/FeedProdInfoCard';
import {
    CHART_WIDTH,
    CHART_HEIGHT,
    PADDING_RIGHT,
    PADDING_TOP,
    PADDING_BOTTOM,
} from '@/features/reports/components/feed-prod/feedprodData';

import { Loading } from '@/shared/components/ui/Loading';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { useChartStyles } from '@/features/reports/styles/chart.styles';
import FeedChart from '@/assets/Icon/IconReport/FeedChart.svg';
import { useFeedingProduction } from '@/features/reports/hooks/useFeedingProduction';

import { CompilationFeedProdProps } from '@/features/reports/types/feeding-production';

export const CompilationFeedProd = ({ zoneId, pondId, seasonId }: CompilationFeedProdProps) => {
    const chartStyles = useChartStyles();
    const [isExpanded, setIsExpanded] = useState(false);
    const theme = useAppTheme();

    const { data: response, isLoading: queryLoading } = useFeedingProduction({
        ZoneId: zoneId,
        PondIds: pondId ? [pondId] : undefined,
        SeasonId: seasonId,
    });

    const isLoading = isExpanded && queryLoading;

    // Filter state: null = show all, string = show only that series
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

    const handleToggleFilter = useCallback((id: string) => {
        setSelectedFilter(prev => (prev === id ? null : id));
    }, []);

    // Build activeFilters for cards (all active when nothing selected, only selected when picked)
    const activeFilters = useMemo(() => {
        if (!selectedFilter)
            return { production: false, consumed: false, forecast: false, fcr: false };
        return {
            production: selectedFilter === 'production',
            consumed: selectedFilter === 'consumed',
            forecast: selectedFilter === 'forecast',
            fcr: selectedFilter === 'fcr',
        };
    }, [selectedFilter]);

    // Build hiddenSeries for chart
    const hiddenSeries = useMemo(() => {
        if (!selectedFilter) return new Set<string>(); // nothing hidden = show all
        const allSeries = ['production', 'consumed', 'forecast'];
        const set = new Set<string>();
        allSeries.forEach(s => {
            if (s !== selectedFilter) set.add(s);
        });
        return set;
    }, [selectedFilter]);

    const chartWidth = CHART_WIDTH - PADDING_RIGHT;
    const chartHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    // Use API Data
    const summaryData = response?.data?.summary;
    const chartDataList = response?.data?.chartData || [];

    // Calculate metrics from response summary
    const getLatestProduction = (): number => (summaryData?.totalBiomass || 0) / 1000;
    const getLatestConsumed = (): number => (summaryData?.totalFood || 0) / 1000;
    const getLatestFCR = (): number => summaryData?.fcr || 0;

    const formatMetricValue = (value: number): string => {
        return `${value.toFixed(2).replace('.', ',')} tấn`;
    };

    const formatFCR = (fcr: number): string => {
        return fcr.toFixed(2).replace('.', ',');
    };

    return (
        <View style={chartStyles.container}>
            {/* Collapsible Chart Section */}
            <BasicDropDownButton
                prefixIcon={<FeedChart width={20} height={20} />}
                label="Biểu đồ thức ăn - sản lượng"
                isExpanded={isExpanded}
                onPress={() => setIsExpanded(!isExpanded)}
                style={isExpanded ? styles.headerExpanded : styles.headerCollapsed}
            />

            {isExpanded && (
                <View
                    style={[
                        styles.content,
                        { backgroundColor: theme.background },
                        isLoading && styles.loadingContainer,
                    ]}
                >
                    {isLoading ? (
                        <Loading />
                    ) : chartDataList.length === 0 ? (
                        <EmptyStateCard message="Không có dữ liệu sản lượng" />
                    ) : (
                        <>
                            <MetricsRow
                                production={formatMetricValue(getLatestProduction())}
                                consumed={formatMetricValue(getLatestConsumed())}
                                fcr={formatFCR(getLatestFCR())}
                                cardVariant="prodSummary"
                                activeFilters={activeFilters}
                                onToggleFilter={handleToggleFilter}
                                tooltipProduction={`${(
                                    summaryData?.totalBiomass ?? 0
                                ).toLocaleString('vi-VN')} kg`}
                                tooltipConsumed={`${(summaryData?.totalFood ?? 0).toLocaleString(
                                    'vi-VN'
                                )} kg`}
                            />
                            <Chart
                                chartWidth={chartWidth}
                                chartHeight={chartHeight}
                                data={chartDataList}
                                hiddenSeries={hiddenSeries}
                            />
                            <FeedProdInfoCard />
                        </>
                    )}
                </View>
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
    content: {
        borderBottomLeftRadius: borderRadius.sm,
        borderBottomRightRadius: borderRadius.sm,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
