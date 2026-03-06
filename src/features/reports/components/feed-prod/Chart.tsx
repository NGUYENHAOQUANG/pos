import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { colors, spacing, typography } from '@/styles';
import { Text } from '@/shared/components/typography/Text';

const CHART_THEME = {
    bg: colors.white,
    grid: colors.gray[200],
    text: colors.text,
    green: '#22c55e',
    orange: '#f97316',
};
import {
    CHART_HEIGHT,
    PADDING_LEFT,
    PADDING_RIGHT,
    PADDING_TOP,
    PADDING_BOTTOM,
    RAW_DATA,
    FeedProdDataPoint,
} from './feedprodData';

interface ChartProps {
    chartWidth: number;
    chartHeight: number;
}

export const Chart: React.FC<ChartProps> = ({ chartWidth, chartHeight }) => {
    const MIN_CHART_WIDTH = 450;
    const actualWidth = Math.max(chartWidth, MIN_CHART_WIDTH);

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
        Y_MAX_CHART1,
        getYAxisLabels,
    } = processedData;

    // Helper functions
    const getX = (day: number) => (day / TOTAL_DAYS) * actualWidth + PADDING_LEFT;
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

    /** Path nối thẳng từ điểm đến điểm (không bezier) — tránh đoạn dự báo cong sang trái rồi bị nét đứt */
    const createLinePath = (data: { day: number; value: number }[]): string => {
        if (data.length < 2) return '';
        let path = `M ${getX(data[0].day)} ${getY(data[0].value)}`;
        for (let i = 1; i < data.length; i++) {
            path += ` L ${getX(data[i].day)} ${getY(data[i].value)}`;
        }
        return path;
    };

    // Create blue line path for historical data (up to divider)
    const createBluePathHistorical = () => {
        return createSmoothPath(BLUE_DATA_HISTORICAL);
    };

    const dividerX = getX(DIVIDER_DAY);

    // Orange line bên trái: nét thẳng (nối thẳng từng điểm), không cong bezier
    const createOrangePathHistorical = () => createLinePath(ORANGE_DATA_HISTORICAL);
    const createOrangePathForecast = () => {
        const lastHistorical = ORANGE_DATA_HISTORICAL[ORANGE_DATA_HISTORICAL.length - 1];
        const forecastData = [lastHistorical, ...ORANGE_DATA_FORECAST];
        return createLinePath(forecastData);
    };

    // X-axis label: DD/MM
    const formatXLabel = (fullDate: string) => {
        const parts = fullDate.split('/');
        if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
        return fullDate;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Khối lượng (Tấn)</Text>
            <View style={{ position: 'relative' }}>
                {/* Sticky Y-Axis Overlay: padding 12 trái, nhãn trục Y + title dọc để không bị khuất */}
                <View
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: CHART_HEIGHT - PADDING_BOTTOM,
                        width: PADDING_LEFT,
                        zIndex: 10,
                        // backgroundColor: CHART_THEME.bg,
                    }}
                    pointerEvents="none"
                >
                    <Svg width={PADDING_LEFT + 12} height={CHART_HEIGHT}>
                        {getYAxisLabels().map(value => {
                            const y = getY(value);
                            return (
                                <SvgText
                                    key={`y-label-sticky-${value}`}
                                    x={PADDING_LEFT + 2}
                                    y={y + 4}
                                    fill={CHART_THEME.text}
                                    fontSize={10}
                                    textAnchor="end"
                                >
                                    {Math.round(value * 100) / 100}
                                </SvgText>
                            );
                        })}
                    </Svg>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Svg
                        width={actualWidth + PADDING_LEFT + PADDING_RIGHT + 40}
                        height={CHART_HEIGHT}
                    >
                        {/* Dark background */}
                        <Rect
                            x={0}
                            y={0}
                            width={actualWidth + PADDING_LEFT + PADDING_RIGHT + 40}
                            height={CHART_HEIGHT}
                            fill={CHART_THEME.bg}
                        />

                        {/* Horizontal grid lines - white */}
                        {getYAxisLabels().map(value => {
                            const y = getY(value);
                            return (
                                <Line
                                    key={`grid-h-${value}`}
                                    x1={PADDING_LEFT}
                                    y1={y}
                                    x2={PADDING_LEFT + actualWidth}
                                    y2={y}
                                    stroke={CHART_THEME.grid}
                                    strokeWidth={1}
                                />
                            );
                        })}

                        {/* Đường ngăn cách: thực tế | dự báo — nét liền */}
                        {ORANGE_DATA_FORECAST.length > 0 && (
                            <Line
                                x1={dividerX}
                                y1={PADDING_TOP}
                                x2={dividerX}
                                y2={PADDING_TOP + chartHeight}
                                stroke={CHART_THEME.grid}
                                strokeWidth={1.5}
                            />
                        )}

                        {/* Green line (Sản lượng) - historical only, solid */}
                        <Path
                            d={createBluePathHistorical()}
                            fill="none"
                            stroke={CHART_THEME.green}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Orange line - forecast (dashed): vẽ trước để nét liền thực tế đè lên bên trái */}
                        {ORANGE_DATA_FORECAST.length > 0 && (
                            <Path
                                d={createOrangePathForecast()}
                                fill="none"
                                stroke={CHART_THEME.orange}
                                strokeWidth={2}
                                strokeDasharray="6,4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* Orange line - historical (solid): vẽ sau để luôn nét liền bên trái đường ngăn cách */}
                        <Path
                            d={createOrangePathHistorical()}
                            fill="none"
                            stroke={CHART_THEME.orange}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* X-axis labels - white, DD/MM */}
                        {DAY_MARKS.map((day, index) => {
                            const x = getX(day);
                            const y = PADDING_TOP + chartHeight + 18;
                            return (
                                <SvgText
                                    key={`x-label-${day}`}
                                    x={x}
                                    y={y}
                                    fill={CHART_THEME.text}
                                    fontSize={10}
                                    textAnchor="middle"
                                >
                                    {formatXLabel(DAY_LABELS[index])}
                                </SvgText>
                            );
                        })}
                    </Svg>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        paddingHorizontal: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,
        color: colors.text,
    },
});
