import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { IDailyForecast } from '@/features/weather/types/weather.types';
import { getWeatherInfo } from '@/features/weather/utils/weatherCodes';
import WeatherIcon from '@/features/weather/components/WeatherIcon';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface DailyForecastListProps {
    readonly dailyData: readonly IDailyForecast[];
}

/**
 * Format day string (e.g. "Hôm nay", "Thứ 2")
 */
const formatDay = (dateString: string, index: number): string => {
    if (index === 0) return 'Hôm nay';
    if (index === 1) return 'Ngày mai';

    const date = new Date(dateString);
    const day = date.getDay();
    if (day === 0) return 'Chủ nhật';
    return `Thứ ${day + 1}`;
};

const DailyForecastList: React.FC<DailyForecastListProps> = ({ dailyData }) => {
    if (dailyData.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Outer card styled like a translucent block */}
            <View style={styles.outerCard}>
                {dailyData.map((item, index) => {
                    const weatherInfo = getWeatherInfo(item.weatherCode);

                    return (
                        <View key={`daily-${item.time}-${index}`} style={styles.row}>
                            {/* Left: Day name */}
                            <Text style={styles.dayName}>{formatDay(item.time, index)}</Text>

                            {/* Middle: Rain percentage / amount */}
                            <View style={styles.rainContainer}>
                                {item.rainSum > 0 && (
                                    <>
                                        <Ionicons
                                            name="water"
                                            size={12}
                                            color={colors.weather.text.light}
                                        />
                                        <Text style={styles.rainText}>
                                            {item.rainSum > 0 ? `${item.rainSum.toFixed(1)}mm` : ''}
                                        </Text>
                                    </>
                                )}
                            </View>

                            {/* Middle Right: Icon */}
                            <View style={styles.iconContainer}>
                                <WeatherIcon name={weatherInfo.icon} size={24} color="#FFD700" />
                            </View>

                            {/* Right: High & Low Temp */}
                            <View style={styles.tempContainer}>
                                <Text style={styles.highTemp}>
                                    {Math.round(item.temperature2mMax)}°
                                </Text>
                                <Text style={styles.lowTemp}>
                                    {Math.round(item.temperature2mMin)}°
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
        marginBottom: 0,
    },

    outerCard: {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        borderRadius: borderRadius.xl,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },

    dayName: {
        flex: 2,
        fontSize: typography.fontSize.base,
        color: colors.white,
        fontWeight: typography.fontWeight.medium,
    },

    rainContainer: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 4,
    },

    rainText: {
        fontSize: typography.fontSize.xs,
        color: colors.weather.text.light,
    },

    iconContainer: {
        flex: 1.5,
        alignItems: 'center',
    },

    tempContainer: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: spacing.sm,
    },

    highTemp: {
        fontSize: typography.fontSize.base,
        color: colors.white,
        fontWeight: typography.fontWeight.medium,
        width: 32,
        textAlign: 'right',
    },

    lowTemp: {
        fontSize: typography.fontSize.base,
        color: colors.weather.text.medium,
        fontWeight: typography.fontWeight.medium,
        width: 32,
        textAlign: 'right',
    },
});
