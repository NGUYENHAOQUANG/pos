import React, { useState, useMemo } from 'react';
import { View, StyleSheet, LayoutChangeEvent, Text } from 'react-native';
import Svg, { Path, Line, Circle, G } from 'react-native-svg';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import * as shape from 'd3-shape';
import { colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import { ENV_DATA, EnvLog, POND_COLORS } from './envChartData';
import { TooltipEnvChart } from './TooltipEnvChart';

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
const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}`;
};

const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
};

// --- Types ---
interface DataPoint {
    date: Date;
    value: number;
    pond: string;
}

interface EnvCharProps {
    selected?: string;
}

// --- Mapping Configuration ---
const METRIC_MAP: Record<string, { key: keyof EnvLog; label: string; unit: string }> = {
    pH: { key: 'pH', label: 'pH', unit: '' },
    DO: { key: 'do', label: 'DO', unit: 'mg/L' },
    'Nhiệt độ': { key: 'temp', label: 'Nhiệt độ', unit: '°C' },
    'Độ kiềm': { key: 'alk', label: 'Độ kiềm', unit: 'mg/L' },
    'Độ trong': { key: 'clear', label: 'Độ trong', unit: 'cm' },
    'Độ mặn': { key: 'salt', label: 'Độ mặn', unit: 'ppt' },
};

const GRAPH_HEIGHT = 380;

// Helper for Animated Label (Now Static)
const AnimatedLabel = ({ date, baseX }: { date: Date; baseX: number }) => {
    return (
        <View style={{ position: 'absolute', left: baseX, bottom: 0 }}>
            <View style={{ width: 60, marginLeft: -30 }}>
                <Text style={styles.axisLabelCenter}>{formatDate(date)}</Text>
            </View>
        </View>
    );
};

export default function EnvChar({ selected = 'pH' }: EnvCharProps) {
    const metric = METRIC_MAP[selected] || METRIC_MAP['pH'];

    // --- Data Preparation ---
    // Group data by Pond
    const seriesData = useMemo(() => {
        const ponds = Array.from(new Set(ENV_DATA.map(d => d.pond)));
        return ponds.map(pond => {
            const data = ENV_DATA.filter(d => d.pond === pond)
                .map(item => ({
                    date: parseDate(item.date),
                    value: Number(item[metric.key]),
                    pond: item.pond,
                }))
                .sort((a, b) => a.date.getTime() - b.date.getTime());
            return { pond, data };
        });
    }, [metric.key]);

    // Flatten for scales using reduce instead of flatMap
    const allPoints = seriesData.reduce<DataPoint[]>((acc, s) => acc.concat(s.data), []);

    const [layout, setLayout] = useState({ width: 0, height: 0 });

    // Shared Values for Gestures
    const translateX = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);

    // Derived dimensions
    const density = 20; // Increased spacing for 3-day interval
    const axisWidth = 30;
    const chartAreaWidth = Math.max(0, layout.width - axisWidth * 2);

    const pointsCount = seriesData[0]?.data.length || 0;
    const contentWidth = Math.max(chartAreaWidth, pointsCount * density);

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
        const index = Math.round(internalX / density);

        if (index >= 0 && index < pointsCount) {
            runOnJS(setSelectedIndex)(index);
            // Position relative to the *visible* view, need to account for scroll if inside the container?
            // Actually e.x is relative to the GestureDetector which wraps the whole scrollable content?
            // Wait, the GestureDetector wraps Animated.View?
            // No, GestureDetector wraps the outer container. `chartArea`.
            // So e.x is absolute in the Viewport.
            // BUT `translateX` moves the content.
            // If we place the tooltip INSIDE the Animated.View, it will move with scroll. That's annoying.
            // Better to place tooltip OUTSIDE the Animated.View (floating).
            // If outside, we just need `e.x` and `e.y`.
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
    const minDate = allPoints[0]?.date || new Date();
    const maxDate = allPoints[allPoints.length - 1]?.date || new Date();

    const scaleX = scaleTime({
        domain: [minDate, maxDate],
        range: [20, contentWidth - 20],
    });

    // Custom Y-Axis Logic
    let yDomain = [0, 10];
    let yTicks: number[] = [0, 2, 4, 6, 8, 10];

    // Step Configuration
    const stepMap: Record<string, number> = {
        pH: 0.2,
        DO: 0.2,
        'Nhiệt độ': 2,
        'Độ kiềm': 10,
        'Độ trong': 2,
        'Độ mặn': 2,
    };

    const vals = allPoints.map(d => d.value);
    if (vals.length > 0) {
        let minValRaw = Math.min(...vals);
        let maxValRaw = Math.max(...vals);

        const step = stepMap[selected] || 1;

        // Round min down and max up to nearest step
        let start = Math.floor(minValRaw / step) * step;
        let end = Math.ceil(maxValRaw / step) * step;

        // Safety: if start == end (flat line), expand
        if (start === end) {
            start -= step;
            end += step;
        }

        yTicks = [];
        // Use epsilon to avoid floating point issues
        for (let v = start; v < end + step * 0.5; v += step) {
            yTicks.push(v);
        }

        yDomain = [yTicks[0], yTicks[yTicks.length - 1]];
    }

    const scaleY = scaleLinear({
        domain: yDomain,
        range: [height - 40, 10],
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

    const RenderDotSeries = ({ data, color }: { data: DataPoint[]; color: string }) => {
        return (
            <G>
                {data.map((d, i) => (
                    <Circle
                        key={i}
                        cx={scaleX(d.date)}
                        cy={scaleY(d.value)}
                        r={2.5}
                        fill={color}
                        stroke={colors.white}
                        strokeWidth={0.5}
                    />
                ))}
            </G>
        );
    };

    const onLayout = (event: LayoutChangeEvent) => {
        setLayout(event.nativeEvent.layout);
    };

    // Ticks (using first series dates)
    const xTicks = seriesData[0]?.data || [];

    // Tooltip Logic
    const tooltipData =
        selectedIndex !== null
            ? seriesData
                  .map(s => ({
                      pond: s.pond,
                      value: s.data[selectedIndex]?.value,
                      color: POND_COLORS[s.pond],
                      unit: metric.unit,
                  }))
                  .filter(d => d.value !== undefined)
            : [];

    const selectedDate = selectedIndex !== null ? xTicks[selectedIndex]?.date : null;

    return (
        <GestureHandlerRootView style={styles.container} onLayout={onLayout}>
            {/* Y Axis Labels (Fixed) */}
            <View style={styles.yAxisContainer} pointerEvents="none">
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
                                    {/* Vertical Grid Lines - Every 3 days */}
                                    {xTicks.map((d, i) => {
                                        if (i % 3 !== 0) return null;
                                        return (
                                            <Line
                                                key={`v-${i}`}
                                                x1={scaleX(d.date)}
                                                y1={0}
                                                x2={scaleX(d.date)}
                                                y2={height - 30}
                                                stroke={colors.borderDark}
                                                strokeWidth={0.5}
                                            />
                                        );
                                    })}
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
                                    {seriesData.map(series => (
                                        <RenderLineSeries
                                            key={series.pond}
                                            data={series.data}
                                            color={POND_COLORS[series.pond] || '#999'}
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Svg>
                            </View>

                            {/* Dots */}
                            <View
                                style={[
                                    StyleSheet.absoluteFill,
                                    { width: contentWidth, height: height },
                                ]}
                                pointerEvents="none"
                            >
                                <Svg width={contentWidth} height={height}>
                                    {seriesData.map(series => (
                                        <RenderDotSeries
                                            key={series.pond}
                                            data={series.data}
                                            color={POND_COLORS[series.pond] || '#999'}
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
                                    if (i % 3 !== 0) return null;
                                    return (
                                        <AnimatedLabel
                                            key={`l-${i}`}
                                            date={d.date}
                                            baseX={scaleX(d.date)}
                                        />
                                    );
                                })}
                            </View>
                        </Animated.View>

                        {/* Tooltip (Extracted) */}
                        <TooltipEnvChart
                            visible={selectedIndex !== null && !!selectedDate}
                            date={selectedDate || new Date()}
                            data={tooltipData}
                            position={tooltipPos}
                            onClose={handleCloseTooltip}
                            chartWidth={layout.width}
                        />
                    </View>
                </GestureDetector>
            </View>
            {/* Right Axis Mask */}
            <View style={styles.yAxisContainer} pointerEvents="none" />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 400,
        flexDirection: 'row',
        backgroundColor: colors.white,
    },
    yAxisContainer: {
        width: 30,
        height: '100%',
        zIndex: 10,
        backgroundColor: `${colors.white}E6`,
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
        fontSize: 14,
        color: colors.text,
        textAlign: 'right',
        width: '100%',
        paddingRight: 4,
    },
    axisLabelCenter: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 14,
        color: colors.text,
        textAlign: 'center',
        width: '100%',
    },
    // Tooltip Styles
    tooltipContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 100,
        minWidth: 120,
    },
    tooltipHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        paddingBottom: 4,
    },
    tooltipDate: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 12,
        color: colors.text,
    },
    tooltipClose: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textSecondary,
        marginTop: -4,
    },
    tooltipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    tooltipLabel: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 10,
        color: colors.text,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
});
