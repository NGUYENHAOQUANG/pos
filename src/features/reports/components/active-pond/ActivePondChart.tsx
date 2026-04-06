import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Loading } from '@/shared/components/ui/Loading';
import { useChartStyles } from '@/features/reports/styles/chart.styles';
import { useAppTheme } from '@/styles/themeContext';
import { View, StyleSheet, LayoutChangeEvent, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Svg, { Line, Text as SvgText, G, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { scaleLinear } from 'd3-scale';
import { colors, type Colors } from '@/styles';
import ActivePondChartIcon from '@/assets/Icon/IconReport/ActivePondChartIcon.svg';
import { BasicDropDownButton } from '../BasicDropDownButton';
import { PondIndex } from '@/features/reports/components/env-chart/PondIndex';
import { usePondStatusDistribution } from '@/features/reports/hooks/usePondStatusDistribution';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';

// --- CẤU HÌNH ---
const ITEM_WIDTH = 40;
const CHART_HEIGHT = 200;
const Y_AXIS_WIDTH = 35;
const VERTICAL_PADDING = { top: 20, bottom: 20 };

// CẤU HÌNH TRỤC Y CỐ ĐỊNH THEO THIẾT KẾ
const FIXED_Y_TICKS = [0, 8, 16, 24, 32, 40];
const Y_DOMAIN_MAX = 40;

// --- COLORS ---
const getChartColors = (theme: Colors) => ({
    grid: theme.borderLight,
    text: theme.textSecondary,
    white: theme.background,
    border: theme.border,
    black: theme.text,
});
/** Filter type for pond categories */
type PondFilterType = 'active' | 'prep' | 'functional';

/** Color config for each filter type */
interface FilterColorConfig {
    fill: string;
    stroke: string;
}

const FILTER_COLORS: Record<PondFilterType, FilterColorConfig> = {
    active: {
        fill: colors.orange[300],
        stroke: colors.orange[500],
    },
    prep: {
        fill: colors.green[300],
        stroke: colors.green[500],
    },
    functional: {
        fill: colors.yellow[300],
        stroke: colors.yellow[600],
    },
};

interface ActivePondChartProps {
    zoneId: string;
}

export const ActivePondChart = ({ zoneId }: ActivePondChartProps) => {
    const chartStyles = useChartStyles();
    const theme = useAppTheme();
    const [expanded, setExpanded] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const [selectedFilter, setSelectedFilter] = useState<PondFilterType>('active');
    const scrollViewRef = useRef<ScrollView>(null);

    const onLayout = (event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    };

    const { data: response, isLoading: isApiLoading } = usePondStatusDistribution({ zoneId });

    const handleToggle = () => setExpanded(prev => !prev);

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

    // Get chart value based on selected filter
    const getChartValue = useMemo(() => {
        return (d: { active: number; prep: number; functional: number }) => {
            switch (selectedFilter) {
                case 'prep':
                    return d.prep;
                case 'functional':
                    return d.functional;
                case 'active':
                default:
                    return d.active;
            }
        };
    }, [selectedFilter]);

    // Current color config based on filter
    const currentColors = FILTER_COLORS[selectedFilter];

    // --- 2. TỰ ĐỘNG CUỘN ---
    useEffect(() => {
        if (expanded && containerWidth > 0 && !isApiLoading) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [expanded, containerWidth, isApiLoading]);

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
    const activeChartColors = getChartColors(theme);

    // Map filter id to PondFilterType
    const handleFilterPress = (id: string) => {
        const filterMap: Record<string, PondFilterType> = {
            '1': 'active',
            '2': 'prep',
            '3': 'functional',
        };
        const newFilter = filterMap[id];
        if (newFilter) {
            // Toggle: if already selected, reset to active (default)
            setSelectedFilter(prev => (prev === newFilter ? 'active' : newFilter));
        }
    };

    // Get selected PondIndex id from filter
    const selectedPondIndexId = useMemo(() => {
        const idMap: Record<PondFilterType, string> = {
            active: '1',
            prep: '2',
            functional: '3',
        };
        return idMap[selectedFilter];
    }, [selectedFilter]);

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
            <BasicDropDownButton
                prefixIcon={<ActivePondChartIcon width={20} height={20} color={theme.text} />}
                label="Tổng số ao hoạt động"
                isExpanded={expanded}
                onPress={handleToggle}
                suffixContent={
                    <View style={[styles.badge, { backgroundColor: theme.text }]}>
                        <Text style={[styles.badgeText, { color: theme.background }]}>
                            {totalPonds}
                        </Text>
                    </View>
                }
            />

            {expanded && (
                <>
                    {isApiLoading ? (
                        <View style={styles.loadingContainer}>
                            <Loading />
                        </View>
                    ) : processedData.length === 0 ? (
                        <EmptyStateCard message="Không có dữ liệu ao hoạt động" />
                    ) : (
                        containerWidth > 0 &&
                        yScale && (
                            <View style={styles.contentContainer}>
                                {/* --- VÙNG THỐNG KÊ POND INDEX --- */}
                                <View style={styles.pondIndexWrapper}>
                                    <PondIndex
                                        data={pondIndexData}
                                        isEqualWidth={true}
                                        selectedId={selectedPondIndexId}
                                        onPress={handleFilterPress}
                                    />
                                </View>

                                <Text
                                    style={[styles.yAxisUnitLabel, { color: theme.textSecondary }]}
                                >
                                    Số ao
                                </Text>

                                <View
                                    style={[
                                        styles.mainWrapper,
                                        { backgroundColor: theme.background },
                                    ]}
                                >
                                    {/* --- CỘT TRÁI: TRỤC Y (CỐ ĐỊNH) --- */}
                                    <View
                                        style={{
                                            width: Y_AXIS_WIDTH,
                                            backgroundColor: theme.background,

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
                                                        fontSize="12"
                                                        fill={activeChartColors.text}
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
                                                    stroke={theme.background}
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
                                                            stopColor={currentColors.fill}
                                                            stopOpacity="1"
                                                        />
                                                        <Stop
                                                            offset="1"
                                                            stopColor={currentColors.fill}
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
                                                            stroke={activeChartColors.grid}
                                                            strokeWidth={1}
                                                        />
                                                    ))}

                                                    {processedData.map((d, index) => {
                                                        const x = index * ITEM_WIDTH;
                                                        const width = ITEM_WIDTH;
                                                        const chartValue = getChartValue(d);
                                                        const y = yScale(chartValue);
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
                                                                    stroke={currentColors.stroke}
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
                                                        stroke={activeChartColors.grid}
                                                        strokeWidth={1}
                                                    />

                                                    {xTicks.map((tick, index) => (
                                                        <G key={index}>
                                                            <Line
                                                                x1={tick.x}
                                                                y1={yScale(0)}
                                                                x2={tick.x}
                                                                y2={yScale(0) + 5}
                                                                stroke={activeChartColors.grid}
                                                                strokeWidth={1}
                                                            />
                                                            <SvgText
                                                                x={tick.x}
                                                                y={yScale(0) + 18}
                                                                fontSize="12"
                                                                fill={activeChartColors.text}
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
    badge: {
        backgroundColor: colors.gray[900], // Sẽ ghi đè inline bằng theme.text
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: colors.white, // Sẽ ghi đè inline bằng theme.background
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        includeFontPadding: false,
    },

    contentContainer: { paddingBottom: 16 },

    mainWrapper: {
        flexDirection: 'row',
    },
    pondIndexWrapper: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
    },
    yAxisUnitLabel: {
        fontSize: 12,

        paddingLeft: 16,
        marginBottom: 8,
    },
    loadingContainer: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
