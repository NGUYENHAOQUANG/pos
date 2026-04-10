import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { typography } from '@/styles/typography';
import { GraphDataPoint } from '@/features/menu/types/shrimpPrice.types';
import Svg, {
    Path,
    Defs,
    LinearGradient,
    Stop,
    Circle,
    Text as SvgText,
    Line,
} from 'react-native-svg';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    runOnJS,
    useAnimatedStyle,
} from 'react-native-reanimated';
import {
    generateBezierPath,
    formatPrice,
    formatYLabel,
} from '@/features/menu/utils/shrimpPriceUtils';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);

const { width } = Dimensions.get('window');

interface PriceChartProps {
    data: GraphDataPoint[];
    theme: Colors;
}

/** Interactive price chart with gesture-based tooltip */
export const PriceChart: React.FC<PriceChartProps> = ({ data, theme }) => {
    const chartWidth = width - spacing.xl;
    const chartHeight = 220;
    const padding = { top: 20, bottom: 30, left: 50, right: 20 };

    const [activePoint, setActivePoint] = useState<GraphDataPoint | null>(null);

    const opacitySV = useSharedValue(0);
    const pointerX = useSharedValue(0);
    const pointerY = useSharedValue(0);

    const cursorProps = useAnimatedProps(() => ({
        x1: pointerX.value,
        x2: pointerX.value,
        opacity: opacitySV.value,
    }));

    const dotProps = useAnimatedProps(() => ({
        cx: pointerX.value,
        cy: pointerY.value,
        opacity: opacitySV.value,
    }));

    const tooltipStyle = useAnimatedStyle(() => ({
        opacity: opacitySV.value,
        top: pointerY.value - 40,
        left: pointerX.value,
        transform: [{ translateX: pointerX.value > chartWidth / 2 ? -60 : 10 }],
    }));

    const actualData = data.filter((d: GraphDataPoint) => !d.isPrediction);
    if (actualData.length === 0) return null;

    const minValBase = Math.min(...actualData.map(d => d.value));
    const maxValBase = Math.max(...actualData.map(d => d.value));
    const minVal = minValBase * 0.95;
    const maxVal = maxValBase * 1.05;

    const minDateTs = actualData[0].originalDate.getTime();
    const maxDateTs = actualData[actualData.length - 1].originalDate.getTime();

    const getX = (date: Date) => {
        const time = date.getTime();
        if (maxDateTs === minDateTs) return padding.left;
        const normalized = (time - minDateTs) / (maxDateTs - minDateTs);
        return padding.left + normalized * (chartWidth - padding.left - padding.right);
    };

    const getY = (val: number) => {
        if (maxVal === minVal) return chartHeight - padding.bottom;
        const normalized = (val - minVal) / (maxVal - minVal);
        return (
            chartHeight - padding.bottom - normalized * (chartHeight - padding.top - padding.bottom)
        );
    };

    const actualPoints = actualData.map(d => ({ x: getX(d.originalDate), y: getY(d.value) }));
    const actualPath = generateBezierPath(actualPoints);

    let areaPath = '';
    if (actualPoints.length > 0) {
        areaPath =
            actualPath +
            ` L ${actualPoints[actualPoints.length - 1].x},${chartHeight - padding.bottom}` +
            ` L ${actualPoints[0].x},${chartHeight - padding.bottom} Z`;
    }

    const handleInteraction = (touchX: number) => {
        const closest = actualData.reduce((prev, curr) =>
            Math.abs(getX(curr.originalDate) - touchX) < Math.abs(getX(prev.originalDate) - touchX)
                ? curr
                : prev
        );
        pointerX.value = getX(closest.originalDate);
        pointerY.value = getY(closest.value);
        setActivePoint(closest);
    };

    const gesture = Gesture.Pan()
        .onBegin(e => {
            opacitySV.value = 1;
            runOnJS(handleInteraction)(e.x);
        })
        .onUpdate(e => {
            runOnJS(handleInteraction)(e.x);
        })
        .onEnd(() => {});

    const labelCount = 4;
    const yLabels = Array.from({ length: labelCount }, (_, i) => {
        return minVal + ((maxVal - minVal) / (labelCount - 1)) * (labelCount - 1 - i);
    });

    return (
        <GestureHandlerRootView style={{ width: chartWidth }}>
            <View style={{ height: chartHeight }}>
                <GestureDetector gesture={gesture}>
                    <View style={{ flex: 1 }}>
                        <Svg width={chartWidth} height={chartHeight}>
                            <Defs>
                                <LinearGradient id="gradientChart" x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="0" stopColor={theme.primary} stopOpacity="0.3" />
                                    <Stop offset="1" stopColor={theme.primary} stopOpacity="0.0" />
                                </LinearGradient>
                            </Defs>

                            {/* Y Axis Grid */}
                            {yLabels.map((val, i) => {
                                const y = getY(val);
                                return (
                                    <React.Fragment key={`y-${i}`}>
                                        <Line
                                            x1={padding.left}
                                            y1={y}
                                            x2={chartWidth - padding.right}
                                            y2={y}
                                            stroke={theme.border}
                                            strokeWidth={1}
                                            strokeDasharray="4 4"
                                        />
                                        <SvgText
                                            x={padding.left - 5}
                                            y={y + 4}
                                            fill={theme.textSecondary}
                                            fontSize="10"
                                            fontFamily={typography.fontFamily.regular}
                                            textAnchor="end"
                                        >
                                            {formatYLabel(val)}
                                        </SvgText>
                                    </React.Fragment>
                                );
                            })}

                            {/* X Axis Labels */}
                            {actualData.map((point, i) => {
                                if (
                                    i % Math.ceil(actualData.length / 5) !== 0 &&
                                    i !== actualData.length - 1
                                )
                                    return null;
                                const x = getX(point.originalDate);
                                return (
                                    <SvgText
                                        key={`x-${i}`}
                                        x={x}
                                        y={chartHeight - 5}
                                        fill={theme.textSecondary}
                                        fontSize="10"
                                        fontFamily={typography.fontFamily.regular}
                                        textAnchor="middle"
                                    >
                                        {point.date}
                                    </SvgText>
                                );
                            })}

                            {/* Area */}
                            {areaPath && <Path d={areaPath} fill="url(#gradientChart)" />}

                            {/* Main Line */}
                            <Path
                                d={actualPath}
                                stroke={theme.primary}
                                strokeWidth={2.5}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Data Point Dots */}
                            {actualPoints.map((pt, i) => (
                                <Circle
                                    key={`dot-${i}`}
                                    cx={pt.x}
                                    cy={pt.y}
                                    r={3}
                                    fill={theme.backgroundPrimary}
                                    stroke={theme.primary}
                                    strokeWidth={1.5}
                                />
                            ))}

                            {/* Cursor */}
                            <AnimatedLine
                                animatedProps={cursorProps}
                                y1={padding.top}
                                y2={chartHeight - padding.bottom}
                                stroke={theme.textTertiary}
                                strokeDasharray="4 4"
                                strokeWidth={1}
                            />
                            <AnimatedCircle
                                animatedProps={dotProps}
                                r={6}
                                fill={theme.primary}
                                stroke={theme.background}
                                strokeWidth={2}
                            />
                        </Svg>

                        {/* Tooltip */}
                        <AnimatedView
                            style={[
                                chartStyles.tooltip,
                                tooltipStyle,
                                {
                                    backgroundColor: theme.backgroundPrimary,
                                    borderColor: theme.border,
                                    shadowColor: theme.shadow,
                                },
                            ]}
                        >
                            <Text style={[chartStyles.tooltipValue, { color: theme.primary }]}>
                                {activePoint ? formatPrice(activePoint.value) : ''}
                            </Text>
                            <Text style={[chartStyles.tooltipDate, { color: theme.textSecondary }]}>
                                {activePoint ? activePoint.date : ''}
                            </Text>
                        </AnimatedView>

                        {/* Always visible label for today if no hover */}
                        {!activePoint && actualData.length > 0 && (
                            <View
                                style={[
                                    chartStyles.todayLabel,
                                    {
                                        right: padding.right - 10,
                                        top: getY(actualData[actualData.length - 1].value) - 40,
                                        backgroundColor: theme.blue[50],
                                    },
                                ]}
                            >
                                <Text style={[chartStyles.tooltipValue, { color: theme.primary }]}>
                                    {formatPrice(actualData[actualData.length - 1].value)}
                                </Text>
                                <Text style={[chartStyles.todayDate, { color: theme.primary }]}>
                                    {actualData[actualData.length - 1].date}
                                </Text>
                            </View>
                        )}
                    </View>
                </GestureDetector>
            </View>
        </GestureHandlerRootView>
    );
};

const chartStyles = StyleSheet.create({
    tooltip: {
        position: 'absolute',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        elevation: 4,
        borderWidth: 1,
        zIndex: 999,
    },
    tooltipValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    tooltipDate: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 2,
    },
    todayLabel: {
        position: 'absolute',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
    },
    todayDate: {
        fontSize: 11,
        marginTop: 2,
    },
});
