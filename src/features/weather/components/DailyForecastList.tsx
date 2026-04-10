import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, borderRadius } from '@/styles';
import { IDailyForecast } from '@/features/weather/types/weather.types';
import { getWeatherInfo } from '@/features/weather/utils/weatherCodes';
import WeatherIcon from '@/features/weather/components/WeatherIcon';
import CalendarDotsIcon from '@/assets/Icon/IconWeather/CalendarDots.svg';
import DropIcon from '@/assets/Icon/IconWeather/Drop.svg';

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
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    return dayNames[day];
};

const DailyForecastList: React.FC<DailyForecastListProps> = ({ dailyData }) => {
    if (dailyData.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.outerCard}>
                <View style={styles.sectionHeader}>
                    <CalendarDotsIcon width={20} height={20} color={colors.white} />
                    <Text style={styles.sectionTitle}>
                        Dự báo thời tiết trong {dailyData.length} ngày tới
                    </Text>
                </View>
                {dailyData.map((item, index) => {
                    const weatherInfo = getWeatherInfo(item.weatherCode);

                    return (
                        <View key={`daily-${item.time}-${index}`} style={styles.row}>
                            <Text style={styles.dayName}>{formatDay(item.time, index)}</Text>
                            <View style={styles.iconContainer}>
                                <WeatherIcon
                                    name={weatherInfo.icon}
                                    size={24}
                                    color={colors.white}
                                />
                            </View>
                            <View style={styles.rainContainer}>
                                {item.rainSum >= 0.1 && (
                                    <>
                                        <DropIcon width={20} height={20} color={colors.white} />
                                        <Text style={styles.rainText}>
                                            {`${item.rainSum.toFixed(1)}mm`}
                                        </Text>
                                    </>
                                )}
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
        backgroundColor: colors.backgroundWeather,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: spacing.xs,
        paddingBottom: spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.15)',
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.white,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },

    dayName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: colors.white,
    },

    rainContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 4,
    },

    rainText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.white,
    },

    iconContainer: {
        flex: 1,
        alignItems: 'center',
    },

    tempContainer: {
        flex: 1.5,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: spacing.sm,
    },

    highTemp: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.white,
        width: 32,
        textAlign: 'right',
    },

    lowTemp: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.white,
        width: 32,
        textAlign: 'right',
    },
});
