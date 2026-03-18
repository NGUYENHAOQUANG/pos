import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, borderRadius } from '@/styles';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { MetricsRow } from '@/features/reports/components/feed-prod/MetricsRow';
import { Chart } from '@/features/reports/components/feed-prod/Chart';
import { FeedProdInfoCard } from '@/features/reports/components/feed-prod/FeedProdInfoCard';
import {
    CHART_WIDTH,
    CHART_HEIGHT,
    PADDING_LEFT,
    PADDING_RIGHT,
    PADDING_TOP,
    PADDING_BOTTOM,
} from '@/features/reports/components/feed-prod/feedprodData';

import { Loading } from '@/shared/components/ui/Loading';
import chartStyles from '@/features/reports/styles/chart.styles';
import FeedChart from '@/assets/Icon/IconReport/FeedChart.svg';
import { useFeedingProduction } from '@/features/reports/hooks/useFeedingProduction';

interface Props {
    zoneId: string;
    pondId?: string;
}

export const CompilationFeedProd = ({ zoneId, pondId }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data: response, isLoading: queryLoading } = useFeedingProduction({
        ZoneId: zoneId,
        Id: pondId,
    });

    const isLoading = isExpanded && queryLoading;

    const chartWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const chartHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    // Use API Data
    const summaryData = response?.data?.summary;
    const chartDataList = response?.data?.chartData || [];

    // Calculate metrics from response summary
    const getLatestProduction = (): number => summaryData?.totalBiomass || 0;
    const getLatestConsumed = (): number => summaryData?.totalFood || 0;
    const getLatestFCR = (): number => summaryData?.fcr || 0;

    const formatMetricValue = (value: number): string => {
        return `${value.toFixed(2)} tấn`;
    };

    const formatFCR = (fcr: number): string => {
        return fcr.toFixed(2);
    };

    return (
        <View style={chartStyles.container}>
            {/* Collapsible Chart Section */}
            <BasicDropDownButton
                prefixIcon={<FeedChart width={18} height={18} />}
                label="Biểu đồ thức ăn - sản lượng"
                isExpanded={isExpanded}
                onPress={() => setIsExpanded(!isExpanded)}
                style={isExpanded ? styles.headerExpanded : styles.headerCollapsed}
            />

            {isExpanded && (
                <View style={[styles.content, isLoading && styles.loadingContainer]}>
                    {isLoading ? (
                        <Loading />
                    ) : (
                        <>
                            <MetricsRow
                                production={formatMetricValue(getLatestProduction())}
                                consumed={formatMetricValue(getLatestConsumed())}
                                fcr={formatFCR(getLatestFCR())}
                            />
                            {chartDataList.length > 0 ? (
                                <Chart
                                    chartWidth={chartWidth}
                                    chartHeight={chartHeight}
                                    data={chartDataList}
                                />
                            ) : null}
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        backgroundColor: colors.white,
    },
    headerCollapsed: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    content: {
        backgroundColor: colors.white,
        borderBottomLeftRadius: borderRadius.sm,
        borderBottomRightRadius: borderRadius.sm,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
