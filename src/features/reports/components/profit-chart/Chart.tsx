import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Svg, { Line, Rect, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '@/styles';
import { PADDING_LEFT, PADDING_TOP } from '@/features/reports/components/profit-chart/chartData';
import { ProfitStatsByDate } from '@/features/reports/types/profit-stats';

// ---------- constants ----------
const BAR_COLORS = {
    harvested: '#B7EB8F', // dark blue — Đã thu hoạch
    unharvested: '#D9F7BE', // light green — Chưa thu hoạch
    cost: '#FFD9CC', // light peach — Chi phí
};
const PROFIT_LINE_COLOR = '#002A66'; // dark blue — Lợi nhuận ước tính

interface ChartProps {
    chartWidth: number;
    chartHeight: number;
    data: ProfitStatsByDate[];
}

// Format Y-axis values (already divided by 1e9 — show number only)
const formatAxisValue = (value: number) => {
    if (value === 0) return '0';
    const billionVal = Math.round(value / 1e9);
    return billionVal.toString();
};

const formatTooltipValue = (value: number) => {
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return sign + formatted + ' đ';
};

export const Chart: React.FC<ChartProps> = ({ chartWidth, chartHeight, data }) => {
    const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);

    const handleBarPress = useCallback((index: number) => {
        setSelectedBarIndex(prev => (prev === index ? null : index));
    }, []);

    // ====================================================================
    // DATA PROCESSING
    // ====================================================================
    const processedData = useMemo(() => {
        const parseDateString = (dateStr: string): Date => {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            }
            return new Date(dateStr);
        };

        const START_DATE = data.length > 0 ? parseDateString(data[0].date) : new Date();

        const parseDateToDay = (dateStr: string): number => {
            const date = parseDateString(dateStr);
            const diffTime = date.getTime() - START_DATE.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return Math.max(0, diffDays);
        };

        const TOTAL_DAYS = data.length > 0 ? parseDateToDay(data[data.length - 1].date) : 0;

        // --- Day marks for X-axis: show every data point's date ---
        const getDateForDay = (day: number): string => {
            const date = new Date(START_DATE);
            date.setDate(date.getDate() + day);
            const dayStr = String(date.getDate()).padStart(2, '0');
            const monthStr = String(date.getMonth() + 1).padStart(2, '0');
            return `${dayStr}/${monthStr}`;
        };

        const DAY_MARKS = data.map(item => parseDateToDay(item.date));
        const DAY_LABELS = DAY_MARKS.map(day => getDateForDay(day));

        // --- Per-date bar + line data ---
        const barData = data.map(item => ({
            day: parseDateToDay(item.date),
            date: item.date,
            harvested: item.actualRevenueOnDate,
            unharvested: item.estimatedRevenueFromRemainingStockOnDate,
            cost: item.materialCostOnDate,
            profit: item.cumulativeEstimatedProfit,
        }));

        // --- Y-axis range: nice round numbers in tỉ đồng ---
        const allPositive = barData.map(d => d.harvested + d.unharvested);
        const allNegative = barData.map(d => d.cost);
        const allProfit = barData.map(d => Math.abs(d.profit));
        const maxPositive = Math.max(...allPositive, ...allProfit, 1);
        const maxNegative = Math.max(...allNegative, ...allProfit, 1);
        const maxAbsValue = Math.max(maxPositive, maxNegative);

        // Convert to tỉ and find a nice step
        const maxInBillion = maxAbsValue / 1e9;
        const TICK_COUNT = 3; // number of ticks above (and below) zero

        const rawStep = maxInBillion / TICK_COUNT;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
        const niceSteps = [1, 2, 5, 10];
        let stepInBillion = niceSteps[niceSteps.length - 1] * magnitude;
        for (const ns of niceSteps) {
            if (ns * magnitude >= rawStep) {
                stepInBillion = ns * magnitude;
                break;
            }
        }
        stepInBillion = Math.max(1, Math.ceil(stepInBillion)); // always integer step

        const Y_MAX = stepInBillion * TICK_COUNT * 1e9; // back to raw value

        const getYAxisLines = (): number[] => {
            const lines: number[] = [];
            const step = Y_MAX / TICK_COUNT;
            for (let v = -Y_MAX; v <= Y_MAX + 0.001; v += step) {
                lines.push(Math.round(v));
            }
            return lines;
        };

        return { TOTAL_DAYS, DAY_MARKS, DAY_LABELS, barData, Y_MAX, getYAxisLines };
    }, [data]);

    // ====================================================================
    // CHART RENDERING
    // ====================================================================
    const { TOTAL_DAYS, DAY_MARKS, DAY_LABELS, barData, Y_MAX, getYAxisLines } = processedData;

    const MIN_DAY_WIDTH = 40;
    const actualChartWidth = Math.max(chartWidth, TOTAL_DAYS * MIN_DAY_WIDTH);
    const SCROLL_PADDING = 16;

    // Coordinate helpers
    const getX = (day: number) =>
        (day / Math.max(TOTAL_DAYS, 1)) * actualChartWidth + PADDING_LEFT + SCROLL_PADDING;
    const getY = (value: number) => {
        const normalizedValue = (value + Y_MAX) / (Y_MAX * 2);
        return PADDING_TOP + chartHeight - normalizedValue * chartHeight;
    };

    const zeroLineY = getY(0);

    // Bar width — proportional but capped
    const barWidth = Math.max(6, Math.min(16, actualChartWidth / (barData.length * 2)));
    const hitAreaWidth = Math.max(barWidth * 3, 20); // Wider hit area for easier tapping

    // --- Profit line path ---
    const profitLinePath = useMemo(() => {
        if (barData.length < 2) return '';
        let path = '';
        barData.forEach((d, i) => {
            const x = getX(d.day);
            const y = getY(d.profit);
            path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        });
        return path;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [barData, actualChartWidth, chartHeight, Y_MAX]);

    // Dynamic height
    const bottomY = getY(-Y_MAX);
    const dynamicHeight = bottomY + 40;
    const svgWidth = actualChartWidth + PADDING_LEFT + 40;

    // Tooltip position calculation
    const selectedTooltipData = selectedBarIndex !== null ? barData[selectedBarIndex] : null;
    const tooltipX = selectedTooltipData ? getX(selectedTooltipData.day) : 0;

    return (
        <View style={styles.chartContainer}>
            <View style={{ position: 'relative', height: dynamicHeight }}>
                {/* Scrollable chart */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: SCROLL_PADDING }}
                >
                    <View style={{ width: svgWidth, height: dynamicHeight }}>
                        <Svg width={svgWidth} height={dynamicHeight}>
                            {/* Horizontal grid lines */}
                            {getYAxisLines().map(value => {
                                const y = getY(value);
                                return (
                                    <Line
                                        key={`grid-${value}`}
                                        x1={0}
                                        y1={y}
                                        x2={svgWidth}
                                        y2={y}
                                        stroke={colors.gray[200]}
                                        strokeWidth={1}
                                    />
                                );
                            })}

                            {/* ---- Stacked Bars ---- */}
                            {barData.map((d, i) => {
                                const x = getX(d.day) - barWidth / 2;

                                // Positive bars (above zero): harvested + unharvested stacked
                                const harvestedH = Math.abs(getY(0) - getY(d.harvested));
                                const unharvestedH = Math.abs(getY(0) - getY(d.unharvested));

                                // Negative bar (below zero): cost
                                const costH = Math.abs(getY(0) - getY(d.cost));

                                return (
                                    <React.Fragment key={`bar-${i}`}>
                                        {/* Harvested bar (orange) — from zero going up */}
                                        {d.harvested > 0 && (
                                            <Rect
                                                x={x}
                                                y={zeroLineY - harvestedH}
                                                width={barWidth}
                                                height={harvestedH}
                                                fill={BAR_COLORS.harvested}
                                            />
                                        )}
                                        {/* Unharvested bar (green) — stacked on top of harvested */}
                                        {d.unharvested > 0 && (
                                            <Rect
                                                x={x}
                                                y={zeroLineY - harvestedH - unharvestedH}
                                                width={barWidth}
                                                height={unharvestedH}
                                                fill={BAR_COLORS.unharvested}
                                            />
                                        )}
                                        {/* Cost bar (red) — from zero going down */}
                                        {d.cost > 0 && (
                                            <Rect
                                                x={x}
                                                y={zeroLineY}
                                                width={barWidth}
                                                height={costH}
                                                fill={BAR_COLORS.cost}
                                            />
                                        )}
                                        {/* Invisible hit area for tapping */}
                                        <Rect
                                            x={getX(d.day) - hitAreaWidth / 2}
                                            y={PADDING_TOP}
                                            width={hitAreaWidth}
                                            height={chartHeight}
                                            fill="transparent"
                                            onPress={() => handleBarPress(i)}
                                        />
                                    </React.Fragment>
                                );
                            })}

                            {/* ---- Profit line (blue) ---- */}
                            {profitLinePath.length > 0 && (
                                <Path
                                    d={profitLinePath}
                                    fill="none"
                                    stroke={PROFIT_LINE_COLOR}
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}

                            {/* X-axis tick marks */}
                            {DAY_MARKS.map(day => {
                                const x = getX(day);
                                const axisY = getY(-Y_MAX);
                                return (
                                    <Line
                                        key={`x-tick-${day}`}
                                        x1={x}
                                        y1={axisY}
                                        x2={x}
                                        y2={axisY + 8}
                                        stroke="black"
                                        strokeOpacity={0.25}
                                        strokeWidth={0.5}
                                    />
                                );
                            })}

                            {/* X-axis labels */}
                            {DAY_MARKS.map((day, index) => {
                                const x = getX(day);
                                const axisY = getY(-Y_MAX);
                                const y = axisY + 20;
                                return (
                                    <SvgText
                                        key={`x-label-${day}-${index}`}
                                        x={x}
                                        y={y}
                                        fill={colors.textSecondary}
                                        fontSize={10}
                                        textAnchor="middle"
                                    >
                                        {DAY_LABELS[index]}
                                    </SvgText>
                                );
                            })}

                            {/* Selected bar highlight line */}
                            {selectedBarIndex !== null && (
                                <Line
                                    x1={tooltipX}
                                    y1={PADDING_TOP}
                                    x2={tooltipX}
                                    y2={PADDING_TOP + chartHeight}
                                    stroke={colors.gray[400]}
                                    strokeWidth={1}
                                    strokeDasharray="4,3"
                                />
                            )}
                        </Svg>

                        {/* Tooltip overlay (rendered in View layer for better styling) */}
                        {selectedBarIndex !== null &&
                            selectedTooltipData &&
                            (() => {
                                const TOOLTIP_WIDTH = 220;
                                const TOOLTIP_MARGIN = 30;
                                const isOverflowRight =
                                    tooltipX + 8 + TOOLTIP_WIDTH + TOOLTIP_MARGIN > svgWidth;
                                // Check if placing tooltip to the left would be clipped by the Y-axis overlay
                                const isOverflowLeft =
                                    tooltipX - 8 - TOOLTIP_WIDTH < PADDING_LEFT + SCROLL_PADDING;
                                // If overflows right but also overflows left, prefer showing on the right
                                const showOnRight = !isOverflowRight || isOverflowLeft;
                                return (
                                    <View
                                        style={[
                                            styles.barTooltip,
                                            showOnRight
                                                ? { left: tooltipX + 8, top: PADDING_TOP + 4 }
                                                : {
                                                      right: svgWidth - tooltipX + 8,
                                                      top: PADDING_TOP + 4,
                                                  },
                                        ]}
                                    >
                                        <Text style={styles.barTooltipTitle}>
                                            {selectedTooltipData.date}
                                        </Text>
                                        <View style={styles.barTooltipRow}>
                                            <View
                                                style={[
                                                    styles.barTooltipDot,
                                                    { backgroundColor: BAR_COLORS.harvested },
                                                ]}
                                            />
                                            <Text style={styles.barTooltipLabel}>Thu hoạch:</Text>
                                            <Text style={styles.barTooltipValue}>
                                                {formatTooltipValue(selectedTooltipData.harvested)}
                                            </Text>
                                        </View>
                                        <View style={styles.barTooltipRow}>
                                            <View
                                                style={[
                                                    styles.barTooltipDot,
                                                    { backgroundColor: BAR_COLORS.unharvested },
                                                ]}
                                            />
                                            <Text style={styles.barTooltipLabel}>Chưa thu:</Text>
                                            <Text style={styles.barTooltipValue}>
                                                {formatTooltipValue(
                                                    selectedTooltipData.unharvested
                                                )}
                                            </Text>
                                        </View>
                                        <View style={styles.barTooltipRow}>
                                            <View
                                                style={[
                                                    styles.barTooltipDot,
                                                    { backgroundColor: BAR_COLORS.cost },
                                                ]}
                                            />
                                            <Text style={styles.barTooltipLabel}>Chi phí:</Text>
                                            <Text style={styles.barTooltipValue}>
                                                {formatTooltipValue(selectedTooltipData.cost)}
                                            </Text>
                                        </View>
                                        <View style={styles.barTooltipRow}>
                                            <View
                                                style={[
                                                    styles.barTooltipDot,
                                                    { backgroundColor: PROFIT_LINE_COLOR },
                                                ]}
                                            />
                                            <Text style={styles.barTooltipLabel}>Lợi nhuận:</Text>
                                            <Text style={styles.barTooltipValue}>
                                                {formatTooltipValue(selectedTooltipData.profit)}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })()}
                    </View>
                </ScrollView>
            </View>

            {/* Y-axis overlay */}
            <View
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: PADDING_LEFT,
                    height: dynamicHeight,
                    backgroundColor: colors.white,
                    zIndex: 10,
                }}
                pointerEvents="none"
            >
                <Svg width={PADDING_LEFT} height={dynamicHeight} style={{ overflow: 'visible' }}>
                    {getYAxisLines().map(value => {
                        const y = getY(value);
                        return (
                            <SvgText
                                key={`y-overlay-${value}`}
                                x={16}
                                y={y + 4}
                                fill={colors.textSecondary}
                                fontSize={12}
                                textAnchor="start"
                            >
                                {formatAxisValue(value)}
                            </SvgText>
                        );
                    })}
                </Svg>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    chartContainer: {
        backgroundColor: colors.white,
        position: 'relative',
    },
    barTooltip: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 20,
        minWidth: 160,
    },
    barTooltipTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 6,
    },
    barTooltipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    barTooltipDot: {
        width: 8,
        height: 3,
        borderRadius: 1.5,
        marginRight: 6,
    },
    barTooltipLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        marginRight: 4,
    },
    barTooltipValue: {
        fontSize: 11,
        fontWeight: '500',
        color: colors.text,
        flexShrink: 1,
    },
});
