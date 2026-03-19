import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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

export const Chart: React.FC<ChartProps> = ({ chartWidth, chartHeight, data }) => {
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

        // --- Day marks for X-axis (7-day intervals + last) ---
        const generateDayMarks = (totalDays: number): number[] => {
            if (totalDays <= 0) return [0];
            const marks: number[] = [];
            const step = 7;
            for (let day = 0; day <= totalDays; day += step) {
                marks.push(day);
            }
            if (marks[marks.length - 1] !== totalDays) {
                marks.push(totalDays);
            }
            return marks;
        };

        const getDateForDay = (day: number): string => {
            const date = new Date(START_DATE);
            date.setDate(date.getDate() + day);
            const dayStr = String(date.getDate()).padStart(2, '0');
            const monthStr = String(date.getMonth() + 1).padStart(2, '0');
            return `${dayStr}/${monthStr}`;
        };

        const DAY_MARKS = generateDayMarks(TOTAL_DAYS);
        const DAY_LABELS = DAY_MARKS.map(day => getDateForDay(day));

        // --- Per-date bar + line data ---
        const barData = data.map(item => ({
            day: parseDateToDay(item.date),
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

    const MIN_DAY_WIDTH = 12;
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
    const barWidth = Math.max(2, Math.min(8, actualChartWidth / (barData.length * 2)));

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

    return (
        <View style={styles.chartContainer}>
            <View style={{ position: 'relative', height: dynamicHeight }}>
                {/* Scrollable chart */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: SCROLL_PADDING }}
                >
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
                                    key={`x-label-${day}`}
                                    x={x}
                                    y={y}
                                    fill={colors.textSecondary}
                                    fontSize={12}
                                    textAnchor="middle"
                                >
                                    {DAY_LABELS[index]}
                                </SvgText>
                            );
                        })}
                    </Svg>
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
});
