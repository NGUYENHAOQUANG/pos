import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Svg, { Line, Text as SvgText, Rect, G } from 'react-native-svg';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { Loading } from '@/shared/components/ui/Loading';
import { CollapseHead } from '@/features/farm/components/CollapseHead';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_HEIGHT = 400;
const PADDING_LEFT = 80;
const PADDING_RIGHT = 16;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 40;
const CHART_WIDTH = SCREEN_WIDTH - 32;
const DRAW_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const DRAW_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

// Mock Data
// Visual estimation from image: varying step sizes.
// Total 34,783.9 -> scale max 36,000.
// Dates: 06/09, 17/09, 29/09, 10/10, 21/10 (roughly 11-12 days interval)
const DATA_POINTS = [
    { date: '06/09/2022', value: 2000 },
    { date: '08/09/2022', value: 2200 },
    { date: '10/09/2022', value: 2400 },
    { date: '12/09/2022', value: 2600 },
    { date: '15/09/2022', value: 2900 },
    { date: '17/09/2022', value: 3100 },
    { date: '20/09/2022', value: 3500 },
    { date: '23/09/2022', value: 3900 },
    { date: '26/09/2022', value: 4200 },
    { date: '29/09/2022', value: 4500 }, // Gap?
    { date: '02/10/2022', value: 5500 },
    { date: '05/10/2022', value: 7500 },
    { date: '08/10/2022', value: 9000 }, // Jump
    { date: '10/10/2022', value: 12000 },
    { date: '11/10/2022', value: 14000 },
    { date: '12/10/2022', value: 16000 },
    { date: '13/10/2022', value: 18000 },
    { date: '14/10/2022', value: 20000 },
    { date: '15/10/2022', value: 22000 },
    { date: '16/10/2022', value: 23000 },
    { date: '17/10/2022', value: 25000 },
    { date: '18/10/2022', value: 26500 },
    { date: '19/10/2022', value: 28000 },
    { date: '20/10/2022', value: 30000 },
    { date: '21/10/2022', value: 31500 },
    { date: '22/10/2022', value: 33000 },
    { date: '23/10/2022', value: 34783.9 },
];
const scaleLinear = (value: number, domain: [number, number], range: [number, number]) => {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
};

const WaterUsageChart = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);
    const Y_MAX = 36000;
    const Y_TICKS = [0, 9000, 18000, 27000, 36000];
    const barWidth = DRAW_WIDTH / DATA_POINTS.length;
    return (
        <View style={styles.container}>
            <CollapseHead
                title="LƯỢNG NƯỚC SỬ DỤNG THEO NGÀY"
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
                style={styles.header}
                titleStyle={styles.headerTitle}
            />

            {isExpanded && (
                <View style={styles.content}>
                    {isLoading ? (
                        <View style={{ height: 300 }}>
                            <Loading />
                        </View>
                    ) : (
                        <>
                            {/* Summary Stats */}
                            <View style={styles.statsContainer}>
                                <Text style={styles.statLabel}>Tổng lượng nước cấp</Text>
                                <Text style={styles.statValue}>34,783.9 m³</Text>
                            </View>

                            {/* Chart Svg */}
                            <View style={styles.chartWrapper}>
                                <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                                    {/* Y Axis Grid & Labels */}
                                    {Y_TICKS.map(tick => {
                                        const y = scaleLinear(
                                            tick,
                                            [0, Y_MAX],
                                            [DRAW_HEIGHT + PADDING_TOP, PADDING_TOP]
                                        );
                                        return (
                                            <G key={`y-${tick}`}>
                                                {/* Grid Line */}
                                                <Line
                                                    x1={PADDING_LEFT}
                                                    y1={y}
                                                    x2={CHART_WIDTH - PADDING_RIGHT}
                                                    y2={y}
                                                    stroke={colors.borderLight}
                                                    strokeWidth={1}
                                                />
                                                {/* Label */}
                                                <SvgText
                                                    x={PADDING_LEFT - 8}
                                                    y={y + 4} // Optical center
                                                    fontSize={14}
                                                    fill={colors.text}
                                                    textAnchor="end"
                                                >
                                                    {tick === 0
                                                        ? '0'
                                                        : tick
                                                              .toLocaleString('vi-VN')
                                                              .replace(',', '.')}
                                                    {/* Custom format to match image 36.000 (dot separator) */}
                                                </SvgText>
                                            </G>
                                        );
                                    })}

                                    {/* Y Axis Title (Rotated) */}
                                    <SvgText
                                        x={15}
                                        y={CHART_HEIGHT / 2}
                                        fontSize={14}
                                        fill={colors.black}
                                        textAnchor="middle"
                                        transform={`rotate(-90, 15, ${CHART_HEIGHT / 2})`}
                                        fontWeight="400"
                                    >
                                        Lượng nước m3
                                    </SvgText>

                                    {/* Bars */}
                                    {DATA_POINTS.map((point, index) => {
                                        const prevValue =
                                            index === 0 ? 0 : DATA_POINTS[index - 1].value;
                                        const yTop = scaleLinear(
                                            point.value,
                                            [0, Y_MAX],
                                            [DRAW_HEIGHT + PADDING_TOP, PADDING_TOP]
                                        );
                                        const yBottom = scaleLinear(
                                            prevValue,
                                            [0, Y_MAX],
                                            [DRAW_HEIGHT + PADDING_TOP, PADDING_TOP]
                                        );
                                        let h = Math.abs(yBottom - yTop);
                                        if (h < 2 && point.value > prevValue) h = 2;
                                        const x = PADDING_LEFT + index * barWidth;
                                        return (
                                            <G key={`bar-${index}`}>
                                                <Rect
                                                    x={x + 1} // Padding
                                                    y={yTop}
                                                    width={barWidth - 2}
                                                    height={h}
                                                    fill={colors.orange[600]}
                                                />
                                            </G>
                                        );
                                    })}

                                    {/* X Axis Labels */}
                                    {/* Manually placed to match image exactly or evenly distributed */}
                                    {[
                                        '06/09/2022',
                                        '17/09/2022',
                                        '29/09/2022',
                                        '10/10/2022',
                                        '21/10/2022',
                                    ].map((date, i) => {
                                        // Distribute them evenly across drawing area
                                        const x = PADDING_LEFT + i * (DRAW_WIDTH / 4); // 5 items -> 4 intervals
                                        return (
                                            <G key={`x-label-${i}`}>
                                                {/* Small tick */}
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
                                                    fontSize={10}
                                                    fill={colors.black}
                                                    textAnchor="middle"
                                                >
                                                    {date}
                                                </SvgText>
                                            </G>
                                        );
                                    })}
                                </Svg>
                            </View>
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        marginTop: 12,
    },
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
    },
    statsContainer: {
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        marginHorizontal: 16,
        marginBottom: 4,
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
    chartWrapper: {
        alignItems: 'center',
        // paddingLeft: 10,
    },
});

export default WaterUsageChart;
