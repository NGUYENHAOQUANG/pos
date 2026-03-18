import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Svg, { Line, Text as SvgText, Rect, G } from 'react-native-svg';

import { colors } from '@/styles/colors';
import { Loading } from '@/shared/components/ui/Loading';
import { BasicDropDownButton } from '../BasicDropDownButton';
import chartStyles from '@/features/reports/styles/chart.styles';
import DropIcon from '@/assets/Icon/IconReport/Drop.svg';
import { useWaterUsageStats } from '../../hooks/useWaterUsageStats';
import { scaleLinear, formatNumberVietnamese, parseWaterUsageData } from './waterUsageHelpers';
import { typography } from '@/styles/typography';

const CHART_HEIGHT = 400;
const PADDING_LEFT = 85;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 40;
const DRAW_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

interface WaterUsageChartProps {
    zoneId?: string;
}

const WaterUsageChart: React.FC<WaterUsageChartProps> = ({ zoneId }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        data: statsData,
        isLoading,
        isError,
    } = useWaterUsageStats({
        zoneId: zoneId || '',
        enabled: isExpanded,
    });

    const parsedData = useMemo(() => {
        return parseWaterUsageData(statsData);
    }, [statsData]);

    const { totalWaterSupplied, bars, yMax, yTicks } = parsedData;

    // Simple layout: fixed width per bar, evenly spaced
    const BAR_WIDTH = 32;
    const BAR_STEP = 80; // Distance between bar centers (ensures date labels don't overlap)
    const SCROLL_PAD = 16;
    const SCROLL_PAD_RIGHT = 36;

    const scrollWidth = SCROLL_PAD + bars.length * BAR_STEP + SCROLL_PAD_RIGHT;

    // Get center X of a bar
    const getBarCenterX = (index: number) => SCROLL_PAD + index * BAR_STEP + BAR_STEP / 2;

    return (
        <View style={chartStyles.container}>
            <BasicDropDownButton
                label="LƯỢNG NƯỚC SỬ DỤNG THEO NGÀY"
                isExpanded={isExpanded}
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.header}
                prefixIcon={<DropIcon width={16} height={16} />}
            />

            {isExpanded && (
                <View style={styles.content}>
                    {isLoading ? (
                        <View style={{ height: 300 }}>
                            <Loading />
                        </View>
                    ) : isError ? (
                        <View
                            style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Text>Có lỗi xảy ra khi tải dữ liệu lượng nước.</Text>
                        </View>
                    ) : (
                        <>
                            {/* Summary Stats */}
                            <View style={styles.statsContainer}>
                                <Text style={styles.statLabel}>Tổng lượng nước cấp</Text>
                                <Text style={styles.statValue}>
                                    {formatNumberVietnamese(totalWaterSupplied, false)}{' '}
                                    <Text style={styles.statUnit}>m³</Text>
                                </Text>
                            </View>

                            <Text style={styles.yAxisTitle}>Lượng nước m3</Text>

                            {/* Chart: fixed Y-axis + scrollable content */}
                            <View style={styles.chartRow}>
                                {/* Fixed Y-axis labels */}
                                <Svg
                                    width={PADDING_LEFT}
                                    height={CHART_HEIGHT}
                                    style={{ overflow: 'visible' }}
                                >
                                    {yTicks.map(tick => {
                                        const y = scaleLinear(
                                            tick,
                                            [0, yMax],
                                            [DRAW_HEIGHT + PADDING_TOP, PADDING_TOP]
                                        );
                                        return (
                                            <SvgText
                                                key={`y-${tick}`}
                                                x={16}
                                                y={y + 4}
                                                fontSize={12}
                                                fill={colors.text}
                                                textAnchor="start"
                                            >
                                                {tick === 0 ? '0' : formatNumberVietnamese(tick)}
                                            </SvgText>
                                        );
                                    })}
                                </Svg>

                                {/* Scrollable bars + grid + x-labels */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <Svg width={scrollWidth} height={CHART_HEIGHT}>
                                        {/* Grid lines */}
                                        {yTicks.map(tick => {
                                            const y = scaleLinear(
                                                tick,
                                                [0, yMax],
                                                [DRAW_HEIGHT + PADDING_TOP, PADDING_TOP]
                                            );
                                            return (
                                                <Line
                                                    key={`grid-${tick}`}
                                                    x1={SCROLL_PAD}
                                                    y1={y}
                                                    x2={scrollWidth}
                                                    y2={y}
                                                    stroke={colors.borderLight}
                                                    strokeWidth={1}
                                                />
                                            );
                                        })}

                                        {/* One bar per day */}
                                        {bars.map((bar, index) => {
                                            const cx = getBarCenterX(index);
                                            const yTop = scaleLinear(
                                                bar.value,
                                                [0, yMax],
                                                [DRAW_HEIGHT + PADDING_TOP, PADDING_TOP]
                                            );
                                            const yBottom = DRAW_HEIGHT + PADDING_TOP;
                                            let h = yBottom - yTop;
                                            if (h < 2 && bar.value > 0) h = 2;

                                            return (
                                                <Rect
                                                    key={`bar-${index}`}
                                                    x={cx - BAR_WIDTH / 2}
                                                    y={yTop}
                                                    width={BAR_WIDTH}
                                                    height={h}
                                                    fill={colors.orange[600]}
                                                    rx={2}
                                                    ry={2}
                                                />
                                            );
                                        })}

                                        {/* X Axis date labels */}
                                        {bars.map((bar, i) => {
                                            const cx = getBarCenterX(i);
                                            return (
                                                <G key={`x-label-${i}`}>
                                                    <Line
                                                        x1={cx}
                                                        y1={DRAW_HEIGHT + PADDING_TOP}
                                                        x2={cx}
                                                        y2={DRAW_HEIGHT + PADDING_TOP + 5}
                                                        stroke={colors.border}
                                                    />
                                                    <SvgText
                                                        x={cx}
                                                        y={DRAW_HEIGHT + PADDING_TOP + 20}
                                                        fontSize={12}
                                                        fill={colors.black}
                                                        textAnchor="middle"
                                                    >
                                                        {bar.dateLabel}
                                                    </SvgText>
                                                </G>
                                            );
                                        })}
                                    </Svg>
                                </ScrollView>
                            </View>
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
    content: {
        backgroundColor: colors.white,
        paddingBottom: 16,
    },
    statsContainer: {
        alignItems: 'flex-start',
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 12,
        backgroundColor: colors.white,
    },
    statLabel: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 14,
        fontWeight: typography.fontWeight.bold,
        color: colors.black,
        lineHeight: 20,
    },
    statUnit: {
        fontSize: 12,
        fontWeight: '400',
        color: colors.black,
        lineHeight: 18,
    },
    yAxisTitle: {
        fontSize: 16,
        color: colors.textSecondary,
        paddingLeft: 16,
        marginBottom: 12,
    },
    chartRow: {
        flexDirection: 'row',
        height: CHART_HEIGHT,
    },
});

export default WaterUsageChart;
