import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { IHourlyForecast } from '@/features/weather/types/weather.types';
import { getWeatherInfo } from '@/features/weather/utils/weatherCodes';
import WeatherIcon from '@/features/weather/components/WeatherIcon';

interface HourlyForecastListProps {
    readonly hourlyData: readonly IHourlyForecast[];
}

const HourlyForecastList: React.FC<HourlyForecastListProps> = ({ hourlyData }) => {
    const formatHour = useCallback((timeStr: string): string => {
        const date = new Date(timeStr);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: IHourlyForecast }) => {
            const weatherInfo = getWeatherInfo(item.weatherCode);
            return (
                <View style={styles.hourItem}>
                    <Text style={styles.hourText}>{formatHour(item.time)}</Text>
                    <WeatherIcon
                        name={weatherInfo.icon}
                        size={22}
                        color={colors.weather.text.light}
                    />
                    <Text style={styles.hourTemp}>{Math.round(item.temperature2m)}°</Text>
                    {item.rain > 0 && <Text style={styles.hourRain}>{item.rain}mm</Text>}
                </View>
            );
        },
        [formatHour]
    );

    if (hourlyData.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Dự báo theo giờ</Text>
            <View style={styles.cardWrapper}>
                <FlatList
                    horizontal
                    data={hourlyData}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `hourly-${item.time}-${index}`}
                />
            </View>
        </View>
    );
};

export default React.memo(HourlyForecastList);

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

    cardWrapper: {
        backgroundColor: colors.weather.bg.light,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.sm,
    },

    scrollContent: {
        paddingHorizontal: spacing.sm,
        gap: spacing.xs,
    },

    hourItem: {
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        minWidth: 56,
    },

    hourText: {
        fontSize: typography.fontSize.xs,
        color: colors.weather.text.dim,
        fontWeight: typography.fontWeight.medium,
    },

    hourIconWrapper: {
        marginVertical: spacing.xs,
    },

    hourTemp: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },

    hourRain: {
        fontSize: 10,
        color: colors.weather.rain,
        marginTop: 2,
    },
});
