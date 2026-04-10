import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Svg, {
    Path,
    Circle,
    Defs,
    LinearGradient as SvgLinearGradient,
    Stop,
} from 'react-native-svg';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { IHourlyForecast } from '@/features/weather/types/weather.types';
import { getWeatherIconKey } from '@/features/weather/utils/weatherCodes';
import WeatherIcon from '@/features/weather/components/WeatherIcon';
import DropIcon from '@/assets/Icon/IconWeather/Drop.svg';

/* ===== Layout Constants ===== */
const ITEM_WIDTH = 64;
const CHART_HEIGHT = 40;
const CHART_PADDING = 8;
const DOT_RADIUS = 3.5;
const LINE_GRADIENT_ID = 'tempLineGradient';

interface HourlyForecastListProps {
    readonly hourlyData: readonly IHourlyForecast[];
    readonly conditionLabel?: string;
    readonly tempMax?: number;
    readonly tempMin?: number;
}

interface ITempRange {
    readonly min: number;
    readonly max: number;
    readonly span: number;
}

interface IChartPoint {
    readonly x: number;
    readonly y: number;
}

const getTempY = (temp: number, range: ITempRange): number => {
    if (range.span === 0) return CHART_HEIGHT / 2;
    const normalized = (temp - range.min) / range.span;
    return CHART_HEIGHT - CHART_PADDING - normalized * (CHART_HEIGHT - CHART_PADDING * 2);
};

const buildSmoothPath = (points: readonly IChartPoint[]): string => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        const tension = 0.35;
        const dx = (next.x - current.x) * tension;
        path += ` C ${current.x + dx} ${current.y}, ${next.x - dx} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
};

const formatHourLabel = (timeStr: string, index: number): string => {
    if (index === 0) return 'Bây giờ';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

const formatRain = (item: IHourlyForecast): string => {
    // Use real chance_of_rain from WeatherAPI if available
    if (item.chanceOfRain !== undefined) {
        return `${item.chanceOfRain}%`;
    }
    // Fallback: approximate from rain amount
    if (item.rain <= 0) return '0%';
    const pct = Math.min(Math.round(item.rain * 10), 100);
    return `${pct}%`;
};

const HourlyForecastList: React.FC<HourlyForecastListProps> = ({
    hourlyData,
    conditionLabel,
    tempMax,
    tempMin,
}) => {
    const tempRange: ITempRange = useMemo(() => {
        const temps = hourlyData.map(h => h.temperature2m);
        const min = Math.min(...temps);
        const max = Math.max(...temps);
        return { min, max, span: max - min };
    }, [hourlyData]);

    const chartPoints: readonly IChartPoint[] = useMemo(
        () =>
            hourlyData.map((h, i) => ({
                x: i * ITEM_WIDTH + ITEM_WIDTH / 2,
                y: getTempY(h.temperature2m, tempRange),
            })),
        [hourlyData, tempRange]
    );

    const linePath = useMemo(() => buildSmoothPath(chartPoints), [chartPoints]);
    const totalWidth = hourlyData.length * ITEM_WIDTH;

    if (hourlyData.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Text Tổng hợp */}
                {conditionLabel && tempMax !== undefined && tempMin !== undefined && (
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>
                            {conditionLabel}. Cao {Math.round(tempMax)}°C và thấp{' '}
                            {Math.round(tempMin)}°C.
                        </Text>
                    </View>
                )}
                {conditionLabel && <View style={styles.separator} />}

                {/* Scrollable content */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={{ width: totalWidth, paddingVertical: spacing.md }}>
                        {/* Row 1: Time, Icon, Temp */}
                        <View style={styles.topInfoRow}>
                            {hourlyData.map((item, index) => {
                                return (
                                    <View
                                        key={`info-${item.time}-${index}`}
                                        style={styles.infoColumn}
                                    >
                                        <Text style={styles.hourText}>
                                            {formatHourLabel(item.time, index)}
                                        </Text>
                                        <View style={styles.iconWrapper}>
                                            <WeatherIcon
                                                name={getWeatherIconKey(
                                                    item.weatherCode,
                                                    item.isDay === 1
                                                )}
                                                size={28}
                                                color={colors.white}
                                            />
                                        </View>
                                        <Text style={styles.hourTemp}>
                                            {Math.round(item.temperature2m)}°
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Row 2: SVG chart */}
                        <Svg width={totalWidth} height={CHART_HEIGHT}>
                            <Defs>
                                <SvgLinearGradient
                                    id={LINE_GRADIENT_ID}
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="0"
                                >
                                    <Stop
                                        offset="0"
                                        stopColor={colors.weather.chart.lineMid}
                                        stopOpacity="1"
                                    />
                                    <Stop
                                        offset="1"
                                        stopColor={colors.weather.chart.lineMid}
                                        stopOpacity="1"
                                    />
                                </SvgLinearGradient>
                            </Defs>

                            {/* Temperature curve */}
                            <Path
                                d={linePath}
                                stroke={colors.white}
                                strokeWidth={2.5}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Dots at each data point */}
                            {chartPoints.map((point, index) => (
                                <Circle
                                    key={`dot-${index}`}
                                    cx={point.x}
                                    cy={point.y}
                                    r={DOT_RADIUS}
                                    fill={colors.white}
                                    stroke={colors.white}
                                    strokeWidth={1.5}
                                />
                            ))}
                        </Svg>

                        {/* Row 3: Rain chance */}
                        <View style={styles.bottomInfoRow}>
                            {hourlyData.map((item, index) => (
                                <View key={`rain-${item.time}-${index}`} style={styles.rainColumn}>
                                    <DropIcon width={12} height={12} color={colors.white} />
                                    <Text style={styles.rainText}>{formatRain(item)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default React.memo(HourlyForecastList);

/* ===== STYLES ===== */
const styles = StyleSheet.create({
    container: {
        marginBottom: 0,
    },

    card: {
        backgroundColor: colors.backgroundWeather,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        borderColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
    },

    summaryContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },

    summaryText: {
        fontSize: 14,
        color: colors.white,
        fontWeight: '600',
        lineHeight: 20,
    },

    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xs,
    },

    scrollContent: {
        paddingHorizontal: 16,
    },

    topInfoRow: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
    },

    infoColumn: {
        width: ITEM_WIDTH,
        alignItems: 'center',
        gap: 6,
    },

    hourText: {
        fontSize: 14,
        color: colors.white,
        fontWeight: '500',
    },

    iconWrapper: {
        marginVertical: 4,
    },

    hourTemp: {
        fontSize: typography.fontSize.sm,
        color: colors.white,
        fontWeight: typography.fontWeight.semibold,
    },

    bottomInfoRow: {
        flexDirection: 'row',
        marginTop: spacing.xs,
    },

    rainColumn: {
        width: ITEM_WIDTH,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },

    rainText: {
        fontSize: 12,
        color: colors.white,
    },
});
