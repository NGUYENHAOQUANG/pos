import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    LayoutChangeEvent,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
    ScrollView,
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

// --- IMPORT MOCK DATA ---
import { POND_STATISTICS } from './MockData';

// --- CẤU HÌNH ---
const ITEM_WIDTH = 50;
const CHART_HEIGHT = 250;
const HEADER_HEIGHT = 70;
const Y_AXIS_WIDTH = 35;
const VERTICAL_PADDING = { top: 20, bottom: 20 };

// CẤU HÌNH TRỤC Y CỐ ĐỊNH THEO THIẾT KẾ
const FIXED_Y_TICKS = [0, 8, 16, 24, 32];
const Y_DOMAIN_MAX = 32; // Giá trị lớn nhất trên trục Y

// --- HELPER ---
const parseDate = (dateStr: string): Date => {
    const parts = dateStr.split('/');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
};

// --- COMPONENT BUTTON ---
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
}) => (
    <TouchableOpacity style={[btnStyles.container, style]} onPress={onPress} activeOpacity={0.7}>
        <Text style={[btnStyles.text, !label && btnStyles.placeholder]}>
            {label || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text} />
    </TouchableOpacity>
);

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
    text: { fontSize: 14, fontWeight: '700', color: colors.text, flex: 1, marginRight: 4 },
    placeholder: { fontWeight: '400', color: colors.textSecondary },
});

// --- COLORS ---
const CHART_COLORS = {
    activeFill: colors.green[300],
    activeStroke: colors.green[800],
    prep: colors.orange[200],
    functional: colors.gray[200],
    functionalStroke: colors.gray[400],
    grid: colors.border,
    text: colors.textSecondary,
    indicator: colors.textTertiary,
    white: colors.white,
    border: colors.border,
    black: colors.black,
};

