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
    RAW_DATA,
} from '@/features/reports/components/feed-prod/feedprodData';

import { Loading } from '@/shared/components/ui/Loading';
import chartStyles from '@/features/reports/styles/chart.styles';
import FeedChart from '@/assets/Icon/IconReport/FeedChart.svg';

export const CompilationFeedProd = () => {
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

    // Calculate metrics from RAW_DATA
    const getLatestProduction = (): number => {
        if (RAW_DATA.length === 0) return 0;
        return RAW_DATA[RAW_DATA.length - 1].production;
    };

    const getLatestConsumed = (): number => {
        if (RAW_DATA.length === 0) return 0;
        return RAW_DATA[RAW_DATA.length - 1].consumed;
    };

    const getLatestFCR = (): number => {
        if (RAW_DATA.length === 0) return 0;
        return RAW_DATA[RAW_DATA.length - 1].fcr;
    };

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
                label="BIỂU ĐỒ THỨC ĂN - SẢN LƯỢNG"
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
                            <Chart chartWidth={chartWidth} chartHeight={chartHeight} />
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
