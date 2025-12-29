import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Path, Rect, G, Text as SvgText, Polygon } from 'react-native-svg';
import { colors, spacing } from '@/styles';
import {
    CHART_WIDTH,
    CHART_HEIGHT,
    PADDING_LEFT,
    PADDING_TOP,
    RAW_DATA,
    FeedProdDataPoint,
} from './feedprodData';

interface ChartProps {
    chartWidth: number;
    chartHeight: number;
}

export const Chart: React.FC<ChartProps> = ({ chartWidth, chartHeight }) => {
    // ============================================================================
    // DATA PROCESSING (Computed from RAW_DATA)
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
         * Start date: parsed from first item in RAW_DATA
         */
        const START_DATE = parseDateString(RAW_DATA[0].date);

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
         * Feed-Production data array with day index
         */
        const FEED_PROD_DATA: (FeedProdDataPoint & { day: number })[] = RAW_DATA.map(item => ({
            ...item,
            day: parseDateToDay(item.date),
        }));

        /**
         * Generate forecast data based on historical trend
         */
        const generateForecastData = (
            historicalData: { day: number; value: number }[],
            startDay: number,
            forecastDays: number
        ): { day: number; value: number }[] => {
            if (historicalData.length < 2 || forecastDays <= 0) return [];

            const forecast: { day: number; value: number }[] = [];

            // Calculate average growth rate from last 7 days (or available days)
            const lookbackDays = Math.min(7, historicalData.length);
            const recentData = historicalData.slice(-lookbackDays);

            // Calculate average daily change
            let totalChange = 0;
            for (let i = 1; i < recentData.length; i++) {
                totalChange += recentData[i].value - recentData[i - 1].value;
            }
            const avgDailyChange = totalChange / (recentData.length - 1);

            // Start from last historical value
            const lastHistorical = historicalData[historicalData.length - 1];
            let currentValue = lastHistorical.value;

            // Generate forecast with conservative growth (70% of average growth)
            const forecastGrowthRate = avgDailyChange * 0.7;

            for (let i = 1; i <= forecastDays; i++) {
                const day = startDay + i;
                currentValue = currentValue + forecastGrowthRate;
                forecast.push({ day, value: Math.round(currentValue * 100) / 100 });
            }

            return forecast;
        };

        /**
         * Total days: calculated from last item's day index (historical data only)
         */
        const HISTORICAL_DAYS =
            FEED_PROD_DATA.length > 0 ? FEED_PROD_DATA[FEED_PROD_DATA.length - 1].day : 0;

        /**
         * Forecast days: 20% of historical days, rounded up
         */
        const FORECAST_DAYS = Math.ceil(HISTORICAL_DAYS * 0.2);

        /**
         * Divider position: separates historical and forecast data
         */
        const DIVIDER_DAY = HISTORICAL_DAYS;

        /**
         * Total days: historical + forecast days
         */
        const TOTAL_DAYS = HISTORICAL_DAYS + FORECAST_DAYS;

        /**
         * Generate day marks: every ~5 days for better visualization
         */
        const generateDayMarks = (totalDays: number): number[] => {
            if (totalDays <= 0) return [0];

            const marks: number[] = [];
            const targetMarks = 13;
            const step = Math.max(1, Math.ceil(totalDays / (targetMarks - 1)));

            for (let day = 0; day < totalDays; day += step) {
                marks.push(day);
            }

            if (marks[marks.length - 1] !== totalDays) {
                marks.push(totalDays);
            }

            return marks;
        };

        /**
         * Get date string for day index (DD/MM/YYYY format)
         */
        const getDateForDay = (day: number): string => {
            const date = new Date(START_DATE);
            date.setDate(date.getDate() + day);

            const dayStr = String(date.getDate()).padStart(2, '0');
            const monthStr = String(date.getMonth() + 1).padStart(2, '0');
            const yearStr = String(date.getFullYear());

            return `${dayStr}/${monthStr}/${yearStr}`;
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
         * Orange line data (Đã ăn - Production field contains "Đã ăn" data) - historical
         */
        const ORANGE_DATA_HISTORICAL = FEED_PROD_DATA.filter(item => item.day <= DIVIDER_DAY).map(
            item => ({
                day: item.day,
                value: item.production, // Production field actually contains "Đã ăn" data
            })
        );

        /**
         * Orange line data (Đã ăn) - forecast: 20% of historical days
         */
        const ORANGE_DATA_FORECAST = generateForecastData(
            ORANGE_DATA_HISTORICAL,
            DIVIDER_DAY,
            FORECAST_DAYS
        );

        /**
         * Blue line data (Sản lượng - Consumed field contains "Sản lượng" data) - historical
         */
        const BLUE_DATA_HISTORICAL = FEED_PROD_DATA.filter(item => item.day <= DIVIDER_DAY).map(
            item => ({
                day: item.day,
                value: item.consumed, // Consumed field actually contains "Sản lượng" data
            })
        );

        /**
         * Blue line data (Sản lượng) - forecast: 20% of historical days
         */
        const BLUE_DATA_FORECAST = generateForecastData(
            BLUE_DATA_HISTORICAL,
            DIVIDER_DAY,
            FORECAST_DAYS
        );

        /**
         * Calculate Y-axis maximum based on data range
         */
        const calculateYMax = (): number => {
            const orangeMax = Math.max(
                ...ORANGE_DATA_HISTORICAL.map(p => p.value),
                ...(ORANGE_DATA_FORECAST.length > 0 ? ORANGE_DATA_FORECAST.map(p => p.value) : [0])
            );

            const blueMax = Math.max(
                ...BLUE_DATA_HISTORICAL.map(p => p.value),
                ...(BLUE_DATA_FORECAST.length > 0 ? BLUE_DATA_FORECAST.map(p => p.value) : [0])
            );

            const maxValue = Math.max(orangeMax, blueMax);

            if (!maxValue) return 80;

            const valuePerPart = maxValue / 4;

            let roundedPerPart;
            if (valuePerPart < 100) {
                roundedPerPart = Math.ceil(valuePerPart / 10) * 10;
            } else {
                roundedPerPart = Math.ceil(valuePerPart / 100) * 100;
            }

            return roundedPerPart * 4;
        };

        const Y_MAX_CHART1 = calculateYMax();

        /**
         * Calculate Y-axis labels (divide max into 4 equal parts)
         */
        const getYAxisLabels = (): number[] => {
            const labels: number[] = [];
            for (let i = 0; i <= 4; i++) {
                labels.push((Y_MAX_CHART1 / 4) * i);
            }
            return labels;
        };

        return {
            TOTAL_DAYS,
            DIVIDER_DAY,
            DAY_MARKS,
            DAY_LABELS,
            ORANGE_DATA_HISTORICAL,
            ORANGE_DATA_FORECAST,
            BLUE_DATA_HISTORICAL,
            BLUE_DATA_FORECAST,
            Y_MAX_CHART1,
            getYAxisLabels,
        };
    }, []);

    // ============================================================================
    // CHART RENDERING
    // ============================================================================

    const {
        TOTAL_DAYS,
        DIVIDER_DAY,
        DAY_MARKS,
        DAY_LABELS,
        ORANGE_DATA_HISTORICAL,
        ORANGE_DATA_FORECAST,
        BLUE_DATA_HISTORICAL,
        BLUE_DATA_FORECAST,
        Y_MAX_CHART1,
        getYAxisLabels,
    } = processedData;

    // Helper functions
    const getX = (day: number) => (day / TOTAL_DAYS) * chartWidth + PADDING_LEFT;
    const getY = (value: number) =>
        chartHeight - (value / Y_MAX_CHART1) * chartHeight + PADDING_TOP;

    // Helper function to create smooth bezier curve path from data array
    const createSmoothPath = (data: { day: number; value: number }[]): string => {
        if (data.length < 2) return '';

        const firstX = getX(data[0].day);
        const firstY = getY(data[0].value);
        let path = `M ${firstX} ${firstY}`;

        for (let i = 0; i < data.length - 1; i++) {
            const p0 = i > 0 ? data[i - 1] : data[i];
            const p1 = data[i];
            const p2 = data[i + 1];
            const p3 = i < data.length - 2 ? data[i + 2] : data[i + 1];

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

    // Create blue line path for historical data (up to divider)
    const createBluePathHistorical = () => {
        return createSmoothPath(BLUE_DATA_HISTORICAL);
    };

    // Create gray line path for forecast data (after divider)
    const createBluePathForecast = () => {
        const lastHistorical = BLUE_DATA_HISTORICAL[BLUE_DATA_HISTORICAL.length - 1];
        const forecastData = [lastHistorical, ...BLUE_DATA_FORECAST];
        return createSmoothPath(forecastData);
    };

    const dividerX = getX(DIVIDER_DAY);

    // Calculate Y position for X-axis: at middle of range 30-40
    const axisX_Value = (7 * Y_MAX_CHART1) / 8;
    const axisX_Y = getY(axisX_Value);

    return (
        <View style={styles.container}>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                {/* Grid lines (horizontal, light gray) */}
                {getYAxisLabels().map(value => {
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

                {/* Red divider axis X (horizontal X-axis) - split into 2 parts */}
                <Line
                    x1={PADDING_LEFT}
                    y1={axisX_Y}
                    x2={dividerX}
                    y2={axisX_Y}
                    stroke={colors.error}
                    strokeWidth={2}
                />
                <Line
                    x1={dividerX}
                    y1={axisX_Y}
                    x2={PADDING_LEFT + chartWidth}
                    y2={axisX_Y}
                    stroke={colors.textSecondary}
                    strokeWidth={2}
                />

                {/* Left arrow */}
                <Polygon
                    points={`${PADDING_LEFT},${axisX_Y} ${PADDING_LEFT + 8},${axisX_Y - 4} ${
                        PADDING_LEFT + 8
                    },${axisX_Y + 4}`}
                    fill="#FF0000"
                />

                {/* Right arrow */}
                <Polygon
                    points={`${PADDING_LEFT + chartWidth},${axisX_Y} ${
                        PADDING_LEFT + chartWidth - 8
                    },${axisX_Y - 4} ${PADDING_LEFT + chartWidth - 8},${axisX_Y + 4}`}
                    fill={colors.textSecondary}
                />

                {/* Labels for divider */}
                <G>
                    <SvgText
                        x={PADDING_LEFT + 15}
                        y={axisX_Y - 8}
                        fill="#FF0000"
                        fontSize={10}
                        textAnchor="start"
                        fontWeight="400"
                    >
                        Dữ liệu từ đầu vụ tới hiện tại
                    </SvgText>
                    <SvgText
                        x={PADDING_LEFT + chartWidth - 15}
                        y={axisX_Y - 8}
                        fill="#FF0000"
                        fontSize={10}
                        textAnchor="end"
                        fontWeight="400"
                    >
                        Dữ liệu dự báo ngày tiếp theo
                    </SvgText>
                </G>

                {/* Red vertical line at divider position */}
                <Line
                    x1={dividerX}
                    y1={PADDING_TOP}
                    x2={dividerX}
                    y2={PADDING_TOP + chartHeight}
                    stroke={colors.error}
                    strokeWidth={2}
                    strokeLinecap="round"
                />

                {/* Blue line (historical) - smooth bezier curve */}
                <Path
                    d={createBluePathHistorical()}
                    fill="none"
                    stroke="#003EB3"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Gray line (forecast, after divider) - smooth bezier curve */}
                <Path
                    d={createBluePathForecast()}
                    fill="none"
                    stroke={colors.gray[400]}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Orange line (historical) - drawn as stacked rectangles (step chart) */}
                {ORANGE_DATA_HISTORICAL.map((point, index) => {
                    if (index === 0) return null;

                    const prevPoint = ORANGE_DATA_HISTORICAL[index - 1];
                    const x1 = getX(prevPoint.day);
                    const x2 = getX(point.day);
                    const y1 = getY(prevPoint.value);
                    const y2 = getY(point.value);

                    return (
                        <G key={`orange-step-${point.day}`}>
                            <Rect x={x1} y={y1 - 2} width={x2 - x1} height={4} fill="#FA541C" />
                            {y2 !== y1 && (
                                <Rect
                                    x={x2 - 2}
                                    y={Math.min(y1, y2)}
                                    width={4}
                                    height={Math.abs(y2 - y1)}
                                    fill="#FA541C"
                                />
                            )}
                        </G>
                    );
                })}

                {/* Orange line (forecast, after divider) - drawn as stacked rectangles with gray color */}
                {ORANGE_DATA_FORECAST.map((point, index) => {
                    const prevPoint =
                        index === 0
                            ? ORANGE_DATA_HISTORICAL[ORANGE_DATA_HISTORICAL.length - 1]
                            : ORANGE_DATA_FORECAST[index - 1];

                    const x1 = getX(prevPoint.day);
                    const x2 = getX(point.day);
                    const y1 = getY(prevPoint.value);
                    const y2 = getY(point.value);

                    return (
                        <G key={`orange-forecast-step-${point.day}`}>
                            <Rect
                                x={x1}
                                y={y1 - 2}
                                width={x2 - x1}
                                height={4}
                                fill={colors.gray[400]}
                            />
                            {y2 !== y1 && (
                                <Rect
                                    x={x2 - 2}
                                    y={Math.min(y1, y2)}
                                    width={4}
                                    height={Math.abs(y2 - y1)}
                                    fill={colors.gray[400]}
                                />
                            )}
                        </G>
                    );
                })}

                {/* X-axis labels */}
                {DAY_MARKS.map((day, index) => {
                    const x = getX(day);
                    const y = PADDING_TOP + chartHeight + 20;
                    return (
                        <SvgText
                            key={`x-label-${day}`}
                            x={x}
                            y={y}
                            fill={colors.textSecondary}
                            fontSize={10}
                            textAnchor="middle"
                            transform={`rotate(-15 ${x} ${y})`}
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
                            fill={colors.textSecondary}
                            fontSize={10}
                            textAnchor="end"
                        >
                            {Math.round(value * 100) / 100}
                        </SvgText>
                    );
                })}

                {/* Y-axis title */}
                <SvgText
                    x={12}
                    y={PADDING_TOP + chartHeight / 2}
                    fill={colors.text}
                    fontSize={14}
                    fontWeight="400"
                    textAnchor="middle"
                    transform={`rotate(-90 12 ${PADDING_TOP + chartHeight / 2})`}
                >
                    Khối lượng (Tấn)
                </SvgText>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
    },
});