export const ActivePondChart = () => {
    const [expanded, setExpanded] = useState(true);
    const [containerWidth, setContainerWidth] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const onLayout = (event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    };

    // --- 1. XỬ LÝ DỮ LIỆU ---
    const processedData = useMemo(() => {
        return POND_STATISTICS.map(item => ({
            date: parseDate(item.date),
            active: item.active,
            prep: item.preparing,
            functional: item.functional,
            total: item.total,
        })).sort((a, b) => a.date.getTime() - b.date.getTime());
    }, []);

    // --- 2. TỰ ĐỘNG CUỘN ---
    useEffect(() => {
        if (expanded && containerWidth > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [expanded, containerWidth]);

    // --- 3. TÍNH TOÁN D3 ---
    const {
        pathActive,
        pathFunctional,
        pathPrep,
        yTicks,
        xTicks,
        xScale,
        yScale,
        currentX,
        targetDataPoint,
        chartContentWidth,
    } = useMemo(() => {
        if (containerWidth === 0 || processedData.length === 0) {
            return {
                yTicks: [],
                xTicks: [],
                xScale: null,
                yScale: null,
                currentX: 0,
                targetDataPoint: { active: 0, functional: 0, prep: 0 },
                pathActive: '',
                pathFunctional: '',
                pathPrep: '',
                chartContentWidth: 0,
            };
        }

        const rightPadding = 20;
        const chartContentWidth = Math.max(
            containerWidth - Y_AXIS_WIDTH,
            processedData.length * ITEM_WIDTH + rightPadding
        );
        const chartHeight = CHART_HEIGHT - VERTICAL_PADDING.top - VERTICAL_PADDING.bottom;

        // Scale Y
        const yScale = d3Scale.scaleLinear().domain([0, Y_DOMAIN_MAX]).range([chartHeight, 0]);

        // Scale X
        const minDate = processedData[0].date;
        const maxDate = processedData[processedData.length - 1].date;
        const xRangeMax = processedData.length * ITEM_WIDTH;
        const xScale = d3Scale
            .scaleTime()
            .domain([minDate, maxDate])
            .range([ITEM_WIDTH / 2, xRangeMax - ITEM_WIDTH / 2]);

        // Generators
        const areaGenerator = (key: 'total' | 'prep_active' | 'active') =>
            d3Shape
                .area<any>()
                .x(d => xScale(d.date))
                .y0(_ => yScale(0))
                .y1(d => {
                    if (key === 'total') return yScale(d.active + d.prep + d.functional);
                    if (key === 'prep_active') return yScale(d.active + d.prep);
                    return yScale(d.active);
                })
                .curve(d3Shape.curveStepAfter);

        const lastItem = processedData[processedData.length - 1];
        const currentX = xScale(lastItem.date);

        const yTicks = FIXED_Y_TICKS; // [0, 8, 16, 24, 32]
        const xTicks = processedData.map(d => d.date);

        return {
            pathFunctional: areaGenerator('total')(processedData) || '',
            pathPrep: areaGenerator('prep_active')(processedData) || '',
            pathActive: areaGenerator('active')(processedData) || '',
            yTicks,
            xTicks,
            xScale,
            yScale,
            currentX,
            targetDataPoint: lastItem,
            chartContentWidth,
        };
    }, [containerWidth, processedData]);

    const formatDate = (date: Date) => {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${d}/${m}`;
    };

    const currentActiveTotal =
        processedData.length > 0 ? processedData[processedData.length - 1].active : 0;

    return (
        <View style={styles.container} onLayout={onLayout}>
            <BasicDropDownButton
                label={`TỔNG SỐ AO HOẠT ĐỘNG (${currentActiveTotal})`}
                onPress={() => setExpanded(!expanded)}
                style={styles.headerButton}
            />

            {expanded && containerWidth > 0 && xScale && yScale && (
                <View style={styles.contentContainer}>
                    <View style={styles.mainWrapper}>
                        {/* --- CỘT TRÁI: TRỤC Y (CỐ ĐỊNH) --- */}
                        <View
                            style={{
                                width: Y_AXIS_WIDTH,
                                paddingTop: HEADER_HEIGHT,
                                backgroundColor: colors.white,
                                zIndex: 2,
                            }}
                        >
                            <Svg width={Y_AXIS_WIDTH} height={CHART_HEIGHT}>
                                <G x={Y_AXIS_WIDTH} y={VERTICAL_PADDING.top}>
                                    {yTicks.map(tick => (
                                        <SvgText
                                            key={tick}
                                            x={-5}
                                            y={yScale(tick) + 4}
                                            fontSize="10"
                                            fill={CHART_COLORS.text}
                                            textAnchor="end"
                                        >
                                            {tick}
                                        </SvgText>
                                    ))}
                                    <Line
                                        x1={0}
                                        y1={yScale(0) + 4}
                                        x2={0}
                                        y2={0}
                                        stroke={colors.border}
                                        strokeWidth={1}
                                    />
                                </G>
                            </Svg>
                        </View>

                        {/* --- CỘT PHẢI: HEADER CỐ ĐỊNH + BIỂU ĐỒ CUỘN --- */}
                        <View style={{ flex: 1 }}>
                            {/* 1. TOP LABELS (CỐ ĐỊNH) */}
                            <View style={[styles.fixedHeaderLabels, { height: HEADER_HEIGHT }]}>
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

                            {/* 2. BIỂU ĐỒ (CÓ THỂ CUỘN) */}
                            <ScrollView
                                ref={scrollViewRef}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                bounces={false}
                                contentContainerStyle={{ width: chartContentWidth }}
                            >
                                <Svg width={chartContentWidth} height={CHART_HEIGHT}>
                                    <Defs>
                                        <Filter
                                            id="lightShadow"
                                            x="-50%"
                                            y="-50%"
                                            width="200%"
                                            height="200%"
                                        >
                                            <FeDropShadow
                                                dx="0"
                                                dy="2"
                                                stdDeviation="2"
                                                floodColor={CHART_COLORS.black}
                                                floodOpacity="0.25"
                                            />
                                        </Filter>
                                    </Defs>

                                    <G y={VERTICAL_PADDING.top}>
                                        {/* Grid lines cho các tick cố định */}
                                        {yTicks.map(tick => (
                                            <Line
                                                key={tick}
                                                x1={0}
                                                y1={yScale(tick)}
                                                x2={chartContentWidth}
                                                y2={yScale(tick)}
                                                stroke={CHART_COLORS.grid}
                                                strokeWidth={1}
                                            />
                                        ))}

                                        <Path
                                            d={pathFunctional}
                                            fill={CHART_COLORS.functional}
                                            stroke={CHART_COLORS.functionalStroke}
                                        />
                                        <Path
                                            d={pathPrep}
                                            fill={CHART_COLORS.prep}
                                            stroke={colors.orange[600]}
                                            strokeWidth={1}
                                        />
                                        <Path
                                            d={pathActive}
                                            fill={CHART_COLORS.activeFill}
                                            stroke={CHART_COLORS.activeStroke}
                                            strokeWidth={1}
                                        />

                                        <Line
                                            x1={currentX}
                                            y1={0}
                                            x2={currentX}
                                            y2={yScale(0)}
                                            stroke={CHART_COLORS.indicator}
                                            strokeWidth={0.5}
                                            strokeDasharray="3 1"
                                        />

                                        <Circle
                                            cx={currentX}
                                            cy={yScale(
                                                targetDataPoint.active +
                                                    targetDataPoint.prep +
                                                    targetDataPoint.functional
                                            )}
                                            r={4}
                                            fill={CHART_COLORS.functional}
                                            stroke={CHART_COLORS.white}
                                            strokeWidth={1}
                                            filter="url(#lightShadow)"
                                        />
                                        <Circle
                                            cx={currentX}
                                            cy={yScale(
                                                targetDataPoint.active + targetDataPoint.prep
                                            )}
                                            r={4}
                                            fill={CHART_COLORS.prep}
                                            stroke={CHART_COLORS.white}
                                            strokeWidth={1}
                                            filter="url(#lightShadow)"
                                        />
                                        <Circle
                                            cx={currentX}
                                            cy={yScale(targetDataPoint.active)}
                                            r={4}
                                            fill={CHART_COLORS.activeFill}
                                            stroke={CHART_COLORS.white}
                                            strokeWidth={1}
                                            filter="url(#lightShadow)"
                                        />

                                        <Line
                                            x1={0}
                                            y1={yScale(0) + 4}
                                            x2={chartContentWidth}
                                            y2={yScale(0) + 4}
                                            stroke={colors.gray[600]}
                                            strokeWidth={0.5}
                                        />

                                        {xTicks.map((tickDate, index) => (
                                            <G key={index}>
                                                <Line
                                                    x1={xScale(tickDate)}
                                                    y1={yScale(0) + 4}
                                                    x2={xScale(tickDate)}
                                                    y2={yScale(0) + 9}
                                                    stroke={colors.gray[600]}
                                                    strokeWidth={0.5}
                                                />
                                                <SvgText
                                                    x={xScale(tickDate)}
                                                    y={yScale(0) + 20}
                                                    fontSize="10"
                                                    fill={CHART_COLORS.text}
                                                    textAnchor="middle"
                                                >
                                                    {formatDate(tickDate)}
                                                </SvgText>
                                            </G>
                                        ))}
                                    </G>
                                </Svg>
                            </ScrollView>
                        </View>
                    </View>

                    <View style={styles.spacer} />

                    <View style={styles.legendWrapper}>
                        <LegendItem color={CHART_COLORS.activeFill} label="Đang hoạt động" />
                        <LegendItem color={CHART_COLORS.prep} label="Đang chuẩn bị" />
                        <LegendItem color={CHART_COLORS.functional} label="Ao chức năng" />
                    </View>
                </View>
            )}
        </View>
    );
};

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
    headerButton: { borderWidth: 0, backgroundColor: colors.white },

    contentContainer: { paddingBottom: 16 },

    mainWrapper: {
        flexDirection: 'row',
        backgroundColor: colors.white,
    },

    fixedHeaderLabels: {
        width: '100%',
        backgroundColor: colors.white,
        flexDirection: 'row',
        position: 'relative',
        alignItems: 'center',
    },
    labelGroupLeft: {
        position: 'absolute',
        left: '10%',
        alignItems: 'center',
    },
    labelGroupRight: {
        position: 'absolute',
        right: '20%',
        alignItems: 'center',
    },
    labelTitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 4,
    },
    labelRow: { flexDirection: 'row', alignItems: 'center' },
    labelTextBig: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    divider: {
        width: 1,
        height: 14,
        backgroundColor: colors.borderDark,
        marginHorizontal: 10,
    },

    legendWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 16,
        paddingHorizontal: 10,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: 14, height: 14, borderRadius: 10, marginRight: 6 },
    legendText: { fontSize: 12, color: colors.textSecondary },

    spacer: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
        opacity: 0.5,
        marginHorizontal: 16,
    },
});

export default ActivePondChart;
