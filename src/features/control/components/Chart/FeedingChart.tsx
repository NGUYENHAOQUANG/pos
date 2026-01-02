import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import Svg, { Line, Path, Circle, Rect, G, Text as SvgText } from 'react-native-svg';
import { FeedingTooltip } from './FeedingTooltip';
import { colors } from '@/styles';
import { ISensorStatistic } from '@/features/control/data/devicesData';

const AnimatedG = Animated.createAnimatedComponent(G) as any;
const AnimatedView = Animated.createAnimatedComponent(View);

const CHART_HEIGHT = 260;
const SCREEN_WIDTH = Dimensions.get('window').width;
const AXIS_MARGIN_TOP = 10;
const PADDING_LEFT = 35;
const PADDING_RIGHT = 20;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 50;
const CHART_WIDTH = SCREEN_WIDTH - 32 - PADDING_LEFT - PADDING_RIGHT;

// Helper to convert HH:mm to float hours
const parseTimeToHours = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
};

interface FeedingChartProps {
    data?: ISensorStatistic[];
}

export default function FeedingChart({ data = [] }: FeedingChartProps) {
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

    // 2. Determine Axis Ranges
    const { minTime, maxTime, maxY, xLabels } = useMemo(() => {
        if (processedData.length === 0) {
            return { minTime: 0, maxTime: 24, maxY: 10, xLabels: ['00:00', '12:00', '24:00'] };
        }

        const hours = processedData.map(d => d.hourValue);
        const minH = Math.min(...hours);
        const maxH = Math.max(...hours);

        // Padding for X axis (start slightly before min, end slightly after max)
        // For integer alignment, floor min, ceil max
        const startHour = Math.floor(minH);
        const endHour = Math.ceil(maxH) + 1; // Add 1 hour buffer

        const values: number[] = [];
        processedData.forEach(d => {
            values.push(d.feedAmount);
            values.push(d.plannedFeedAmount);
        });
        const maxVal = Math.max(...values, 0);
        // Round up max val to nice number
        const maxYVal = Math.ceil(maxVal / 5) * 5 || 10; // Steps of 5, fallback 10

        // Generate Labels (every 2 hours roughly, or adaptive)
        const labels = [];
        for (let h = startHour; h <= endHour; h += 2) {
            // Every 2 hours
            labels.push(`${h.toString().padStart(2, '0')}:00`);
        }

        return { minTime: startHour, maxTime: endHour, maxY: maxYVal, xLabels: labels };
    }, [processedData]);

    const yLabels = [];
    const yStep = maxY / 4 || 1;
    for (let i = 0; i <= maxY; i += yStep) {
        yLabels.push(i); // Keep decimals if step is small
    }

    // 3. Scaling Functions
    // Time -> X
    const getX = (hour: number) => {
        if (maxTime === minTime) return PADDING_LEFT;
        return ((hour - minTime) / (maxTime - minTime)) * CHART_WIDTH + PADDING_LEFT;
    };

    // Value -> Y
    const getY = (val: number) => {
        return (
            CHART_HEIGHT -
            PADDING_TOP -
            PADDING_BOTTOM -
            (val / maxY) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM) +
            PADDING_TOP
        );
    };

    const chartAreaHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

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

        // Start
        let path = `M ${getX(processedData[0].hourValue)} ${getY(processedData[0].feedAmount)}`;

        for (let i = 0; i < processedData.length - 1; i++) {
            const current = processedData[i];
            const next = processedData[i + 1];

            const x2 = getX(next.hourValue);
            const y1 = getY(current.feedAmount);
            const y2 = getY(next.feedAmount);

            // Step Line: Horizontal then Vertical
            // L x2 y1 L x2 y2
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
        <View style={styles.container}>
            <Text style={styles.title}>Khối Lượng Thức Ăn Thả Thực Tế</Text>
            <Text style={styles.subtitle}>Đo bằng cảm biến cân nặng (Loadcell)</Text>

            <View style={styles.chartWrapper}>
                <TouchableOpacity activeOpacity={1} onPress={handleTouch} style={styles.touchArea}>
                    <Svg width={SCREEN_WIDTH - 32} height={CHART_HEIGHT}>
                        {/* Horizontal Grid & Labels */}
                        {yLabels.map(val => (
                            <G key={`grid-y-${val}`}>
                                <Line
                                    x1={PADDING_LEFT}
                                    y1={getY(val)}
                                    x2={CHART_WIDTH + PADDING_LEFT}
                                    y2={getY(val)}
                                    stroke={colors.gray[100]}
                                    strokeWidth={1}
                                />
                                <SvgText
                                    x={PADDING_LEFT - 8}
                                    y={getY(val) + 3}
                                    fill={colors.text}
                                    fontSize="10"
                                    textAnchor="end"
                                >
                                    {val % 1 === 0 ? val : val.toFixed(1)}
                                </SvgText>
                            </G>
                        ))}

                        {/* Bottom Axis Line */}
                        <Line
                            x1={PADDING_LEFT}
                            y1={CHART_HEIGHT - PADDING_BOTTOM + AXIS_MARGIN_TOP}
                            x2={CHART_WIDTH + PADDING_LEFT}
                            y2={CHART_HEIGHT - PADDING_BOTTOM + AXIS_MARGIN_TOP}
                            stroke={colors.gray[300]}
                            strokeWidth={1}
                        />

                        {/* X-Axis Grid & Labels */}
                        {xLabels.map((label, index) => {
                            const hourVal = parseTimeToHours(label); // Assuming label is HH:mm
                            const xPos = getX(hourVal);

                            const chartBottom = CHART_HEIGHT - PADDING_BOTTOM;
                            const axisY = chartBottom + AXIS_MARGIN_TOP;
                            const tickHalf = 4;
                            const textMargin = 12;

                            // Only render if within bounds
                            if (xPos < PADDING_LEFT || xPos > CHART_WIDTH + PADDING_LEFT)
                                return null;

                            return (
                                <G key={`grid-x-${index}`}>
                                    <Line
                                        x1={xPos}
                                        y1={PADDING_TOP}
                                        y2={chartBottom}
                                        stroke={colors.gray[100]}
                                        strokeDasharray="4 4"
                                    />
                                    <Line
                                        x1={xPos}
                                        y1={axisY - tickHalf}
                                        x2={xPos}
                                        y2={axisY + tickHalf}
                                        stroke={colors.gray[400]}
                                        strokeWidth={1.5}
                                    />
                                    <SvgText
                                        x={xPos}
                                        y={axisY + tickHalf + textMargin}
                                        fill={colors.textSecondary}
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
                                    fill={colors.primary}
                                    rx={2}
                                />
                            );
                        })}

                        {/* Actual Data (Step Line) */}
                        <Path
                            d={createStepPath()}
                            fill="none"
                            stroke={colors.orange[600]}
                            strokeWidth="2"
                        />

                        {/* Points on Step Line */}
                        {processedData.map((point, i) => (
                            <Circle
                                key={`point-${i}`}
                                cx={getX(point.hourValue)}
                                cy={getY(point.feedAmount)}
                                r={3}
                                fill={colors.orange[600]}
                                stroke={colors.white}
                                strokeWidth={1}
                            />
                        ))}

                        {/* Cursor / Tooltip Lines */}
                        <AnimatedG style={verticalLineStyle}>
                            <Line
                                x1={0}
                                y1={PADDING_TOP}
                                x2={0}
                                y2={CHART_HEIGHT - PADDING_BOTTOM + AXIS_MARGIN_TOP}
                                stroke={colors.gray[600]}
                                strokeWidth={1}
                            />
                        </AnimatedG>

                        <AnimatedG style={horizontalLineStyle}>
                            <Line
                                x1={PADDING_LEFT}
                                y1={0}
                                x2={CHART_WIDTH + PADDING_LEFT}
                                y2={0}
                                stroke={colors.gray[600]}
                                strokeWidth={1}
                            />
                        </AnimatedG>

                        <AnimatedG style={cursorPointStyle}>
                            <Circle
                                cx={0}
                                cy={0}
                                r={4}
                                fill={colors.orange[600]}
                                stroke={colors.white}
                                strokeWidth={2}
                            />
                        </AnimatedG>
                    </Svg>

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
            </View>

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={styles.legendDashActual} />
                    <Text style={styles.legendText}>Đo thực tế</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={styles.legendCirclePlan} />
                    <Text style={styles.legendText}>Theo kế hoạch</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: 16,
        marginTop: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 16,
    },
    chartWrapper: {
        alignItems: 'center',
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
        backgroundColor: colors.orange[600],
    },
    legendCirclePlan: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    legendText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});
