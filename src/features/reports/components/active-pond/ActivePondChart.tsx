import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    LayoutChangeEvent,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import Svg, { Line, Text as SvgText, G, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { scaleLinear } from 'd3-scale';
import { colors, borderRadius } from '@/styles';
import ActivePondChartIcon from '@/assets/Icon/IconReport/ActivePondChartIcon.svg';
import ExpandedIcon from '@/assets/Icon/IconReport/Expanded.svg';
import { PondIndex } from '@/features/reports/components/env-chart/PondIndex';

// --- IMPORT MOCK DATA ---
// import { POND_STATISTICS } from './MockData';
import { usePondStatusDistribution } from '@/features/reports/hooks/usePondStatusDistribution';

// --- CẤU HÌNH ---
const ITEM_WIDTH = 40;
const CHART_HEIGHT = 200;
const Y_AXIS_WIDTH = 35;
const VERTICAL_PADDING = { top: 20, bottom: 20 };

// CẤU HÌNH TRỤC Y CỐ ĐỊNH THEO THIẾT KẾ
const FIXED_Y_TICKS = [0, 8, 16, 24, 32, 40];
const Y_DOMAIN_MAX = 40;

// --- COLORS ---
const CHART_COLORS = {
    activeFill: colors.orange[300],
    activeStroke: colors.orange[500],
    grid: colors.gray[100],
    text: colors.textSecondary,
    indicator: colors.orange[700],
    white: colors.white,
    border: colors.border,
    black: colors.black,
};

import { Loading } from '@/shared/components/ui/Loading';
import chartStyles from '@/features/reports/styles/chart.styles';

interface ActivePondChartProps {
    zoneId: string;
}

export const ActivePondChart = ({ zoneId }: ActivePondChartProps) => {
    const [expanded, setExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const onLayout = (event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    };

    const { data: response, isLoading: isApiLoading } = usePondStatusDistribution({ zoneId });

    const handleToggle = () => {
        const nextExpanded = !expanded;
        setExpanded(nextExpanded);
        if (nextExpanded) {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        }
    };

    // --- 1. XỬ LÝ DỮ LIỆU ---
    const processedData = useMemo(() => {
        if (!response?.data?.byDate) return [];
        return response.data.byDate.map(item => ({
            date: new Date(item.date),
            active: item.framingCount,
            prep: item.availableCount,
            functional: item.functionalCount,
            total: item.framingCount + item.availableCount + item.functionalCount,
        }));
    }, [response]);

    // --- 2. TỰ ĐỘNG CUỘN ---
    useEffect(() => {
        if (expanded && containerWidth > 0 && !isLoading) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [expanded, containerWidth, isLoading]);

    // --- 3. TÍNH TOÁN D3 ---
    const { yTicks, xTicks, yScale, chartContentWidth } = useMemo(() => {
        if (containerWidth === 0 || processedData.length === 0) {
            return {
                yTicks: [],
                xTicks: [],
                yScale: null,
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
        const yScale = scaleLinear().domain([0, Y_DOMAIN_MAX]).range([chartHeight, 0]);

        const yTicks = FIXED_Y_TICKS;
        const xTicks = processedData.map((d, index) => ({
            date: d.date,
            x: index * ITEM_WIDTH + ITEM_WIDTH / 2 + 1,
        }));

        return {
            yTicks,
            xTicks,
            yScale,
            chartContentWidth,
        };
    }, [containerWidth, processedData]);

    const formatDate = (date: Date) => {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${d}/${m}`;
    };

    const kpis = response?.data?.kpis;
    const currentActiveTotal = kpis?.activePonds || 0;
    const currentPrepTotal = kpis?.availablePonds || 0;
    const currentFunctionalTotal = kpis?.functionalPonds || 0;
    const totalPonds = kpis?.totalPonds || 0;

    const pondIndexData = useMemo(
        () => [
            {
                id: '1',
                name: 'Đang hoạt động',
                value: `${currentActiveTotal} ao`,
                color: colors.orange[500],
            },
            {
                id: '2',
                name: 'Đang chuẩn bị',
                value: `${currentPrepTotal} ao`,
                color: colors.green[500],
            },
            {
                id: '3',
                name: 'Ao chức năng',
                value: `${currentFunctionalTotal} ao`,
                color: colors.yellow[600],
            },
        ],
        [currentActiveTotal, currentPrepTotal, currentFunctionalTotal]
    );

    return (
        <View style={chartStyles.container} onLayout={onLayout}>
            <TouchableOpacity
                style={styles.headerButton}
                onPress={handleToggle}
                activeOpacity={0.7}
            >
                <View style={styles.headerTitleRow}>
                    <ActivePondChartIcon width={16} height={16} color={colors.text} />
                    <Text style={styles.headerTitleText}>Tổng số ao hoạt động</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{totalPonds}</Text>
                    </View>
                </View>
                <View style={[styles.expandedIcon, expanded && styles.expandedIconRotate]}>
                    <ExpandedIcon width={10} height={6} />
                </View>
            </TouchableOpacity>

            {expanded && (
                <>
                    {isLoading || isApiLoading ? (
                        <View style={styles.loadingContainer}>
                            <Loading />
                        </View>
                    ) : (
                        containerWidth > 0 &&
                        yScale && (
                            <View
                                style={[
                                    styles.contentContainer,
                                    isLoading ? styles.loadingContainer : undefined,
                                ]}
                            >
                                {/* --- VÙNG THỐNG KÊ POND INDEX --- */}
                                <View style={styles.pondIndexWrapper}>
                                    <PondIndex data={pondIndexData} isEqualWidth={true} />
                                </View>

                                <Text style={styles.yAxisUnitLabel}>Số ao</Text>

                                <View style={styles.mainWrapper}>
                                    {/* --- CỘT TRÁI: TRỤC Y (CỐ ĐỊNH) --- */}
                                    <View
                                        style={{
                                            width: Y_AXIS_WIDTH,
                                            backgroundColor: colors.white,
                                            zIndex: 2,
                                            // marginTop: 10,
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
                                                    stroke={colors.white}
                                                    strokeWidth={0}
                                                />
                                            </G>
                                        </Svg>
                                    </View>

                                    {/* --- CỘT PHẢI: BIỂU ĐỒ CUỘN --- */}
                                    <View style={{ flex: 1 }}>
                                        <ScrollView
                                            ref={scrollViewRef}
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            bounces={false}
                                            contentContainerStyle={{ width: chartContentWidth }}
                                        >
                                            <Svg width={chartContentWidth} height={CHART_HEIGHT}>
                                                <Defs>
                                                    <LinearGradient
                                                        id="barGradient"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <Stop
                                                            offset="0"
                                                            stopColor={CHART_COLORS.activeFill}
                                                            stopOpacity="1"
                                                        />
                                                        <Stop
                                                            offset="1"
                                                            stopColor={CHART_COLORS.activeFill}
                                                            stopOpacity="0.2"
                                                        />
                                                    </LinearGradient>
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

                                                    {processedData.map((d, index) => {
                                                        const x = index * ITEM_WIDTH;
                                                        const width = ITEM_WIDTH;
                                                        const y = yScale(d.active);
                                                        const height = yScale(0) - y;
                                                        return (
                                                            <G key={index}>
                                                                <Rect
                                                                    x={x}
                                                                    y={y}
                                                                    width={width}
                                                                    height={height}
                                                                    fill="url(#barGradient)"
                                                                />
                                                                <Line
                                                                    x1={x}
                                                                    y1={y}
                                                                    x2={x + width}
                                                                    y2={y}
                                                                    stroke={
                                                                        CHART_COLORS.activeStroke
                                                                    }
                                                                    strokeWidth={2}
                                                                />
                                                            </G>
                                                        );
                                                    })}

                                                    <Line
                                                        x1={0}
                                                        y1={yScale(0)}
                                                        x2={chartContentWidth}
                                                        y2={yScale(0)}
                                                        stroke={colors.gray[200]}
                                                        strokeWidth={1}
                                                    />

                                                    {xTicks.map((tick, index) => (
                                                        <G key={index}>
                                                            <Line
                                                                x1={tick.x}
                                                                y1={yScale(0)}
                                                                x2={tick.x}
                                                                y2={yScale(0) + 5}
                                                                stroke={colors.gray[300]}
                                                                strokeWidth={1}
                                                            />
                                                            <SvgText
                                                                x={tick.x}
                                                                y={yScale(0) + 18}
                                                                fontSize="10"
                                                                fill={CHART_COLORS.text}
                                                                textAnchor="middle"
                                                            >
                                                                {formatDate(tick.date)}
                                                            </SvgText>
                                                        </G>
                                                    ))}
                                                </G>
                                            </Svg>
                                        </ScrollView>
                                    </View>
                                </View>
                            </View>
                        )
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerButton: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitleText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    badge: {
        backgroundColor: colors.gray[900],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    expandedIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedIconRotate: {
        transform: [{ rotate: '180deg' }],
    },

    contentContainer: { paddingBottom: 16 },

    mainWrapper: {
        flexDirection: 'row',
        backgroundColor: colors.white,
    },
    pondIndexWrapper: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
    },
    yAxisUnitLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        paddingLeft: 16,
        marginBottom: 8,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
