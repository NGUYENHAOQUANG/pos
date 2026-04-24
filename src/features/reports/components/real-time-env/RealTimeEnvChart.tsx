import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    LayoutChangeEvent,
    ScrollView,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Canvas, Path, Circle, Line, Skia, vec } from '@shopify/react-native-skia';
import * as shape from 'd3-shape';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '@/styles/themeContext';
import { Loading } from '@/shared/components/ui/Loading';

/** Data point for the chart */
export interface ChartDataPoint {
    time: string; // HH:mm:ss
    value: number;
}

interface RealTimeEnvChartProps {
    /** Array of data points (oldest first) */
    data?: ChartDataPoint[];
    /** Y-axis zoom level (1x = full range, higher = zoomed around data) */
    zoomLevel?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    /** Default max value for Y-axis at 1x zoom (e.g. 50 for Temp, 14 for pH) */
    defaultYMax?: number;
}

const CHART_HEIGHT = 260;
const Y_AXIS_WIDTH = 32;
const INNER_LEFT_PAD = 20;
const BOTTOM_PAD = 50;

export const RealTimeEnvChart = ({
    data,
    zoomLevel = 1,
    defaultYMax = 50,
}: RealTimeEnvChartProps) => {
    const theme = useAppTheme();
    const [layout, setLayout] = useState({ width: 0, height: CHART_HEIGHT });

    // Use all data to allow historical scrolling, wrapped in useMemo for referential stability
    const chartData = useMemo(() => (data && data.length > 0 ? data : []), [data]);

    // Compute zoomed Y-axis range based on zoom level
    const { yMin, yMax, yTicks } = useMemo(() => {
        if (zoomLevel === 1 || chartData.length === 0) {
            // 1x: fixed range based on defaultYMax
            const step = defaultYMax / 5;
            const ticks: number[] = [];
            for (let i = 0; i <= 5; i++) {
                ticks.push(Math.round(i * step * 10) / 10);
            }
            return { yMin: 0, yMax: defaultYMax, yTicks: ticks };
        }

        // For 2x/3x/4x: zoom around actual data range
        const values = chartData.map(d => d.value);
        const dataMin = Math.min(...values);
        const dataMax = Math.max(...values);

        // Base range at 1x around data, then divide by zoom
        const fullRange = defaultYMax;
        const zoomedRange = fullRange / zoomLevel;
        const center = (dataMin + dataMax) / 2;
        const zMin = Math.max(0, center - zoomedRange / 2);
        const zMax = zMin + zoomedRange;

        // Generate ticks for zoomed range
        const step = zoomedRange / 5;
        const ticks: number[] = [];
        for (let i = 0; i <= 5; i++) {
            ticks.push(Math.round((zMin + i * step) * 10) / 10);
        }

        return { yMin: zMin, yMax: zMax, yTicks: ticks };
    }, [chartData, zoomLevel, defaultYMax]);

    const chartHeight = layout.height - BOTTOM_PAD;
    const viewWidth = layout.width;

    // Dynamically calculate spacing to show exactly 7 points with a 30% gap on the right
    const { pointSpacing, rightPad } = useMemo(() => {
        if (viewWidth === 0) return { pointSpacing: 35, rightPad: 30 };
        const calculatedRightPad = viewWidth * 0.3;
        const usableWidth = viewWidth - calculatedRightPad - Y_AXIS_WIDTH - INNER_LEFT_PAD;
        // 7 points = 6 intervals
        const calculatedSpacing = usableWidth > 0 ? usableWidth / 6 : 35;
        return { pointSpacing: calculatedSpacing, rightPad: calculatedRightPad };
    }, [viewWidth]);

    // Content width: dynamic spacing per data point
    const contentWidth = useMemo(() => {
        const dataWidth = Math.max(0, chartData.length - 1) * pointSpacing;
        const totalContent = Y_AXIS_WIDTH + INNER_LEFT_PAD + dataWidth + rightPad;
        return Math.max(totalContent, viewWidth);
    }, [chartData.length, viewWidth, pointSpacing, rightPad]);

    // Animate path extension when new data arrives
    const pathEnd = useSharedValue(1);
    const dotCx = useSharedValue(0);
    const dotCy = useSharedValue(0);
    const prevChartLength = useRef(0);

    useEffect(() => {
        const lastIdx = chartData.length - 1;
        const newCx = lastIdx >= 0 ? scaleX(lastIdx) : 0;
        const newCy = lastIdx >= 0 ? scaleY(chartData[lastIdx].value) : 0;

        if (
            chartData.length > prevChartLength.current &&
            prevChartLength.current >= 1 &&
            chartData.length >= 2
        ) {
            // New point added - animate the last segment drawing
            const segments = chartData.length - 1;
            pathEnd.value = (segments - 1) / segments;
            pathEnd.value = withTiming(1, { duration: 600 });
            // Dot rides the tip of the line from old position to new position
            dotCx.value = scaleX(lastIdx - 1);
            dotCy.value = scaleY(chartData[lastIdx - 1].value);
            dotCx.value = withTiming(newCx, { duration: 600 });
            dotCy.value = withTiming(newCy, { duration: 600 });
        } else {
            pathEnd.value = 1;
            dotCx.value = newCx;
            dotCy.value = newCy;
        }
        prevChartLength.current = chartData.length;
    }, [chartData, pathEnd, dotCx, dotCy, scaleX, scaleY]);

    // Native scroll logic - platform handles animation at full FPS
    const scrollRef = useRef<ScrollView>(null);
    const isAtEnd = useRef(true);
    const prevLength = useRef(data?.length || 0);

    const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        const atEnd = contentSize.width - layoutMeasurement.width - contentOffset.x < 80;
        isAtEnd.current = atEnd;
    }, []);

    const autoScrollToEnd = useCallback(() => {
        if (data && data.length > prevLength.current) {
            if (contentWidth > viewWidth && isAtEnd.current) {
                const maxScroll = contentWidth - viewWidth;
                scrollRef.current?.scrollTo({ x: maxScroll, animated: true });
            }
            prevLength.current = data.length;
        }
    }, [data, contentWidth, viewWidth]);

    useEffect(() => {
        autoScrollToEnd();
    }, [autoScrollToEnd]);

    // Scale X: dynamic spacing per data point
    const scaleX = React.useCallback(
        (index: number) => {
            return Y_AXIS_WIDTH + INNER_LEFT_PAD + index * pointSpacing;
        },
        [pointSpacing]
    );

    // Scale Y: maps value to pixel position within zoomed range
    const scaleY = React.useCallback(
        (value: number) => {
            const range = yMax - yMin;
            if (range === 0) return chartHeight;
            const norm = (value - yMin) / range;
            return chartHeight - norm * chartHeight;
        },
        [yMin, yMax, chartHeight]
    );

    // Build Skia path from d3-shape
    const skiaPath = useMemo(() => {
        if (chartData.length < 2) return null;

        const lineGen = shape
            .line<ChartDataPoint>()
            .x((_, i) => scaleX(i))
            .y(d => scaleY(d.value))
            .curve(shape.curveMonotoneX);

        const svgPath = lineGen(chartData);
        if (!svgPath) return null;

        return Skia.Path.MakeFromSVGString(svgPath);
    }, [chartData, scaleX, scaleY]);

    const onLayout = (e: LayoutChangeEvent) => {
        if (e.nativeEvent.layout.width > 0) {
            setLayout({ width: e.nativeEvent.layout.width, height: CHART_HEIGHT });
        }
    };

    return (
        <View style={styles.container} onLayout={onLayout}>
            {layout.width > 0 && (
                <View style={styles.chartArea}>
                    {!data || data.length === 0 ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: CHART_HEIGHT,
                            }}
                        >
                            <Loading size="large" animateExit={false} transparent={true} />
                        </View>
                    ) : (
                        <ScrollView
                            ref={scrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            bounces={false}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                        >
                            <View style={{ width: contentWidth, height: layout.height }}>
                                {/* Skia Canvas */}
                                <Canvas style={{ width: contentWidth, height: chartHeight + 8 }}>
                                    {/* Horizontal Grid Lines - FIXED */}
                                    {yTicks.map((tick: number, i: number) => {
                                        const y = scaleY(tick);
                                        return (
                                            <Line
                                                key={`grid-${i}`}
                                                p1={vec(0, y)}
                                                p2={vec(contentWidth, y)}
                                                color={theme.border}
                                                strokeWidth={0.5}
                                            />
                                        );
                                    })}

                                    {/* X-Axis Ticks */}
                                    {chartData.map((point, index) => {
                                        const x = scaleX(index);
                                        const yBase = scaleY(yMin);
                                        return (
                                            <Line
                                                key={`x-tick-${point.time}`}
                                                p1={vec(x, yBase)}
                                                p2={vec(x, yBase + 6)}
                                                color={theme.border}
                                                strokeWidth={1}
                                            />
                                        );
                                    })}

                                    {/* Chart Line */}
                                    {skiaPath && (
                                        <Path
                                            path={skiaPath}
                                            color={theme.error}
                                            style="stroke"
                                            strokeWidth={2}
                                            end={pathEnd}
                                        />
                                    )}

                                    {/* Last Data Point Dot - rides the tip of the line */}
                                    {chartData.length > 0 && (
                                        <Circle cx={dotCx} cy={dotCy} r={3} color={theme.error} />
                                    )}
                                </Canvas>

                                {/* X-Axis Labels */}
                                <View style={styles.xAxisContainer} pointerEvents="none">
                                    {chartData.map((point, index) => {
                                        const x = scaleX(index);
                                        return (
                                            <AnimatedXLabel
                                                key={`x-label-${point.time}`}
                                                point={point}
                                                x={x}
                                                theme={theme}
                                            />
                                        );
                                    })}
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </View>
            )}

            {/* Y-Axis Overlay (stays fixed while chart scrolls) */}
            {layout.width > 0 && (
                <View style={[styles.yAxisOverlay, { width: Y_AXIS_WIDTH }]} pointerEvents="none">
                    <View
                        style={[StyleSheet.absoluteFill, { backgroundColor: theme.background }]}
                    />
                    {yTicks.map((val: number, i: number) => (
                        <Text
                            key={i}
                            style={[
                                styles.yAxisLabel,
                                {
                                    color: theme.textSecondary,
                                    top: scaleY(val) - 8,
                                },
                            ]}
                        >
                            {val % 1 === 0 ? val : val.toFixed(1)}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
};

const AnimatedXLabel = ({ point, x, theme }: any) => {
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 800 });
    }, [opacity]);

    return (
        <Animated.View style={[styles.xLabelWrapper, { left: x, opacity }]}>
            <Text style={[styles.xAxisLabel, { color: theme.textSecondary }]}>{point.time}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: CHART_HEIGHT,
    },
    chartArea: {
        flex: 1,
        overflow: 'hidden',
    },
    xAxisContainer: {
        position: 'relative',
        height: BOTTOM_PAD - 8,
        marginTop: 24,
    },
    yAxisOverlay: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        zIndex: 10,
    },
    yAxisLabel: {
        position: 'absolute',
        left: 0,
        fontSize: 12,
        width: '100%',
        textAlign: 'left',
    },
    xLabelWrapper: {
        position: 'absolute',
        top: 0,
        width: 70,
        marginLeft: -35,
        alignItems: 'center',
    },
    xAxisLabel: {
        fontSize: 11,
        transform: [{ rotate: '-55deg' }],
        textAlign: 'right',
        width: 65,
    },
});
