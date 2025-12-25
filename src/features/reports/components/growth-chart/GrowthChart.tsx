import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    LayoutAnimation,
    UIManager,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles';
import Svg, { Path, Line, Text as SvgText, Circle } from 'react-native-svg';
import { line, curveMonotoneX } from 'd3-shape';
import { scaleLinear } from 'd3-scale';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    runOnJS,
    useAnimatedStyle,
} from 'react-native-reanimated';

import {
    productionData,
    survivalData,
    weightData,
    GrowthDataPoint,
    CHART_HEIGHT,
    PADDING,
    TABS,
} from './growthData';

// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export const GrowthChart = () => {
    const [expanded, setExpanded] = useState(true);
    const [selectedTab, setSelectedTab] = useState('Sản lượng');
    const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width);
    const [activeGrowthDataPoint, setActiveGrowthDataPoint] = useState<GrowthDataPoint | null>(
        null
    );

    // Dynamic data selection
    const activeData = useMemo(() => {
        switch (selectedTab) {
            case 'Tỷ lệ sống':
                return survivalData;
            case 'Trọng lượng con':
                return weightData;
            default:
                return productionData;
        }
    }, [selectedTab]);

    // Shared Values for safe UI interactions
    const opacitySV = useSharedValue(0);
    const pointerX = useSharedValue(0);
    const pointerY = useSharedValue(0);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    // ----------------------------------------------------------------------
    // SCALES & PATHS
    // ----------------------------------------------------------------------
    const { yMax, yLabels } = useMemo(() => {
        const allValues = activeData.reduce((acc: number[], d: GrowthDataPoint) => {
            acc.push(d.expected);
            if (d.actual !== null) acc.push(d.actual);
            return acc;
        }, [] as number[]);

        const maxVal = Math.max(...allValues, 1);
        const computedMax = Math.ceil(maxVal * 1.1 * 10) / 10; // 10% headroom, rounded to 0.1

        const labelCount = 5;
        const labels = Array.from({ length: labelCount }, (_, i) => {
            const val = (computedMax / (labelCount - 1)) * (labelCount - 1 - i);
            return val % 1 === 0 ? val.toString() : val.toFixed(1).replace('.', ',');
        });

        return { yMax: computedMax, yLabels: labels };
    }, [activeData]);

    const scales = useMemo(() => {
        const effectiveWidth = chartWidth - PADDING.left - PADDING.right;

        const x = scaleLinear()
            .domain([0, activeData.length - 1])
            .range([PADDING.left, PADDING.left + effectiveWidth]);

        const y = scaleLinear()
            .domain([0, yMax])
            .range([CHART_HEIGHT - PADDING.bottom, PADDING.top]);

        return { x, y };
    }, [chartWidth, yMax, activeData.length]);

    const paths = useMemo(() => {
        const makeExpectedLine = line<GrowthDataPoint>()
            .x((_, i) => scales.x(i))
            .y(d => scales.y(d.expected))
            .curve(curveMonotoneX);

        const actualData = activeData.filter(d => d.actual !== null);
        const makeActualLine = line<GrowthDataPoint>()
            .x(d => scales.x(activeData.indexOf(d)))
            .y(d => scales.y(d.actual || 0))
            .curve(curveMonotoneX);

        return {
            expectedPath: makeExpectedLine(activeData),
            actualPath: actualData.length > 1 ? makeActualLine(actualData) : null,
        };
    }, [scales, activeData]);

    const onLayout = (event: any) => {
        setChartWidth(event.nativeEvent.layout.width);
    };

    // ----------------------------------------------------------------------
    // GESTURE HANDLER
    // ----------------------------------------------------------------------

    // Helpers for worklet
    const left = PADDING.left;
    const right = PADDING.right;
    const top = PADDING.top;
    const bottom = PADDING.bottom;
    // Pre-calculate y-range for linear interpolation in worklet
    const yDomainMax = yMax;
    const yRangeMin = CHART_HEIGHT - PADDING.bottom; // Bottom pixel (value 0)
    const yRangeMax = PADDING.top; // Top pixel (value Max)

    const gesture = Gesture.Pan()
        .onBegin(e => {
            opacitySV.value = 1;
            const effectiveW = chartWidth - left - right;
            const step = effectiveW / (activeData.length - 1);

            const relativeX = e.x - left;
            const index = Math.round(relativeX / step);
            const clampedIndex = Math.max(0, Math.min(index, activeData.length - 1));

            // Calculate X
            const finalX = left + clampedIndex * step;
            pointerX.value = finalX;

            // Calculate Y
            const d = activeData[clampedIndex];
            const val = d.actual !== null ? d.actual : d.expected;
            const ratio = val! / yDomainMax;
            const finalY = yRangeMin - ratio * (yRangeMin - yRangeMax);
            pointerY.value = finalY;

            runOnJS(setActiveGrowthDataPoint)(d);
        })
        .onUpdate(e => {
            const effectiveW = chartWidth - left - right;
            const step = effectiveW / (activeData.length - 1);

            const relativeX = e.x - left;
            const index = Math.round(relativeX / step);
            const clampedIndex = Math.max(0, Math.min(index, activeData.length - 1));

            const finalX = left + clampedIndex * step;
            pointerX.value = finalX;

            const d = activeData[clampedIndex];
            const val = d.actual !== null ? d.actual : d.expected;
            const ratio = val! / yDomainMax;
            const finalY = yRangeMin - ratio * (yRangeMin - yRangeMax);
            pointerY.value = finalY;

            runOnJS(setActiveGrowthDataPoint)(d);
        })
        .onEnd(() => {
            // Kept visible deliberately for 'tap to select' behavior
        });

    // Animated Props
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
        top: pointerY.value - 90, // Position above dot
        left: pointerX.value,
        transform: [
            { translateX: pointerX.value > chartWidth / 2 ? -130 : 10 }, // Flip side
        ],
    }));

    const dateBoxStyle = useAnimatedStyle(() => ({
        opacity: opacitySV.value,
        left: pointerX.value - 40, // Center 80px
        top: CHART_HEIGHT - bottom + 10,
    }));

    // ----------------------------------------------------------------------
    // RENDER
    // ----------------------------------------------------------------------

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* HEADER */}
                <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.8}>
                    <Text style={styles.headerText}>BIỂU ĐỒ TĂNG TRƯỞNG</Text>
                    <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.text}
                    />
                </TouchableOpacity>

                {expanded && (
                    <View style={styles.content}>
                        {/* TABS */}
                        <View style={styles.tabContainer}>
                            {TABS.map(tab => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[styles.tab, selectedTab === tab && styles.selectedTab]}
                                    onPress={() => setSelectedTab(tab)}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            selectedTab === tab && styles.selectedTabText,
                                        ]}
                                    >
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* CHART */}
                        <View style={styles.chartWrapper} onLayout={onLayout}>
                            <GestureDetector gesture={gesture}>
                                <View style={{ flex: 1 }}>
                                    <Svg width={chartWidth} height={CHART_HEIGHT}>
                                        {/* Grids & Y-Axis Labels */}
                                        {yLabels.map((label, i) => {
                                            const y =
                                                top +
                                                ((CHART_HEIGHT - top - bottom) /
                                                    (yLabels.length - 1)) *
                                                    i;
                                            return (
                                                <React.Fragment key={`grid-group-${i}`}>
                                                    <Line
                                                        x1={left}
                                                        x2={chartWidth - right}
                                                        y1={y}
                                                        y2={y}
                                                        stroke={colors.gray[100]}
                                                        strokeWidth={1}
                                                    />
                                                    <SvgText
                                                        x={left}
                                                        y={y - 5}
                                                        fill={colors.gray[500]}
                                                        fontSize="10"
                                                    >
                                                        {label}
                                                    </SvgText>
                                                </React.Fragment>
                                            );
                                        })}

                                        {/* Paths */}
                                        <Path
                                            d={paths?.expectedPath || ''}
                                            fill="none"
                                            stroke="#FFAB76"
                                            strokeWidth={2}
                                        />
                                        {paths?.actualPath && (
                                            <Path
                                                d={paths.actualPath}
                                                fill="none"
                                                stroke="#0057FF"
                                                strokeWidth={2}
                                            />
                                        )}

                                        {/* X Axis Labels */}
                                        {activeData.map((d: GrowthDataPoint, i: number) => {
                                            if (i % 7 !== 0 && i !== activeData.length - 1)
                                                return null;
                                            return (
                                                <SvgText
                                                    key={i}
                                                    x={scales.x(i)}
                                                    y={CHART_HEIGHT - bottom + 25}
                                                    fill={colors.gray[500]}
                                                    fontSize="10"
                                                    textAnchor="middle"
                                                >
                                                    {formatDate(d.date)}
                                                </SvgText>
                                            );
                                        })}

                                        {/* INTERACTION ELEMENTS */}
                                        <AnimatedLine
                                            animatedProps={cursorProps}
                                            y1={top}
                                            y2={CHART_HEIGHT - bottom}
                                            stroke={colors.gray[400]}
                                            strokeDasharray="4 4"
                                            strokeWidth={1}
                                        />
                                        <AnimatedCircle
                                            animatedProps={dotProps}
                                            r={7}
                                            fill="#0057FF"
                                            stroke="#FFFFFF"
                                            strokeWidth={2}
                                        />
                                    </Svg>

                                    {/* OVERLAY TOOLTIP & DATE BOX */}
                                    <AnimatedView style={[styles.activeDateBox, dateBoxStyle]}>
                                        <Text style={styles.activeDateText}>
                                            {activeGrowthDataPoint
                                                ? formatDate(activeGrowthDataPoint.date)
                                                : '--/--/----'}
                                        </Text>
                                    </AnimatedView>

                                    <AnimatedView style={[styles.tooltip, tooltipStyle]}>
                                        <Text style={styles.tooltipTitle}>
                                            {activeGrowthDataPoint
                                                ? `Ngày tuổi ${activeGrowthDataPoint.dayAge}`
                                                : '...'}
                                        </Text>
                                        <View style={styles.tooltipRow}>
                                            <Text style={styles.tooltipLabel}>Kỳ vọng: </Text>
                                            <Text style={styles.tooltipValueOrange}>
                                                {activeGrowthDataPoint
                                                    ? `${activeGrowthDataPoint.expected} (kg)`
                                                    : '...'}
                                            </Text>
                                        </View>
                                        <View style={styles.tooltipRow}>
                                            <Text style={styles.tooltipLabel}>Thực tế: </Text>
                                            <Text style={styles.tooltipValueBlue}>
                                                {activeGrowthDataPoint
                                                    ? `${activeGrowthDataPoint.actual ?? 0} (kg)`
                                                    : '...'}
                                            </Text>
                                        </View>
                                    </AnimatedView>
                                </View>
                            </GestureDetector>
                        </View>

                        {/* LEGEND */}
                        <View style={styles.legendContainer}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#FFAB76' }]} />
                                <Text style={styles.legendText}>Kỳ vọng</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#0057FF' }]} />
                                <Text style={styles.legendText}>Ước tính</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#D1D5DB' }]} />
                                <Text style={styles.legendText}>Thực tế</Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        marginTop: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
    },
    headerText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        textTransform: 'uppercase',
    },
    content: {
        backgroundColor: colors.white,
    },
    tabContainer: {
        flexDirection: 'row',
        height: 48,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    tab: {
        height: '100%',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    selectedTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#0057FF',
    },
    tabText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '400',
    },
    selectedTabText: {
        color: '#0057FF',
        fontWeight: '500',
    },
    chartWrapper: {
        width: '100%',
        height: CHART_HEIGHT,
    },
    tooltip: {
        position: 'absolute',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        zIndex: 999,
        borderWidth: 0.5,
        borderColor: '#E5E7EB',
    },
    tooltipTitle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 4,
    },
    tooltipRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        minWidth: 90,
        marginBottom: 2,
    },
    tooltipLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    tooltipValueOrange: {
        fontSize: 12,
        color: '#FFAB76',
        fontWeight: '600',
    },
    tooltipValueBlue: {
        fontSize: 12,
        color: '#0057FF',
        fontWeight: '600',
    },
    activeDateBox: {
        position: 'absolute',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#D1D5DB',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#9CA3AF',
        zIndex: 998,
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
    },
    activeDateText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#374151',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 24,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 13,
        color: '#374151',
    },
});
