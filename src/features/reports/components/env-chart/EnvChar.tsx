import React, { useState, useMemo } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import * as shape from 'd3-shape';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { TooltipEnvChart } from './TooltipEnvChart';
import { EnvChartSeries, EnvChartMetadata } from '@/features/reports/types/env-measurement-chart';

// --- Utils: Robust Manual Scales ---
const scaleLinear = ({ domain, range }: { domain: number[]; range: number[] }) => {
    const [d0, d1] = domain;
    const [r0, r1] = range;

    return (x: number) => {
        if (d1 === d0) return r0;
        return r0 + ((x - d0) / (d1 - d0)) * (r1 - r0);
    };
};

const scaleTime = ({ domain, range }: { domain: Date[]; range: number[] }) => {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    const t0 = d0.getTime();
    const t1 = d1.getTime();

    return (x: Date) => {
        if (t1 === t0) return r0;
        return r0 + ((x.getTime() - t0) / (t1 - t0)) * (r1 - r0);
    };
};

// --- Formatters ---
// Use UTC to match backend convention (dates stored at 17:00 UTC = 00:00 VN next day)
const formatDate = (date: Date) => {
    const d = date.getUTCDate().toString().padStart(2, '0');
    const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}`;
};

// --- Types ---
interface DataPoint {
    date: Date;
    value: number;
    pond: string;
}

interface SeriesEntry {
    pond: string;
    data: DataPoint[];
}

interface EnvCharProps {
    /** Series data from API, mapped to chart format */
    series: EnvChartSeries[];
    /** Metadata from API (minY, maxY, xAxis) */
    metadata: EnvChartMetadata;
    /** Unit string for tooltip display */
    unit?: string;
    /** Map of pondId → color */
    pondColors: Record<string, string>;
    /** Whether to show dots for series with only 1 data point (default: true) */
    showSinglePointDots?: boolean;
}

const GRAPH_HEIGHT = 380;

// Helper for Static Label
const AnimatedLabel = ({ date, baseX }: { date: Date; baseX: number }) => {
    return (
        <View style={{ position: 'absolute', left: baseX, bottom: 0 }}>
            <View style={{ width: 60, marginLeft: -30 }}>
                <Text style={styles.axisLabelCenter}>{formatDate(date)}</Text>
            </View>
        </View>
    );
};

export default function EnvChar({
    series,
    metadata,
    unit = '',
    pondColors,
    showSinglePointDots = true,
}: EnvCharProps) {
    // --- Data Preparation ---
    // Convert API series to chart format
    const seriesData: SeriesEntry[] = useMemo(() => {
        return series.map(s => ({
            pond: s.pondId,
            data: s.data
                .map(point => ({
                    date: new Date(point.date),
                    value: point.value,
                    pond: s.pondId,
                }))
                .sort((a, b) => a.date.getTime() - b.date.getTime()),
        }));
    }, [series]);

    // Flatten for scales
    const allPoints = seriesData.reduce<DataPoint[]>((acc, s) => acc.concat(s.data), []);

    const [layout, setLayout] = useState({ width: 0, height: 0 });

    // Shared Values for Gestures
    const translateX = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);

    // Derived dimensions
    const CHART_LEFT_PADDING = 60;
    const CHART_RIGHT_PADDING = 30; // half label width to prevent clipping at edge
    const MIN_DATE_SPACING = 15; // px per day interval
    const chartAreaWidth = Math.max(0, layout.width);

    // X-axis dates from metadata only
    const xAxisDates = useMemo(() => {
        return metadata.xAxis.map(d => new Date(d));
    }, [metadata.xAxis]);

    // Use xAxis length for total points
    const pointsCount = xAxisDates.length;
    const contentWidth =
        (pointsCount - 1) * MIN_DATE_SPACING + CHART_LEFT_PADDING + CHART_RIGHT_PADDING;

    // Spacing between consecutive date points on the x-axis (must match scaleX range)
    const pointSpacing =
        pointsCount > 1
            ? (contentWidth - CHART_LEFT_PADDING - CHART_RIGHT_PADDING) / (pointsCount - 1)
            : chartAreaWidth;

    const maxTranslateX = 0;
    const minTranslateX = Math.min(0, chartAreaWidth - contentWidth);

    // Selected Point for Tooltip (Date index)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Gestures
    const pan = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-10, 10])
        .onChange(e => {
            const nextTranslate = savedTranslateX.value + e.translationX;
            if (nextTranslate > maxTranslateX) {
                translateX.value = maxTranslateX;
            } else if (nextTranslate < minTranslateX) {
                translateX.value = minTranslateX;
            } else {
                translateX.value = nextTranslate;
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
        });

    const tap = Gesture.Tap().onEnd(e => {
        const internalX = e.x - translateX.value;
        // Map tap x to nearest date index using actual point spacing
        const index = Math.round((internalX - CHART_LEFT_PADDING) / pointSpacing);

        if (index >= 0 && index < pointsCount) {
            runOnJS(setSelectedIndex)(index);
            runOnJS(setTooltipPos)({ x: e.x, y: e.y });
        } else {
            runOnJS(setSelectedIndex)(null);
        }
    });

    const composed = Gesture.Race(pan, tap);
    const handleCloseTooltip = () => setSelectedIndex(null);

    const scrollStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const height = layout.height || GRAPH_HEIGHT;

    // Scales
    const minDate = xAxisDates[0] || new Date();
    const maxDate = xAxisDates[xAxisDates.length - 1] || new Date();

    const scaleX = scaleTime({
        domain: [minDate, maxDate],
        range: [CHART_LEFT_PADDING, contentWidth - CHART_RIGHT_PADDING],
    });

    // Custom Y-Axis Logic - Always show exactly 6 ticks
    const TICK_COUNT = 6;
    const vals = allPoints.map(d => d.value);
    let yDomain = [0, 10];
    let yTicks: number[] = [0, 2, 4, 6, 8, 10];

    if (vals.length > 0) {
        // Y-axis always starts from 0
        const minVal = 0;
        let maxVal = Math.max(...vals);

        // Handle edge case: all values are 0
        if (maxVal === 0) {
            maxVal = 10;
        }

        // Calculate a nice step that produces exactly 6 ticks (5 intervals)
        const rawRange = maxVal - minVal;
        const rawStep = rawRange / (TICK_COUNT - 1);

        // Round step up to a "nice" number (finer steps to avoid overshooting)
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const normalized = rawStep / magnitude;
        let niceStep: number;
        if (normalized <= 1) niceStep = 1 * magnitude;
        else if (normalized <= 1.5) niceStep = 1.5 * magnitude;
        else if (normalized <= 2) niceStep = 2 * magnitude;
        else if (normalized <= 2.5) niceStep = 2.5 * magnitude;
        else if (normalized <= 5) niceStep = 5 * magnitude;
        else niceStep = 10 * magnitude;

        // Round start down and generate exactly 6 ticks
        const start = Math.floor(minVal / niceStep) * niceStep;

        yTicks = [];
        for (let i = 0; i < TICK_COUNT; i++) {
            const v = start + i * niceStep;
            yTicks.push(Math.round(v * 100) / 100);
        }

        yDomain = [yTicks[0], yTicks[yTicks.length - 1]];
    }

    const scaleY = scaleLinear({
        domain: yDomain,
        range: [height - 30, 10],
    });

    const RenderLineSeries = ({
        data,
        color,
        strokeWidth = 1,
    }: {
        data: DataPoint[];
        color: string;
        strokeWidth?: number;
    }) => {
        const lineGen = shape
            .line<DataPoint>()
            .x(d => scaleX(d.date))
            .y(d => scaleY(d.value))
            .curve(shape.curveLinear);

        const path = lineGen(data);

        return (
            <Path
                d={path || ''}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.8}
            />
        );
    };

    const onLayout = (event: LayoutChangeEvent) => {
        setLayout(event.nativeEvent.layout);
    };

    // X-axis tick labels (use xAxisDates from metadata)
    const xTicks = xAxisDates;

    // Tooltip Logic — find values at the closest xAxis date for each series
    const tooltipData = useMemo(() => {
        if (selectedIndex === null || selectedIndex >= xAxisDates.length) return [];
        const targetDate = xAxisDates[selectedIndex];
        const targetTime = targetDate.getTime();

        return series
            .map(s => {
                // Find the data point closest to this xAxis date (within 24h tolerance)
                const matched = s.data.find(dp => {
                    const dpTime = new Date(dp.date).getTime();
                    return Math.abs(dpTime - targetTime) < 24 * 60 * 60 * 1000;
                });
                if (matched === undefined) return null;
                return {
                    pond: s.pondName,
                    value: matched.value,
                    color: pondColors[s.pondId] || '#999',
                    unit,
                };
            })
            .filter((d): d is NonNullable<typeof d> => d !== null);
    }, [selectedIndex, xAxisDates, series, pondColors, unit]);

    const selectedDate =
        selectedIndex !== null && selectedIndex < xTicks.length ? xTicks[selectedIndex] : null;

    return (
        <GestureHandlerRootView style={styles.container} onLayout={onLayout}>
            {/* Y Axis Labels (Absolute overlay) */}
            <View style={styles.yAxisOverlay} pointerEvents="none">
                {yTicks.map((val, i) => (
                    <Text
                        key={i}
                        style={[styles.axisLabel, { position: 'absolute', top: scaleY(val) - 10 }]}
                    >
                        {Number.isInteger(val) ? val : val.toFixed(1)}
                    </Text>
                ))}
            </View>

            <View style={styles.chartArea}>
                <GestureDetector gesture={composed}>
                    <View style={{ flex: 1 }}>
                        <Animated.View style={[styles.chartContent, scrollStyle]}>
                            <View>
                                <Svg width={contentWidth} height={height}>
                                    {/* Horizontal Grid Lines */}
                                    {yTicks.map((v, i) => (
                                        <Line
                                            key={`h-${i}`}
                                            x1={0}
                                            y1={scaleY(v)}
                                            x2={contentWidth}
                                            y2={scaleY(v)}
                                            stroke={colors.borderDark}
                                            strokeWidth={0.5}
                                        />
                                    ))}

                                    {/* Data Lines */}
                                    {seriesData.map(s => (
                                        <RenderLineSeries
                                            key={s.pond}
                                            data={s.data}
                                            color={pondColors[s.pond] || '#999'}
                                            strokeWidth={2}
                                        />
                                    ))}

                                    {/* Single-point dots for series with only 1 value */}
                                    {showSinglePointDots &&
                                        seriesData
                                            .filter(s => s.data.length === 1)
                                            .map(s => (
                                                <Circle
                                                    key={`dot-${s.pond}`}
                                                    cx={scaleX(s.data[0].date)}
                                                    cy={scaleY(s.data[0].value)}
                                                    r={4}
                                                    fill={pondColors[s.pond] || '#f97316'}
                                                />
                                            ))}
                                </Svg>
                            </View>

                            {/* Text Label Container */}
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 10,
                                    height: '100%',
                                }}
                                pointerEvents="none"
                            >
                                {xTicks.map((d, i) => {
                                    //show label every 7 days + always show last
                                    const isLast = i === xTicks.length - 1;
                                    const isSeventhDay = i % 7 === 0;

                                    if (!isSeventhDay && !isLast) return null;

                                    // Skip last label if too close to previous 7-day label
                                    if (isLast && !isSeventhDay) {
                                        const prevLabelIndex =
                                            Math.floor((xTicks.length - 1) / 7) * 7;
                                        if (i - prevLabelIndex < 4) return null;
                                    }

                                    return (
                                        <AnimatedLabel key={`l-${i}`} date={d} baseX={scaleX(d)} />
                                    );
                                })}
                            </View>
                        </Animated.View>
                    </View>
                </GestureDetector>
            </View>

            {/* Tooltip rendered outside chartArea to avoid overflow:hidden clipping */}
            <TooltipEnvChart
                visible={selectedIndex !== null && !!selectedDate}
                date={selectedDate || new Date()}
                data={tooltipData}
                position={tooltipPos}
                onClose={handleCloseTooltip}
                chartWidth={layout.width}
                chartHeight={layout.height || GRAPH_HEIGHT}
            />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 400,
        flexDirection: 'row',
        backgroundColor: colors.white,
    },
    yAxisOverlay: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: 30,
        height: '100%',
        zIndex: 10,
        backgroundColor: colors.white,
    },
    chartArea: {
        flex: 1,
        overflow: 'hidden',
    },
    chartContent: {
        //
    },
    axisLabel: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'left',
        width: '100%',
        paddingLeft: 0,
    },
    axisLabelCenter: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        width: '100%',
    },
});
