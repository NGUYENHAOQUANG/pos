import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Svg, { Line, Text as SvgText, Rect, G } from 'react-native-svg';

import { colors } from '@/styles/colors';
import { Loading } from '@/shared/components/ui/Loading';
import { BasicDropDownButton } from '../BasicDropDownButton';
import chartStyles from '@/features/reports/styles/chart.styles';
import DropIcon from '@/assets/Icon/IconReport/Drop.svg';
import { useWaterUsageStats } from '../../hooks/useWaterUsageStats';
import { scaleLinear, formatNumberVietnamese, parseWaterUsageData } from './waterUsageHelpers';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_HEIGHT = 400;
const PADDING_LEFT = 80;
const PADDING_RIGHT = 20;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 40;
const CHART_WIDTH = SCREEN_WIDTH;
const DRAW_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const DRAW_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

interface WaterUsageChartProps {
    zoneId?: string;
}

const WaterUsageChart: React.FC<WaterUsageChartProps> = ({ zoneId }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Fetch API data only when expanded and zoneId is available
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

    const { totalWaterSupplied, cumulativeData, yMax, yTicks, xLabels } = parsedData;
    const SCROLL_PAD = 36; // left padding inside scroll to avoid first label clipping
    const SCROLL_PAD_RIGHT = 36; // right padding to avoid last label clipping
    const scrollWidth = DRAW_WIDTH + SCROLL_PAD + SCROLL_PAD_RIGHT;
    const barWidth = cumulativeData.length > 0 ? DRAW_WIDTH / cumulativeData.length : DRAW_WIDTH;

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
                                    {formatNumberVietnamese(totalWaterSupplied, false)} m³
                                </Text>
                            </View>

                            <Text style={styles.yAxisTitle}>Lượng nước m3</Text>

                            {/* Chart: fixed Y-axis + scrollable content */}
                            <View style={styles.chartRow}>
                                {/* Fixed Y-axis labels */}
                                <Svg width={PADDING_LEFT} height={CHART_HEIGHT}>
                                    {yTicks.map(tick => {
                                        const y = scaleLinear(
                                            tick,
                                            [0, yMax],
                                            [DRAW_HEIGHT + PADDING_TOP, PADDING_TOP]
                                        );
                                        return (
                                            <SvgText
                                                key={`y-${tick}`}
                                                x={PADDING_LEFT - 8}
                                                y={y + 4}
                                                fontSize={14}
                                                fill={colors.text}
                                                textAnchor="end"
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

                                        {/* Bars */}
                                        {cumulativeData.map((point, index) => {
                                            const prevValue =
                                                index === 0 ? 0 : cumulativeData[index - 1].value;
                                            const yTop = scaleLinear(
                                                point.value,
                                                [0, yMax],
                                                [DRAW_HEIGHT + PADDING_TOP, PADDING_TOP]
                                            );
                                            const yBottom = scaleLinear(
                                                prevValue,
                                                [0, yMax],
                                                [DRAW_HEIGHT + PADDING_TOP, PADDING_TOP]
                                            );
                                            let h = Math.abs(yBottom - yTop);
                                            if (h < 2 && point.value > prevValue) h = 2;
                                            const x = SCROLL_PAD + index * barWidth;
                                            return (
                                                <Rect
                                                    key={`bar-${index}`}
                                                    x={x + 1}
                                                    y={yTop}
                                                    width={barWidth - 2 > 0 ? barWidth - 2 : 1}
                                                    height={h}
                                                    fill={colors.orange[600]}
                                                />
                                            );
                                        })}

                                        {/* X Axis Labels */}
                                        {xLabels.map((date, i) => {
                                            const x =
                                                SCROLL_PAD +
                                                i * (DRAW_WIDTH / Math.max(1, xLabels.length - 1));
                                            return (
                                                <G key={`x-label-${i}`}>
                                                    <Line
                                                        x1={x}
                                                        y1={DRAW_HEIGHT + PADDING_TOP}
                                                        x2={x}
                                                        y2={DRAW_HEIGHT + PADDING_TOP + 5}
                                                        stroke={colors.border}
                                                    />
                                                    <SvgText
                                                        x={x}
                                                        y={DRAW_HEIGHT + PADDING_TOP + 20}
                                                        fontSize={12}
                                                        fill={colors.black}
                                                        textAnchor="middle"
                                                    >
                                                        {date}
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
        fontSize: 20,
        fontWeight: '700',
        color: colors.black,
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
