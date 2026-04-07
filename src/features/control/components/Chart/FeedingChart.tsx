import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
    Easing,
    ScrollView,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Svg, { Line, Path, Circle, Rect, G, Text as SvgText } from 'react-native-svg';
import { FeedingTooltip } from './FeedingTooltip';
import { useAppTheme } from '@/styles/themeContext';
import { ISensorStatistic } from '@/features/control/data/devicesData';

const AnimatedG = Animated.createAnimatedComponent(G) as any;
const AnimatedView = Animated.createAnimatedComponent(View);

const CHART_HEIGHT = 260;
const SCREEN_WIDTH = Dimensions.get('window').width;
const AXIS_MARGIN_TOP = 10;
const Y_AXIS_WIDTH = 35;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 50;
const PADDING_RIGHT = 20;

// Helper to convert HH:mm to float hours
const parseTimeToHours = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
};

interface FeedingChartProps {
    data?: ISensorStatistic[];
}

export default function FeedingChart({ data = [] }: FeedingChartProps) {
    const theme = useAppTheme();
    const [selectedPoint, setSelectedPoint] = useState<any>(null);

    const cursorAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // 1. Process Data
    const processedData = useMemo(() => {
        // Sort by time just in case
        const sorted = [...data].sort(
            (a, b) => parseTimeToHours(a.time) - parseTimeToHours(b.time)
        );

        // If no data, provide placeholder or empty
        if (sorted.length === 0) return [];

        return sorted.map(item => ({
            ...item,
            hourValue: parseTimeToHours(item.time),
        }));
    }, [data]);

    const scrollViewRef = useRef<ScrollView>(null);
    const [hasScrolled, setHasScrolled] = useState(false);

    // 2. Determine Axis Ranges
    const { minTime, maxTime, maxY, xLabels } = useMemo(() => {
        // Fixed range 0 -> 24
        const startHour = 0;
        const endHour = 24;

        const values: number[] = [];
        processedData.forEach(d => {
            values.push(d.feedAmount);
            values.push(d.plannedFeedAmount);
        });
        const maxVal = Math.max(...values, 0);
        // Round up max val to nice number
        const maxYVal = Math.ceil(maxVal / 5) * 5 || 10;

        // Generate Labels (every 1 hour)
        const labels = [];
        for (let h = startHour; h <= endHour; h += 1) {
            labels.push(`${h.toString().padStart(2, '0')}:00`);
        }

        return { minTime: startHour, maxTime: endHour, maxY: maxYVal, xLabels: labels };
    }, [processedData]);

    const yLabels = [];
    const yStep = maxY / 4 || 1;
    for (let i = 0; i <= maxY; i += yStep) {
        yLabels.push(i);
    }

    // 3. Scaling Functions

    const totalHours = maxTime - minTime; // Always 24
    const PIXELS_PER_HOUR = 60;
    const contentWidthRaw = totalHours * PIXELS_PER_HOUR;
    const minContentWidth = SCREEN_WIDTH - 32 - Y_AXIS_WIDTH;
    const contentWidth = Math.max(contentWidthRaw + PADDING_RIGHT, minContentWidth);

    // Time -> X (Relative to Content SVG)
    const getX = React.useCallback(
        (hour: number) => {
            // minTime is 0
            const availableWidth = contentWidth - PADDING_RIGHT - 20;
            return (hour / 24) * availableWidth + 20;
        },
        [contentWidth]
    );

    // Value -> Y
    const getY = React.useCallback(
        (val: number) => {
            return (
                CHART_HEIGHT -
                PADDING_TOP -
                PADDING_BOTTOM -
                (val / maxY) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM) +
                PADDING_TOP
            );
        },
        [maxY]
    );

    const chartAreaHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    // Auto Scroll to first data point
    useEffect(() => {
        if (processedData.length > 0 && !hasScrolled && scrollViewRef.current && contentWidth > 0) {
            const firstHour = processedData[0].hourValue;
            // Scroll to start slightly before the first point (e.g. -1 hour)
            const targetX = getX(Math.max(0, firstHour - 1));

            // Use setTimeout to allow layout to finish
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
                setHasScrolled(true);
            }, 500);
        }
    }, [processedData, hasScrolled, contentWidth, getX]);

    useEffect(() => {
        if (selectedPoint) {
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(cursorAnim, {
                    toValue: { x: selectedPoint.x, y: selectedPoint.y },
                    duration: 250,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [selectedPoint, cursorAnim, opacityAnim]);

    const createStepPath = () => {
        if (processedData.length === 0) return '';

        let path = `M ${getX(processedData[0].hourValue)} ${getY(processedData[0].feedAmount)}`;

        for (let i = 0; i < processedData.length - 1; i++) {
            const current = processedData[i];
            const next = processedData[i + 1];

            const x2 = getX(next.hourValue);
            const y1 = getY(current.feedAmount);
            const y2 = getY(next.feedAmount);

            path += ` L ${x2} ${y1} L ${x2} ${y2}`;
        }
        return path;
    };

    const handleTouch = (evt: any) => {
        const locationX = evt.nativeEvent.locationX;
        let minDistance = 1000;
        let nearestIndex = -1;

        processedData.forEach((point, index) => {
            const px = getX(point.hourValue);
            const dist = Math.abs(px - locationX);
            if (dist < minDistance) {
                minDistance = dist;
                nearestIndex = index;
            }
        });

        if (nearestIndex !== -1) {
            const point = processedData[nearestIndex];
            setSelectedPoint({
                x: getX(point.hourValue),
                y: getY(point.feedAmount),
                value: point.feedAmount,
                time: point.time,
            });
        }
    };

    const verticalLineStyle = {
        transform: [{ translateX: cursorAnim.x }],
        opacity: opacityAnim,
    };

    const horizontalLineStyle = {
        transform: [{ translateY: cursorAnim.y }],
        opacity: opacityAnim,
    };

    const cursorPointStyle = {
        transform: [{ translateX: cursorAnim.x }, { translateY: cursorAnim.y }],
        opacity: opacityAnim,
    };

    const tooltipAnimatedStyle = [
        styles.tooltipContainer,
        {
            transform: [{ translateX: cursorAnim.x }, { translateY: cursorAnim.y }],
            opacity: opacityAnim,
        },
    ];

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.background, borderColor: theme.border },
            ]}
        >
            <Text style={[styles.title, { color: theme.text }]}>
                Khối Lượng Thức Ăn Thả Thực Tế
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Đo bằng cảm biến cân nặng (Loadcell)
            </Text>

            <View style={styles.chartWrapperRow}>
                {/* Fixed Y-Axis */}
                <View style={{ width: Y_AXIS_WIDTH, height: CHART_HEIGHT }}>
                    <Svg width={Y_AXIS_WIDTH} height={CHART_HEIGHT}>
                        {yLabels.map(val => (
                            <G key={`grid-y-label-${val}`}>
                                <SvgText
                                    x={Y_AXIS_WIDTH - 5}
                                    y={getY(val) + 3}
                                    fill={theme.text}
                                    fontSize="10"
                                    textAnchor="end"
                                >
                                    {val % 1 === 0 ? val : val.toFixed(1)}
                                </SvgText>
                            </G>
                        ))}
                        {/* Bottom Axis Line Extension */}
                        <Line
                            x1={0}
                            y1={CHART_HEIGHT - PADDING_BOTTOM + AXIS_MARGIN_TOP}
                            x2={Y_AXIS_WIDTH}
                            y2={CHART_HEIGHT - PADDING_BOTTOM + AXIS_MARGIN_TOP}
                            stroke={theme.gray[300]}
                            strokeWidth={1}
                        />
                    </Svg>
                </View>

                {/* Scrollable Content */}
                <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={handleTouch}
                        style={styles.touchArea}
                    >
                        <Svg width={contentWidth} height={CHART_HEIGHT}>
                            {/* Horizontal Grid Lines */}
                            {yLabels.map(val => (
                                <Line
                                    key={`grid-y-${val}`}
                                    x1={0}
                                    y1={getY(val)}
                                    x2={contentWidth}
                                    y2={getY(val)}
                                    // Make stroke dashed or lighter
                                    stroke={theme.gray[100]}
                                    strokeWidth={1}
                                />
                            ))}

                            {/* Bottom Axis Line */}
                            <Line
                                x1={0}
                                y1={CHART_HEIGHT - PADDING_BOTTOM + AXIS_MARGIN_TOP}
                                x2={contentWidth}
                                y2={CHART_HEIGHT - PADDING_BOTTOM + AXIS_MARGIN_TOP}
                                stroke={theme.gray[300]}
                                strokeWidth={1}
                            />

                            {/* X-Axis Grid & Labels */}
                            {xLabels.map((label, index) => {
                                const hourVal = parseTimeToHours(label);
                                const xPos = getX(hourVal);

                                const chartBottom = CHART_HEIGHT - PADDING_BOTTOM;
                                const axisY = chartBottom + AXIS_MARGIN_TOP;
                                const tickHalf = 4;
                                const textMargin = 12;

                                if (xPos < 0 || xPos > contentWidth) return null;

                                return (
                                    <G key={`grid-x-${index}`}>
                                        <Line
                                            x1={xPos}
                                            y1={PADDING_TOP}
                                            y2={chartBottom}
                                            stroke={theme.gray[100]}
                                            strokeDasharray="4 4"
                                        />
                                        <Line
                                            x1={xPos}
                                            y1={axisY - tickHalf}
                                            x2={xPos}
                                            y2={axisY + tickHalf}
                                            stroke={theme.gray[400]}
                                            strokeWidth={1.5}
                                        />
                                        <SvgText
                                            x={xPos}
                                            y={axisY + tickHalf + textMargin}
                                            fill={theme.textSecondary}
                                            fontSize="10"
                                            textAnchor="middle"
                                        >
                                            {label}
                                        </SvgText>
                                    </G>
                                );
                            })}

                            {/* Planned Data (Bars) */}
                            {processedData.map((d, i) => {
                                const x = getX(d.hourValue);
                                const y = getY(d.plannedFeedAmount);
                                const barWidth = 8;
                                const barHeight = chartAreaHeight - (y - PADDING_TOP);
                                return (
                                    <Rect
                                        key={`plan-${i}`}
                                        x={x - barWidth / 2}
                                        y={y}
                                        width={barWidth}
                                        height={Math.max(barHeight, 0)}
                                        fill={theme.primary}
                                        rx={2}
                                    />
                                );
                            })}

                            {/* Actual Data (Step Line) */}
                            <Path
                                d={createStepPath()}
                                fill="none"
                                stroke={theme.orange[600]}
                                strokeWidth="2"
                            />

                            {/* Points on Step Line */}
                            {processedData.map((point, i) => (
                                <Circle
                                    key={`point-${i}`}
                                    cx={getX(point.hourValue)}
                                    cy={getY(point.feedAmount)}
                                    r={3}
                                    fill={theme.orange[600]}
                                    stroke={theme.background}
                                    strokeWidth={1}
                                />
                            ))}

                            {/* Cursor */}
                            <AnimatedG style={verticalLineStyle}>
                                <Line
                                    x1={0}
                                    y1={PADDING_TOP}
                                    x2={0}
                                    y2={CHART_HEIGHT - PADDING_BOTTOM + AXIS_MARGIN_TOP}
                                    stroke={theme.gray[600]}
                                    strokeWidth={1}
                                />
                            </AnimatedG>

                            <AnimatedG style={horizontalLineStyle}>
                                <Line
                                    x1={0}
                                    y1={0}
                                    x2={contentWidth}
                                    y2={0}
                                    stroke={theme.gray[600]}
                                    strokeWidth={1}
                                />
                            </AnimatedG>

                            <AnimatedG style={cursorPointStyle}>
                                <Circle
                                    cx={0}
                                    cy={0}
                                    r={4}
                                    fill={theme.orange[600]}
                                    stroke={theme.background}
                                    strokeWidth={2}
                                />
                            </AnimatedG>
                        </Svg>

                        {/* Tooltip */}
                        {selectedPoint && (
                            <AnimatedView style={tooltipAnimatedStyle}>
                                <FeedingTooltip
                                    visible={true}
                                    x={0}
                                    y={0}
                                    time={selectedPoint.time}
                                    weight={selectedPoint.value}
                                />
                            </AnimatedView>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View
                        style={[styles.legendDashActual, { backgroundColor: theme.orange[600] }]}
                    />
                    <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                        Đo thực tế
                    </Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendCirclePlan, { backgroundColor: theme.primary }]} />
                    <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                        Theo kế hoạch
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        padding: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 16,
    },
    chartWrapperRow: {
        flexDirection: 'row',
    },
    touchArea: {
        position: 'relative',
    },
    tooltipContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 100,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        gap: 24,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDashActual: {
        width: 16,
        height: 2,
    },
    legendCirclePlan: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
    },
});
