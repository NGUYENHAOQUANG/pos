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

// ----------------------------------------------------------------------
// TYPES & MOCK DATA
// ----------------------------------------------------------------------

type DataPoint = {
    date: string;
    actual: number | null;
    expected: number;
    dayAge: number;
};

// Mock data matching the curve in the image
const MOCK_DATA: DataPoint[] = [
    { date: '2025-12-02', actual: 0, expected: 0, dayAge: 2 },
    { date: '2025-12-03', actual: 0.3, expected: 0.8, dayAge: 3 },
    { date: '2025-12-04', actual: 1.2, expected: 2.2, dayAge: 4 },
    { date: '2025-12-05', actual: null, expected: 4.5, dayAge: 5 },
    { date: '2025-12-06', actual: null, expected: 8.0, dayAge: 6 },
    { date: '2025-12-07', actual: null, expected: 13.0, dayAge: 7 },
    { date: '2025-12-08', actual: null, expected: 19.5, dayAge: 8 },
    { date: '2025-12-09', actual: null, expected: 27.0, dayAge: 9 },
    { date: '2025-12-10', actual: null, expected: 35.0, dayAge: 10 },
    { date: '2025-12-11', actual: null, expected: 43.0, dayAge: 11 },
    { date: '2025-12-12', actual: null, expected: 50.0, dayAge: 12 },
    { date: '2025-12-13', actual: null, expected: 56.0, dayAge: 13 },
    { date: '2025-12-14', actual: null, expected: 60.0, dayAge: 14 },
    { date: '2025-12-15', actual: null, expected: 63.0, dayAge: 15 },
];

const TABS = ['Sản lượng', 'Tỷ lệ sống', 'Trọng lượng con'];

// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);

const CHART_HEIGHT = 380;
const PADDING = { top: 30, right: 16, bottom: 40, left: 16 };

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
    const [activeDataPoint, setActiveDataPoint] = useState<DataPoint | null>(null);

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
    const scales = useMemo(() => {
        const effectiveWidth = chartWidth - PADDING.left - PADDING.right;
        const yMax = Math.max(...MOCK_DATA.map(d => Math.max(d.expected, d.actual || 0)), 1);

        const x = scaleLinear()
            .domain([0, MOCK_DATA.length - 1])
            .range([PADDING.left, PADDING.left + effectiveWidth]);

        const y = scaleLinear()
            .domain([0, yMax * 1.1])
            .range([CHART_HEIGHT - PADDING.bottom, PADDING.top]);

        return { x, y };
    }, [chartWidth]);

    const paths = useMemo(() => {
        const makeExpectedLine = line<DataPoint>()
            .x((_, i) => scales.x(i))
            .y(d => scales.y(d.expected))
            .curve(curveMonotoneX);

        const actualData = MOCK_DATA.filter(d => d.actual !== null);
        const makeActualLine = line<DataPoint>()
            .x(d => scales.x(MOCK_DATA.indexOf(d)))
            .y(d => scales.y(d.actual || 0))
            .curve(curveMonotoneX);

        return {
            expectedPath: makeExpectedLine(MOCK_DATA),
            actualPath: actualData.length > 1 ? makeActualLine(actualData) : null,
        };
    }, [scales]);

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
    const yDomainMax = Math.max(...MOCK_DATA.map(d => d.expected), 1) * 1.1;
    const yRangeMin = CHART_HEIGHT - PADDING.bottom; // Bottom pixel (value 0)
    const yRangeMax = PADDING.top; // Top pixel (value Max)

    const gesture = Gesture.Pan()
        .onBegin(e => {
            opacitySV.value = 1;
            const effectiveW = chartWidth - left - right;
            const step = effectiveW / (MOCK_DATA.length - 1);

            const relativeX = e.x - left;
            const index = Math.round(relativeX / step);
            const clampedIndex = Math.max(0, Math.min(index, MOCK_DATA.length - 1));

            // Calculate X
            const finalX = left + clampedIndex * step;
            pointerX.value = finalX;

            // Calculate Y
            const d = MOCK_DATA[clampedIndex];
            const val = d.actual !== null ? d.actual : d.expected;
            const ratio = val! / yDomainMax;
            const finalY = yRangeMin - ratio * (yRangeMin - yRangeMax);
            pointerY.value = finalY;

            runOnJS(setActiveDataPoint)(d);
        })
        .onUpdate(e => {
            const effectiveW = chartWidth - left - right;
            const step = effectiveW / (MOCK_DATA.length - 1);

            const relativeX = e.x - left;
            const index = Math.round(relativeX / step);
            const clampedIndex = Math.max(0, Math.min(index, MOCK_DATA.length - 1));

            const finalX = left + clampedIndex * step;
            pointerX.value = finalX;

            const d = MOCK_DATA[clampedIndex];
            const val = d.actual !== null ? d.actual : d.expected;
            const ratio = val! / yDomainMax;
            const finalY = yRangeMin - ratio * (yRangeMin - yRangeMax);
            pointerY.value = finalY;

            runOnJS(setActiveDataPoint)(d);
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
                                        {/* Grids */}
                                        {[0, 1, 2, 3, 4].map(i => {
                                            const y = top + ((CHART_HEIGHT - top - bottom) / 4) * i;
                                            return (
                                                <Line
                                                    key={`grid-${i}`}
                                                    x1={left}
                                                    x2={chartWidth - right}
                                                    y1={y}
                                                    y2={y}
                                                    stroke={colors.gray[100]}
                                                    strokeWidth={1}
                                                />
                                            );
                                        })}

                                        {/* 0 Label */}
                                        <SvgText
                                            x={left}
                                            y={top + 15}
                                            fill={colors.gray[500]}
                                            fontSize="10"
                                        >
                                            0
                                        </SvgText>

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
                                        {MOCK_DATA.map((d, i) => {
                                            if (i % 3 !== 0 && i !== MOCK_DATA.length - 1)
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
                                            {activeDataPoint
                                                ? formatDate(activeDataPoint.date)
                                                : '--/--/----'}
                                        </Text>
                                    </AnimatedView>

                                    <AnimatedView style={[styles.tooltip, tooltipStyle]}>
                                        <Text style={styles.tooltipTitle}>
                                            {activeDataPoint
                                                ? `Ngày tuổi ${activeDataPoint.dayAge}`
                                                : '...'}
                                        </Text>
                                        <View style={styles.tooltipRow}>
                                            <Text style={styles.tooltipLabel}>Kỳ vọng: </Text>
                                            <Text style={styles.tooltipValueOrange}>
                                                {activeDataPoint
                                                    ? `${activeDataPoint.expected} (kg)`
                                                    : '...'}
                                            </Text>
                                        </View>
                                        <View style={styles.tooltipRow}>
                                            <Text style={styles.tooltipLabel}>Thực tế: </Text>
                                            <Text style={styles.tooltipValueBlue}>
                                                {activeDataPoint
                                                    ? `${activeDataPoint.actual ?? 0} (kg)`
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
