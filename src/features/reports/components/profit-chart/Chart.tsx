import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Path, Rect, G, Text as SvgText } from 'react-native-svg';
import { colors, spacing } from '@/styles';
import {
    CHART_WIDTH,
    PADDING_LEFT,
    PADDING_TOP,
    RAW_PROFIT_DATA,
    ProfitBarDataPoint,
    ProfitLineDataPoint,
} from '@/features/reports/components/profit-chart/chartData';

interface ChartProps {
    chartWidth: number;
    chartHeight: number;
}

export const Chart: React.FC<ChartProps> = ({ chartWidth, chartHeight }) => {
    // ============================================================================
    // DATA PROCESSING (Computed from RAW_PROFIT_DATA)
    // ============================================================================

    const processedData = useMemo(() => {
        /**
         * Parse date string (MM/DD/YYYY) to Date object
         */
        const parseDateString = (dateStr: string): Date => {
            const [month, day, year] = dateStr.split('/').map(Number);
            return new Date(year, month - 1, day); // month is 1-indexed in input
        };

        /**
         * Start date: parsed from first item in RAW_PROFIT_DATA
         */
        const START_DATE = parseDateString(RAW_PROFIT_DATA[0].date);

        /**
         * Parse date string (MM/DD/YYYY) to day index (0-based)
         */
        const parseDateToDay = (dateStr: string): number => {
            const date = parseDateString(dateStr);
            const diffTime = date.getTime() - START_DATE.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return Math.max(0, diffDays);
        };

        /**
         * Total days: calculated from last item's day index
         */
        const TOTAL_DAYS =
            RAW_PROFIT_DATA.length > 0
                ? parseDateToDay(RAW_PROFIT_DATA[RAW_PROFIT_DATA.length - 1].date)
                : 0;

        /**
         * Divider position: separates historical and forecast data
         * Default to TOTAL_DAYS (all data is historical)
         */
        const DIVIDER_DAY = TOTAL_DAYS;

        /**
         * Generate day marks: every ~15 days for better visualization
         */
        const generateDayMarks = (totalDays: number): number[] => {
            if (totalDays <= 0) return [0];

            const marks: number[] = [];
            const step = Math.max(1, Math.ceil(totalDays / 6)); // ~7 marks total

            for (let day = 0; day < totalDays; day += step) {
                marks.push(day);
            }

            if (totalDays - marks[marks.length - 1] > step / 2) {
                marks.push(totalDays);
            }

            return marks;
        };

        /**
         * Get date string for day index (DD/MM format)
         */
        const getDateForDay = (day: number): string => {
            const date = new Date(START_DATE);
            date.setDate(date.getDate() + day);

            const dayStr = String(date.getDate()).padStart(2, '0');
            const monthStr = String(date.getMonth() + 1).padStart(2, '0');

            return `${dayStr}/${monthStr}`;
        };

        /**
         * Day marks: auto-generated based on TOTAL_DAYS
         */
        const DAY_MARKS = generateDayMarks(TOTAL_DAYS);

        /**
         * Day labels for X-axis
         */
        const DAY_LABELS = DAY_MARKS.map(day => getDateForDay(day));

        /**
         * Transform RAW_PROFIT_DATA to ProfitBarDataPoint
         */
        const PROFIT_BAR_DATA: ProfitBarDataPoint[] = RAW_PROFIT_DATA.map(item => {
            const day = parseDateToDay(item.date);
            // Ensure cost is negative for chart display
            const cost = item.cost < 0 ? item.cost : -item.cost;
            return {
                day,
                date: getDateForDay(day),
                cost,
                harvested: item.harvested,
                notHarvested: item.notHarvested,
                totalValue: cost + item.harvested + item.notHarvested,
            };
        });

        /**
         * Transform RAW_PROFIT_DATA to ProfitLineDataPoint
         */
        const PROFIT_LINE_DATA: ProfitLineDataPoint[] = RAW_PROFIT_DATA.map(item => ({
            day: parseDateToDay(item.date),
            value: item.profit,
        }));

        /**
         * Calculate Y-axis maximum based on data range
         * Y-axis should accommodate both negative (cost) and positive (harvest, profit) values
         * The result must be divisible by 3
         */
        const calculateYMax = (): number => {
            // Find max absolute value from all data
            const maxBarValue = Math.max(
                ...PROFIT_BAR_DATA.map(p => Math.abs(p.cost) + p.harvested + p.notHarvested)
            );
            const maxLineValue = Math.max(...PROFIT_LINE_DATA.map(p => Math.abs(p.value)));

            const maxValue = Math.max(maxBarValue, maxLineValue);

            if (!maxValue) return 9; // Default divisible by 3

            // Round up to nearest number divisible by 3
            let rounded = Math.ceil(maxValue);
            if (rounded % 3 !== 0) {
                rounded = Math.ceil(rounded / 3) * 3;
            }

            return rounded;
        };

        const Y_MAX = calculateYMax();

        /**
         * Get Y-axis grid lines (5 lines: 2 below zero, 3 above zero)
         */
        const getYAxisGridLines = (): number[] => {
            const lines: number[] = [];
            const step = Y_MAX / 3; // 3 steps above zero, 2 steps below zero
            for (let i = 1; i <= 3; i++) {
                lines.push(step * i); // Positive lines
            }
            for (let i = 1; i <= 2; i++) {
                lines.push(-step * i); // Negative lines
            }
            return lines.sort((a, b) => a - b);
        };

        /**
         * Get Y-axis labels (6 labels: 2 negative, 0, 3 positive)
         */
        const getYAxisLabels = (): number[] => {
            const labels: number[] = [];
            const step = Y_MAX / 3;
            labels.push(-step * 2); // -2/3 Y_MAX
            labels.push(-step); // -1/3 Y_MAX
            labels.push(0);
            labels.push(step); // 1/3 Y_MAX
            labels.push(step * 2); // 2/3 Y_MAX
            labels.push(Y_MAX); // Y_MAX
            return labels;
        };

        return {
            TOTAL_DAYS,
            DIVIDER_DAY,
            DAY_MARKS,
            DAY_LABELS,
            PROFIT_BAR_DATA,
            PROFIT_LINE_DATA,
            Y_MAX,
            getYAxisGridLines,
            getYAxisLabels,
        };
    }, []);

    // ============================================================================
    // CHART RENDERING
    // ============================================================================

    const {
        TOTAL_DAYS,
        DAY_MARKS,
        DAY_LABELS,
        PROFIT_BAR_DATA,
        PROFIT_LINE_DATA,
        Y_MAX,
        getYAxisGridLines,
        getYAxisLabels,
    } = processedData;

    // Helper functions
    const getX = (day: number) => (day / TOTAL_DAYS) * chartWidth + PADDING_LEFT;
    const getY = (value: number) => {
        // Y-axis is centered at zero
        // value = -Y_MAX maps to bottom (PADDING_TOP + chartHeight)
        // value = Y_MAX maps to top (PADDING_TOP)
        const normalizedValue = (value + Y_MAX) / (Y_MAX * 2); // 0 to 1
        return PADDING_TOP + chartHeight - normalizedValue * chartHeight;
    };

    // Zero line Y position
    const zeroLineY = getY(0);

    // Create smooth bezier curve path for profit line
    const createProfitLinePath = () => {
        if (PROFIT_LINE_DATA.length < 2) return '';

        const firstX = getX(PROFIT_LINE_DATA[0].day);
        const firstY = getY(PROFIT_LINE_DATA[0].value);
        let path = `M ${firstX} ${firstY}`;

        for (let i = 0; i < PROFIT_LINE_DATA.length - 1; i++) {
            const p0 = i > 0 ? PROFIT_LINE_DATA[i - 1] : PROFIT_LINE_DATA[i];
            const p1 = PROFIT_LINE_DATA[i];
            const p2 = PROFIT_LINE_DATA[i + 1];
            const p3 =
                i < PROFIT_LINE_DATA.length - 2 ? PROFIT_LINE_DATA[i + 2] : PROFIT_LINE_DATA[i + 1];

            const x0 = getX(p0.day);
            const y0 = getY(p0.value);
            const x1 = getX(p1.day);
            const y1 = getY(p1.value);
            const x2 = getX(p2.day);
            const y2 = getY(p2.value);
            const x3 = getX(p3.day);
            const y3 = getY(p3.value);

            const tension = 0.5;
            const cp1x = x1 + ((x2 - x0) / 6) * tension;
            const cp1y = y1 + ((y2 - y0) / 6) * tension;
            const cp2x = x2 - ((x3 - x1) / 6) * tension;
            const cp2y = y2 - ((y3 - y1) / 6) * tension;

            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
        }

        return path;
    };

    // Calculate bar width (spacing between bars)
    const barWidth = (chartWidth / (TOTAL_DAYS + 1)) * 0.6; // 60% of available space for bars

    // Calculate dynamic height to remove empty space at bottom
    // We cut off the chart at the lowest grid line (-2/3 Y_MAX) plus padding
    const step = Y_MAX / 3;
    const lowestGridValue = -step * 2;
    const bottomY = getY(lowestGridValue);
    // PADDING_BOTTOM (40) is sufficient for labels and ticks
    const dynamicHeight = bottomY + 40;

    return (
        <View style={styles.chartContainer}>
            <Svg width={CHART_WIDTH} height={dynamicHeight}>
                {/* Grid lines (horizontal) - 5 lines: 2 below zero, 3 above zero */}
                {getYAxisGridLines().map(value => {
                    const y = getY(value);
                    return (
                        <Line
                            key={`grid-${value}`}
                            x1={PADDING_LEFT}
                            y1={y}
                            x2={PADDING_LEFT + chartWidth}
                            y2={y}
                            stroke={colors.gray[200]}
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Zero line (horizontal axis) */}
                <Line
                    x1={PADDING_LEFT}
                    y1={zeroLineY}
                    x2={PADDING_LEFT + chartWidth}
                    y2={zeroLineY}
                    stroke={colors.gray[400]}
                    strokeWidth={1}
                />

                {/* Stacked bars */}
                {PROFIT_BAR_DATA.map(point => {
                    const x = getX(point.day);
                    const barX = x - barWidth / 2;

                    // Cost bar (negative, orange, below zero)
                    const costBarHeight = Math.abs(point.cost / (Y_MAX * 2)) * chartHeight;
                    const costBarY = zeroLineY;

                    // Harvested bar (positive, light green, above zero)
                    const harvestedBarHeight = (point.harvested / (Y_MAX * 2)) * chartHeight;
                    const harvestedBarY = zeroLineY - harvestedBarHeight;

                    // Not harvested bar (positive, lighter green, above harvested)
                    const notHarvestedBarHeight = (point.notHarvested / (Y_MAX * 2)) * chartHeight;
                    const notHarvestedBarY = harvestedBarY - notHarvestedBarHeight;

                    return (
                        <G key={`bar-${point.day}`}>
                            {/* Cost bar (orange, below zero) */}
                            {costBarHeight > 0 && (
                                <Rect
                                    x={barX}
                                    y={costBarY}
                                    width={barWidth}
                                    height={costBarHeight}
                                    fill={colors.orange[200]} // Light orange
                                />
                            )}

                            {/* Harvested bar (light green, above zero) */}
                            {harvestedBarHeight > 0 && (
                                <Rect
                                    x={barX}
                                    y={harvestedBarY}
                                    width={barWidth}
                                    height={harvestedBarHeight}
                                    fill={colors.green[300]} // #B7EB8F - Đã thu hoạch
                                />
                            )}

                            {/* Not harvested bar (lighter green, above harvested) */}
                            {notHarvestedBarHeight > 0 && (
                                <Rect
                                    x={barX}
                                    y={notHarvestedBarY}
                                    width={barWidth}
                                    height={notHarvestedBarHeight}
                                    fill={colors.green[100]} // #D9F7BE - Chưa thu hoạch
                                />
                            )}
                        </G>
                    );
                })}

                {/* Profit line (smooth bezier curve) */}
                <Path
                    d={createProfitLinePath()}
                    fill="none"
                    stroke={colors.blue[700]} // Dark blue
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* X-axis tick marks (vertical lines below axis) */}
                {DAY_MARKS.map(day => {
                    const x = getX(day);
                    // Axis Y position should be at the lowest grid line level (-2/3 Y_MAX),
                    // not the mathematical bottom (-Y_MAX) which leaves empty space.
                    const step = Y_MAX / 3;
                    const minGridValue = -step * 2;
                    const axisY = getY(minGridValue);

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
                    const step = Y_MAX / 3;
                    const minGridValue = -step * 2;
                    const axisY = getY(minGridValue);
                    const y = axisY + 20;

                    return (
                        <SvgText
                            key={`x-label-${day}`}
                            x={x}
                            y={y}
                            fill={colors.text}
                            fontSize={10}
                            textAnchor="middle"
                        >
                            {DAY_LABELS[index]}
                        </SvgText>
                    );
                })}

                {/* Y-axis labels */}
                {getYAxisLabels().map(value => {
                    const y = getY(value);
                    return (
                        <SvgText
                            key={`y-label-${value}`}
                            x={PADDING_LEFT - 10}
                            y={y + 4}
                            fill={colors.text}
                            fontSize={10}
                            textAnchor="end"
                        >
                            {value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)}
                        </SvgText>
                    );
                })}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    chartContainer: {
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
    },
});
