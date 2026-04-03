/**
 * @file HourlyForecastList.tsx
 * @description Horizontal scrollable hourly forecast - iOS Weather style
 * @author AI Assistant
 * @created 2026-04-03
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { IHourlyForecast } from '@/features/weather/types/weather.types';
import { getWeatherInfo } from '@/features/weather/utils/weatherCodes';

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

    if (hourlyData.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Dự báo theo giờ</Text>
            <View style={styles.cardWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {hourlyData.map((item, index) => {
                        const weatherInfo = getWeatherInfo(item.weatherCode);
                        return (
                            <View key={`hourly-${index}`} style={styles.hourItem}>
                                <Text style={styles.hourText}>{formatHour(item.time)}</Text>
                                <Text style={styles.hourIcon}>{weatherInfo.icon}</Text>
                                <Text style={styles.hourTemp}>
                                    {Math.round(item.temperature2m)}°
                                </Text>
                                {item.rain > 0 && (
                                    <Text style={styles.hourRain}>{item.rain}mm</Text>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
};

export default HourlyForecastList;

/* ===== STYLES ===== */
const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },

    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },

    cardWrapper: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: typography.fontWeight.medium,
    },

    hourIcon: {
        fontSize: typography.fontSize.xl,
        marginVertical: spacing.xs,
    },

    hourTemp: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },

    hourRain: {
        fontSize: 10,
        color: 'rgba(120, 200, 255, 0.9)',
        marginTop: 2,
    },
});
