import React, { useMemo } from 'react';
import { useAppTheme } from '@/styles/themeContext';
import { View, StyleSheet, ScrollView } from 'react-native';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { spacing, typography } from '@/styles';
import { Text } from '@/shared/components/typography/Text';

const getChartTheme = (theme: any) => ({
    bg: theme.background,
    grid: theme.borderLight,
    text: theme.textSecondary,
    green: '#22c55e',
    orange: '#f97316',
    forecast: '#F59E0B',
});
import { CHART_HEIGHT, PADDING_LEFT, PADDING_RIGHT, PADDING_TOP } from './feedprodData';
import { FeedProdChartDataPoint } from '../../types/feeding-production';

interface ChartProps {
    chartWidth: number;
    chartHeight: number;
    data: FeedProdChartDataPoint[];
    hiddenSeries?: Set<string>;
}

export const Chart: React.FC<ChartProps> = ({
    chartWidth,
    chartHeight,
    data = [],
    hiddenSeries,
}) => {
    const theme = useAppTheme();
    const CHART_THEME = getChartTheme(theme);
    const PIXELS_PER_DAY = 50;
    const totalDays =
        data.length > 0
            ? Math.floor(
                  (new Date(data[data.length - 1].date).getTime() -
                      new Date(data[0].date).getTime()) /
                      (1000 * 60 * 60 * 24)
              )
            : 0;
    const MIN_CHART_WIDTH = Math.max(450, totalDays * PIXELS_PER_DAY);
    const actualWidth = Math.max(chartWidth, MIN_CHART_WIDTH);

    // ============================================================================
    // DATA PROCESSING (Computed from RAW_DATA)
    // ============================================================================

    const processedData = useMemo(() => {
        if (!data || data.length === 0) {
            return null;
        }

        // Parse start date from the first item
        const START_DATE = new Date(data[0].date);
        START_DATE.setHours(0, 0, 0, 0);

        const parseDateToDay = (dateStr: string): number => {
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);
            const diffTime = date.getTime() - START_DATE.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return Math.max(0, diffDays);
        };

        const PARSED_DATA = data.map(item => ({
            ...item,
            day: parseDateToDay(item.date),
        }));

        const historicalData = PARSED_DATA.filter(item => !item.isForecast);
        const forecastData = PARSED_DATA.filter(item => item.isForecast);

        const HISTORICAL_DAYS =
            historicalData.length > 0 ? historicalData[historicalData.length - 1].day : 0;

        const DIVIDER_DAY = HISTORICAL_DAYS;
        const TOTAL_DAYS = PARSED_DATA.length > 0 ? PARSED_DATA[PARSED_DATA.length - 1].day : 0;

        const generateDayMarks = (totalDays: number): number[] => {
            if (totalDays <= 0) return [0];

            const marks: number[] = [];
            for (let day = 0; day <= totalDays; day++) {
                marks.push(day);
            }
            return marks;
        };

        const getDateForDay = (day: number): string => {
            const date = new Date(START_DATE.getTime() + day * 24 * 60 * 60 * 1000);
            const dayStr = String(date.getDate()).padStart(2, '0');
            const monthStr = String(date.getMonth() + 1).padStart(2, '0');
            return `${dayStr}/${monthStr}`;
        };

        const DAY_MARKS = generateDayMarks(TOTAL_DAYS);
        const DAY_LABELS = DAY_MARKS.map(day => getDateForDay(day));

        const kgToTon = (kg: number) => kg / 1000;

        // Orange = Food
        const ORANGE_DATA_HISTORICAL = historicalData
            .filter(item => item.actualFood !== null)
            .map(item => ({ day: item.day, value: kgToTon(item.actualFood as number) }));

        const ORANGE_DATA_FORECAST = forecastData
            .filter(item => item.forecastFood !== null)
            .map(item => ({ day: item.day, value: kgToTon(item.forecastFood as number) }));

        // Blue/Green = Biomass
        const BLUE_DATA_HISTORICAL = historicalData
            .filter(item => item.actualBiomass !== null)
            .map(item => ({ day: item.day, value: kgToTon(item.actualBiomass as number) }));

        const BLUE_DATA_FORECAST = forecastData
            .filter(item => item.forecastBiomass !== null)
            .map(item => ({ day: item.day, value: kgToTon(item.forecastBiomass as number) }));

        // Y-axis max
        const calculateYMax = (): number => {
            const allOrange = [...ORANGE_DATA_HISTORICAL, ...ORANGE_DATA_FORECAST].map(
                p => p.value
            );
            const allBlue = [...BLUE_DATA_HISTORICAL, ...BLUE_DATA_FORECAST].map(p => p.value);

            const maxValue = Math.max(...allOrange, ...allBlue, 0);
            if (maxValue === 0) return 80;

            const valuePerPart = maxValue / 4;

            let roundedPerPart;
            if (valuePerPart < 1) {
                roundedPerPart = Math.ceil(valuePerPart * 10) / 10;
            } else if (valuePerPart < 10) {
                roundedPerPart = Math.ceil(valuePerPart);
            } else if (valuePerPart < 100) {
                roundedPerPart = Math.ceil(valuePerPart / 10) * 10;
            } else {
                roundedPerPart = Math.ceil(valuePerPart / 100) * 100;
            }

            return roundedPerPart * 4;
        };

        const Y_MAX_CHART1 = calculateYMax();

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
    }, [data]);

    // ============================================================================
    // CHART RENDERING
    // ============================================================================

    if (!processedData) return null;

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
    const INNER_PADDING_LEFT = 18; // Khoảng cách từ trục Y đến điểm dữ liệu đầu tiên
    const INNER_PADDING_RIGHT = 30; // Khoảng cách từ điểm dữ liệu cuối đến bên phải
    const availableWidth = actualWidth - INNER_PADDING_LEFT - INNER_PADDING_RIGHT;

    const getX = (day: number) => {
        if (TOTAL_DAYS === 0) return PADDING_LEFT + INNER_PADDING_LEFT;
        return (day / TOTAL_DAYS) * availableWidth + PADDING_LEFT + INNER_PADDING_LEFT;
    };
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
        if (ORANGE_DATA_FORECAST.length === 0) return '';
        const lastHistorical =
            ORANGE_DATA_HISTORICAL.length > 0
                ? ORANGE_DATA_HISTORICAL[ORANGE_DATA_HISTORICAL.length - 1]
                : null;
        const forecastData = lastHistorical
            ? [lastHistorical, ...ORANGE_DATA_FORECAST]
            : ORANGE_DATA_FORECAST;
        return createLinePath(forecastData);
    };

    const createBluePathForecast = () => {
        if (BLUE_DATA_FORECAST.length === 0) return '';
        const lastHistorical =
            BLUE_DATA_HISTORICAL.length > 0
                ? BLUE_DATA_HISTORICAL[BLUE_DATA_HISTORICAL.length - 1]
                : null;
        const forecastData = lastHistorical
            ? [lastHistorical, ...BLUE_DATA_FORECAST]
            : BLUE_DATA_FORECAST;
        return createLinePath(forecastData);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.textSecondary }]}>Khối lượng (Tấn)</Text>
            <View style={{ position: 'relative' }}>
                {/* Sticky Y-Axis Overlay: padding 12 trái, nhãn trục Y + title dọc để không bị khuất */}
                <View
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: CHART_HEIGHT,
                        width: PADDING_LEFT,
                        zIndex: 1,
                        backgroundColor: theme.background, // Thêm nền để che nội dung khi scroll
                    }}
                    pointerEvents="none"
                >
                    <Svg width={PADDING_LEFT} height={CHART_HEIGHT}>
                        {getYAxisLabels().map(value => {
                            const y = getY(value);
                            return (
                                <SvgText
                                    key={`y-label-sticky-${value}`}
                                    x={0}
                                    y={y + 4}
                                    fill={CHART_THEME.text}
                                    fontSize={12}
                                    textAnchor="start"
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

                        {/* Orange line (Sản lượng) - historical only, solid */}
                        {BLUE_DATA_HISTORICAL.length > 0 && !hiddenSeries?.has('production') && (
                            <Path
                                d={createBluePathHistorical()}
                                fill="none"
                                stroke={CHART_THEME.orange}
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* Green line (Sản lượng) forecast - dashed */}
                        {BLUE_DATA_FORECAST.length > 0 &&
                            (!hiddenSeries?.has('production') ||
                                !hiddenSeries?.has('forecast')) && (
                                <Path
                                    d={createBluePathForecast()}
                                    fill="none"
                                    stroke={CHART_THEME.forecast}
                                    strokeWidth={2}
                                    strokeDasharray="6,4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}

                        {/* Orange line - forecast (dashed) */}
                        {ORANGE_DATA_FORECAST.length > 0 &&
                            (!hiddenSeries?.has('consumed') || !hiddenSeries?.has('forecast')) && (
                                <Path
                                    d={createOrangePathForecast()}
                                    fill="none"
                                    stroke={CHART_THEME.forecast}
                                    strokeWidth={2}
                                    strokeDasharray="6,4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}

                        {/* Green line - historical (solid) */}
                        {!hiddenSeries?.has('consumed') && (
                            <Path
                                d={createOrangePathHistorical()}
                                fill="none"
                                stroke={CHART_THEME.green}
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* X-axis labels - white, DD/MM */}
                        {DAY_MARKS.map((day, index) => {
                            const x = getX(day);
                            const align: 'middle' | 'start' | 'end' = 'middle';

                            const y = PADDING_TOP + chartHeight + 18;
                            return (
                                <SvgText
                                    key={`x-label-${day}`}
                                    x={x}
                                    y={y}
                                    fill={CHART_THEME.text}
                                    fontSize={12}
                                    textAnchor={align}
                                >
                                    {DAY_LABELS[index]}
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
        marginTop: 12,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,
    },
});
