import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import { colors, spacing } from '@/styles';
import {
    PADDING_LEFT,
    PADDING_TOP,
    ProfitLineDataPoint,
} from '@/features/reports/components/profit-chart/chartData';
import { ProfitStatsByDate } from '@/features/reports/types/profit-stats';

interface ChartProps {
    chartWidth: number;
    chartHeight: number;
    data: ProfitStatsByDate[];
}

export const Chart: React.FC<ChartProps> = ({ chartWidth, chartHeight, data }) => {
    // ============================================================================
    // DATA PROCESSING (Computed from RAW_PROFIT_DATA)
    // ============================================================================

    const processedData = useMemo(() => {
        /**
         * Parse date string (YYYY-MM-DD) to Date object
         */
        const parseDateString = (dateStr: string): Date => {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            }
            return new Date(dateStr);
        };

        /**
         * Start date: parsed from first item in RAW_PROFIT_DATA
         */
        const START_DATE = data.length > 0 ? parseDateString(data[0].date) : new Date();

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
        const TOTAL_DAYS = data.length > 0 ? parseDateToDay(data[data.length - 1].date) : 0;

        /**
         * Divider position: separates historical and forecast data
         * Default to TOTAL_DAYS (all data is historical)
         */
        const DIVIDER_DAY = TOTAL_DAYS;

        /**
         * Generate day marks: fixed 7-day intervals + always show last day
         */
        const generateDayMarks = (totalDays: number): number[] => {
            if (totalDays <= 0) return [0];

            const marks: number[] = [];
            const step = 7; // Fixed 7-day intervals

            for (let day = 0; day <= totalDays; day += step) {
                marks.push(day);
            }

            // Always show the last data day
            if (marks[marks.length - 1] !== totalDays) {
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

        const PROFIT_LINE_DATA: ProfitLineDataPoint[] = data.map(item => ({
            day: parseDateToDay(item.date),
            value: item.cumulativeEstimatedProfit,
        }));

        /**
         * Calculate Y-axis maximum based on data range
         * Y-axis should accommodate both negative (cost) and positive (harvest, profit) values
         * The result must be divisible by 3
         */
        const calculateYMax = (): number => {
            // Max absolute profit value
            const maxLineValue = Math.max(...PROFIT_LINE_DATA.map(p => Math.abs(p.value)), 1);

            // Round up to nearest number divisible by 3 for nicer ticks
            let rounded = Math.ceil(maxLineValue);
            if (rounded % 3 !== 0) {
                rounded = Math.ceil(rounded / 3) * 3;
            }

            return rounded;
        };

        const Y_MAX = calculateYMax();

        /**
         * Get Y-axis grid lines from -Y_MAX đến +Y_MAX (bước = Y_MAX / 3)
         */
        const getYAxisGridLines = (): number[] => {
            const lines: number[] = [];
            const step = Y_MAX / 3;
            for (let v = -Y_MAX; v <= Y_MAX + 0.001; v += step) {
                lines.push(v);
            }
            return lines;
        };

        /**
         * Get Y-axis labels (bao gồm cả -Y_MAX và +Y_MAX)
         */
        const getYAxisLabels = (): number[] => {
            const labels: number[] = [];
            const step = Y_MAX / 3;
            for (let v = -Y_MAX; v <= Y_MAX + 0.001; v += step) {
                labels.push(v);
            }
            return labels;
        };

        return {
            TOTAL_DAYS,
            DIVIDER_DAY,
            DAY_MARKS,
            DAY_LABELS,
            PROFIT_LINE_DATA,
            Y_MAX,
            getYAxisGridLines,
            getYAxisLabels,
        };
    }, [data]);

    // ============================================================================
    // CHART RENDERING
    // ============================================================================

    const {
        TOTAL_DAYS,
        DAY_MARKS,
        DAY_LABELS,
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

    // Zero line (profit = 0) Y position
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

    // Dynamic height: full range from -Y_MAX đến +Y_MAX
    const bottomY = getY(-Y_MAX);
    // PADDING_BOTTOM (40) is sufficient for labels and ticks
    const dynamicHeight = bottomY + 40;

    return (
        <View style={styles.chartContainer}>
            <View style={{ flexDirection: 'row', height: dynamicHeight }}>
                {/* Fixed Y-axis labels */}
                <Svg width={PADDING_LEFT} height={dynamicHeight}>
                    {getYAxisLabels().map(value => {
                        const y = getY(value);
                        return (
                            <SvgText
                                key={`y-label-${value}`}
                                x={PADDING_LEFT - 4}
                                y={y + 4}
                                fill={colors.text}
                                fontSize={10}
                                textAnchor="end"
                            >
                                {value.toFixed(0)}
                            </SvgText>
                        );
                    })}
                </Svg>

                {/* Scrollable chart content */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 10 }}
                >
                    <Svg width={chartWidth + PADDING_LEFT + 40} height={dynamicHeight}>
                        {/* Grid lines (horizontal) */}
                        {getYAxisGridLines().map(value => {
                            const y = getY(value);
                            return (
                                <Line
                                    key={`grid-${value}`}
                                    x1={0}
                                    y1={y}
                                    x2={chartWidth + PADDING_LEFT + 40}
                                    y2={y}
                                    stroke={colors.gray[200]}
                                    strokeWidth={1}
                                />
                            );
                        })}

                        {/* Break-even line (Điểm hòa vốn) - dashed red at 0 */}
                        <Line
                            x1={0}
                            y1={zeroLineY}
                            x2={chartWidth + PADDING_LEFT + 40}
                            y2={zeroLineY}
                            stroke={colors.red[500]}
                            strokeWidth={1}
                            strokeDasharray="6 4"
                        />

                        {/* Profit line (smooth bezier curve) */}
                        <Path
                            d={createProfitLinePath()}
                            fill="none"
                            stroke={colors.orange[900]}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* X-axis tick marks (vertical lines below axis) */}
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
                                    fill={colors.text}
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

            {/* Y-axis overlay to hide scrolled content */}
            <View
                style={{
                    position: 'absolute',
                    left: spacing.md,
                    top: 0,
                    width: PADDING_LEFT + 10,
                    height: dynamicHeight,
                    backgroundColor: colors.white,
                    zIndex: 10,
                }}
                pointerEvents="none"
            >
                <Svg width={PADDING_LEFT + 10} height={dynamicHeight}>
                    {getYAxisLabels().map(value => {
                        const y = getY(value);
                        return (
                            <SvgText
                                key={`y-overlay-${value}`}
                                x={PADDING_LEFT - 4}
                                y={y + 4}
                                fill={colors.text}
                                fontSize={10}
                                textAnchor="end"
                            >
                                {value.toFixed(0)}
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
        paddingHorizontal: spacing.md,
        position: 'relative',
    },
});
