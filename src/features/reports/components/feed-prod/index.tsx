import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';
import { CollapseHead } from '@/features/farm/components/CollapseHead';
import { MetricsRow } from '@/features/reports/components/feed-prod/MetricsRow';
import { Legend, getFeedProdLegendItems } from '@/features/reports/components/Legend';
import { Chart } from '@/features/reports/components/feed-prod/Chart';
import {
    CHART_WIDTH,
    CHART_HEIGHT,
    PADDING_LEFT,
    PADDING_RIGHT,
    PADDING_TOP,
    PADDING_BOTTOM,
    RAW_DATA,
} from '@/features/reports/components/feed-prod/chartData';

export const FeedProdChart = () => {
    const [isExpanded, setIsExpanded] = useState(true);

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
        <View style={styles.container}>
            {/* Collapsible Chart Section */}
            <View style={styles.chartSection}>
                <CollapseHead
                    title="BIỂU ĐỒ THỨC ĂN - SẢN LƯỢNG"
                    isExpanded={isExpanded}
                    onToggle={() => setIsExpanded(!isExpanded)}
                    style={isExpanded ? styles.headerExpanded : styles.headerCollapsed}
                />

                {isExpanded && (
                    <>
                        <MetricsRow
                            production={formatMetricValue(getLatestProduction())}
                            consumed={formatMetricValue(getLatestConsumed())}
                            fcr={formatFCR(getLatestFCR())}
                        />
                        <Chart chartWidth={chartWidth} chartHeight={chartHeight} />
                        <Legend items={getFeedProdLegendItems()} />
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
        // Box shadow: 0px 2px 4px 0px #00000005
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02, // 05 in hex = 5/255 ≈ 0.02
        shadowRadius: 4,
        elevation: 2, // For Android
        overflow: 'hidden',
    },
});
