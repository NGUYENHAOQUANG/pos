import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    LayoutChangeEvent,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
} from 'react-native';
import Svg, {
    Path,
    Line,
    Text as SvgText,
    Circle,
    G,
    Defs,
    Filter,
    FeDropShadow,
} from 'react-native-svg';
import * as d3Shape from 'd3-shape';
import * as d3Scale from 'd3-scale';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles/colors';

// --- 1. COMPONENT BUTTON ---
interface BasicDropDownButtonProps {
    label?: string;
    placeholder?: string;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

const BasicDropDownButton: React.FC<BasicDropDownButtonProps> = ({
    label,
    placeholder = 'Chọn mục',
    onPress,
    style,
}) => {
    return (
        <TouchableOpacity
            style={[btnStyles.container, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[btnStyles.text, !label && btnStyles.placeholder]}>
                {label || placeholder}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.text} />
        </TouchableOpacity>
    );
};

const btnStyles = StyleSheet.create({
    container: {
        height: 46,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    text: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
        marginRight: 4,
    },
    placeholder: {
        fontWeight: '400',
        color: colors.textSecondary,
    },
});

// --- MOCK DATA ---
const DATA = [
    { date: new Date(2023, 9, 16), active: 1, prep: 0, functional: 0 },
    { date: new Date(2023, 9, 18), active: 3, prep: 0, functional: 0 },
    { date: new Date(2023, 9, 20), active: 6, prep: 0, functional: 0 },
    { date: new Date(2023, 9, 24), active: 8, prep: 0, functional: 0 },
    { date: new Date(2023, 9, 28), active: 8, prep: 0, functional: 1 },
    { date: new Date(2023, 10, 6), active: 8, prep: 0, functional: 3 },
    { date: new Date(2023, 10, 8), active: 8, prep: 0, functional: 3 },
    { date: new Date(2023, 10, 16), active: 8, prep: 0, functional: 3 },
    { date: new Date(2023, 10, 18), active: 29, prep: 0, functional: 2 },
];

// --- CẤU HÌNH MÀU SẮC ---
const CHART_COLORS = {
    activeFill: colors.green[300],
    activeStroke: colors.success,
    prep: colors.orange[200],
    functional: colors.gray[200],
    functionalStroke: colors.gray[400],
    grid: colors.border,
    text: colors.textSecondary,
    indicator: colors.textTertiary,
    white: colors.white,
    border: colors.border,
    textMain: colors.text,
    borderCircle: colors.gray[100],
};

const CHART_HEIGHT = 300;
const PADDING = { top: 70, right: 20, bottom: 40, left: 35 };

// --- 2. COMPONENT CHÍNH ---
export const ActivePondChart = () => {
    const [expanded, setExpanded] = useState(true);
    const [width, setWidth] = useState(0);

    const onLayout = (event: LayoutChangeEvent) => {
        setWidth(event.nativeEvent.layout.width);
    };

    // --- TÍNH TOÁN D3 ---
    const { pathActive, pathFunctional, ticks, xScale, yScale, currentX } = useMemo(() => {
        if (width === 0)
            return {
                pathActive: '',
                pathFunctional: '',
                ticks: [],
                xScale: null,
                yScale: null,
                currentX: 0,
            };

        const chartWidth = width - PADDING.left - PADDING.right;
        const chartHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

        // Scale
        const minDate = DATA[0].date;
        const maxDate = DATA[DATA.length - 1].date;

        const x = d3Scale.scaleTime().domain([minDate, maxDate]).range([0, chartWidth]);
        const y = d3Scale.scaleLinear().domain([0, 32]).range([chartHeight, 0]);

        // Generators
        const areaFunctional = d3Shape
            .area<any>()
            .x(d => x(d.date))
            .y0(_ => y(0))
            .y1(d => y(d.active + d.functional))
            .curve(d3Shape.curveStepAfter);

        const areaActive = d3Shape
            .area<any>()
            .x(d => x(d.date))
            .y0(y(0))
            .y1(d => y(d.active))
            .curve(d3Shape.curveStepAfter);

        const currentXPos = x(maxDate);

        return {
            pathActive: areaActive(DATA) || '',
            pathFunctional: areaFunctional(DATA) || '',
            ticks: [0, 8, 16, 24, 32],
            xScale: x,
            yScale: y,
            currentX: currentXPos,
        };
    }, [width]);

    const formatDate = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}`;

    return (
        <View style={styles.container} onLayout={onLayout}>
            {/* Header Button */}
            <BasicDropDownButton
                label="TỔNG SỐ AO HOẠT ĐỘNG (3)"
                onPress={() => setExpanded(!expanded)}
                style={styles.headerButton}
            />

            {expanded && width > 0 && xScale && yScale && (
                <View style={styles.chartContainer}>
                    {/* Top Labels */}
                    <View style={styles.topLabelsContainer}>
                        <View style={styles.labelGroupLeft}>
                            <Text style={styles.labelTitle}>Ao vèo</Text>
                            <View style={styles.labelRow}>
                                <Text style={styles.labelTextBig}>A1V1</Text>
                                <View style={styles.divider} />
                                <Text style={styles.labelTextBig}>A1V2</Text>
                            </View>
                        </View>

                        <View style={styles.labelGroupRight}>
                            <Text style={styles.labelTitle}>Ao nuôi</Text>
                            <Text style={styles.labelTextBig}>A1N1</Text>
                        </View>
                    </View>

                    {/* Chart SVG */}
                    <Svg width={width} height={CHART_HEIGHT}>
                        <Defs>
                            <Filter id="lightShadow" x="-50%" y="-50%" width="200%" height="200%">
                                <FeDropShadow
                                    dx="0"
                                    dy="2"
                                    stdDeviation="2"
                                    floodColor="#000000"
                                    floodOpacity="0.25"
                                />
                            </Filter>
                        </Defs>

                        <G x={PADDING.left} y={PADDING.top}>
                            {/* Grid & Y Axis */}
                            {ticks.map(tick => (
                                <G key={tick}>
                                    <Line
                                        x1={0}
                                        y1={yScale(tick)}
                                        x2={width - PADDING.left - PADDING.right}
                                        y2={yScale(tick)}
                                        stroke={CHART_COLORS.grid}
                                        strokeWidth={1}
                                    />
                                    <SvgText
                                        x={-10}
                                        y={yScale(tick) + 4}
                                        fontSize="10"
                                        fill={CHART_COLORS.text}
                                        textAnchor="end"
                                    >
                                        {tick}
                                    </SvgText>
                                </G>
                            ))}

                            {/* Areas */}
                            <Path
                                d={pathFunctional}
                                fill={CHART_COLORS.functional}
                                stroke={CHART_COLORS.functionalStroke}
                                opacity={0.6}
                            />
                            <Path
                                d={pathActive}
                                fill={CHART_COLORS.activeFill}
                                stroke={CHART_COLORS.activeStroke}
                                strokeWidth={1}
                            />

                            {/* Bottom Line (Cam) */}
                            <Line
                                x1={0}
                                y1={yScale(0)}
                                x2={width - PADDING.left - PADDING.right}
                                y2={yScale(0)}
                                stroke={CHART_COLORS.prep}
                                strokeWidth={2}
                            />

                            {/* Indicator */}
                            <Line
                                x1={currentX}
                                y1={0}
                                x2={currentX}
                                y2={yScale(0)}
                                stroke={CHART_COLORS.indicator}
                                strokeWidth={1}
                                strokeDasharray="4 2"
                            />

                            {/* Dots */}
                            <Circle
                                cx={currentX}
                                cy={yScale(
                                    DATA[DATA.length - 1].active + DATA[DATA.length - 1].functional
                                )}
                                r={4}
                                fill={CHART_COLORS.white}
                                stroke={CHART_COLORS.functional}
                                strokeWidth={2}
                            />
                            <Circle
                                cx={currentX}
                                cy={yScale(DATA[DATA.length - 1].active)}
                                r={4}
                                fill={CHART_COLORS.white}
                                stroke={CHART_COLORS.activeFill}
                                strokeWidth={2}
                            />

                            <Circle
                                cx={currentX}
                                cy={yScale(0)}
                                r={4}
                                fill={CHART_COLORS.prep}
                                stroke={colors.white}
                                strokeWidth={1}
                                filter="url(#lightShadow)"
                            />

                            {/* --- X-AXIS LINE --- */}
                            <Line
                                x1={0}
                                y1={yScale(0) + 4}
                                x2={width - PADDING.left - PADDING.right}
                                y2={yScale(0) + 4}
                                stroke={colors.gray[600]}
                                strokeWidth={0.5}
                            />

                            {/* X Axis & Ticks */}
                            {DATA.map((d, index) => {
                                if (index % 2 !== 0 && index !== DATA.length - 1) return null;
                                return (
                                    <G key={index}>
                                        <Line
                                            x1={xScale(d.date)}
                                            y1={yScale(0) + 4}
                                            x2={xScale(d.date)}
                                            y2={yScale(0) + 9}
                                            stroke={colors.gray[600]}
                                            strokeWidth={0.5}
                                        />

                                        <SvgText
                                            x={xScale(d.date)}
                                            y={yScale(0) + 20}
                                            fontSize="10"
                                            fill={CHART_COLORS.text}
                                            textAnchor="middle"
                                        >
                                            {formatDate(d.date)}
                                        </SvgText>
                                    </G>
                                );
                            })}
                        </G>
                    </Svg>

                    {/* Legend */}
                    <View style={styles.legendContainer}>
                        <LegendItem color={CHART_COLORS.activeFill} label="Đang hoạt động" />
                        <LegendItem color={CHART_COLORS.prep} label="Đang chuẩn bị" />
                        <LegendItem color={CHART_COLORS.functional} label="Ao chức năng" />
                    </View>
                </View>
            )}
        </View>
    );
};

// Component Legend Item
const LegendItem = ({ color, label }: { color: string; label: string }) => (
    <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text style={styles.legendText}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
        margin: 10,
    },
    headerButton: {
        borderWidth: 0,
        backgroundColor: colors.white,
    },
    chartContainer: {
        backgroundColor: colors.white,
        paddingBottom: 10,
        position: 'relative',
    },
    topLabelsContainer: {
        position: 'absolute',
        top: 15,
        left: 0,
        right: 0,
        height: 50,
        zIndex: 10,
    },

    labelGroupLeft: {
        position: 'absolute',
        left: '20%',
        alignItems: 'center',
    },
    labelGroupRight: {
        position: 'absolute',
        left: '65%',
        alignItems: 'center',
    },

    labelTitle: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 4,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelTextBig: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: colors.borderDark,
        marginHorizontal: 8,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        flexWrap: 'wrap',
        gap: 16,
        marginTop: -10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        fontSize: 11,
        color: colors.textSecondary,
    },
});

export default ActivePondChart;
