import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { IDailyForecast } from '@/features/weather/types/weather.types';
import { getWeatherInfo } from '@/features/weather/utils/weatherCodes';
import WeatherIcon from '@/features/weather/components/WeatherIcon';

interface DailyForecastListProps {
    readonly dailyData: readonly IDailyForecast[];
}

const WEEKDAY_LABELS: readonly string[] = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const DailyForecastList: React.FC<DailyForecastListProps> = ({ dailyData }) => {
    const formatDay = useCallback((timeStr: string, index: number): string => {
        if (index === 0) return 'Hôm nay';
        const date = new Date(timeStr);
        return WEEKDAY_LABELS[date.getDay()];
    }, []);

    const formatDate = useCallback((timeStr: string): string => {
        const date = new Date(timeStr);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    }, []);

    if (dailyData.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Dự báo 7 ngày</Text>
            <View style={styles.listContainer}>
                {dailyData.map((item, index) => {
                    const weatherInfo = getWeatherInfo(item.weatherCode);
                    return (
                        <View
                            key={`daily-${index}`}
                            style={[
                                styles.dayRow,
                                index < dailyData.length - 1 && styles.dayRowBorder,
                            ]}
                        >
                            {/* Day name */}
                            <View style={styles.dayNameSection}>
                                <Text style={styles.dayName}>{formatDay(item.time, index)}</Text>
                                <Text style={styles.dayDate}>{formatDate(item.time)}</Text>
                            </View>

                            {/* Weather icon + rain */}
                            <View style={styles.weatherSection}>
                                <WeatherIcon
                                    name={weatherInfo.icon}
                                    size={22}
                                    color={colors.weather.text.light}
                                />
                                {item.rainSum > 0 && (
                                    <Text style={styles.rainText}>{item.rainSum.toFixed(1)}mm</Text>
                                )}
                            </View>

                            {/* Temperature range */}
                            <View style={styles.tempSection}>
                                <Text style={styles.tempMax}>
                                    C:{Math.round(item.temperature2mMax)}°
                                </Text>
                                <Text style={styles.tempMin}>
                                    T:{Math.round(item.temperature2mMin)}°
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default React.memo(DailyForecastList);

/* ===== STYLES ===== */
const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },

    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.weather.text.medium,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },

    listContainer: {
        backgroundColor: colors.weather.bg.light,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },

    dayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },

    dayRowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.weather.border.light,
    },

    dayNameSection: {
        width: 65,
    },

    dayName: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.white,
    },

    dayDate: {
        fontSize: typography.fontSize.xs,
        color: colors.weather.text.dimmer,
    },

    weatherSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },

    dayIconWrapper: {
        width: 22,
        height: 22,
    },

    rainText: {
        fontSize: typography.fontSize.xs,
        color: colors.weather.rain,
    },

    tempSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    tempMax: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },

    tempMin: {
        fontSize: typography.fontSize.sm,
        color: colors.weather.text.dimmer,
    },
});
