/**
 * @file DailyForecastList.tsx
 * @description 7-day weather forecast list - iOS Weather style
 * @author AI Assistant
 * @created 2026-04-03
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { IDailyForecast } from '@/features/weather/types/weather.types';
import { getWeatherInfo } from '@/features/weather/utils/weatherCodes';

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
                                <Text style={styles.dayIcon}>{weatherInfo.icon}</Text>
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

export default DailyForecastList;

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

    listContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
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
        color: 'rgba(255, 255, 255, 0.6)',
    },

    weatherSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },

    dayIcon: {
        fontSize: typography.fontSize.xl,
    },

    rainText: {
        fontSize: typography.fontSize.xs,
        color: 'rgba(120, 200, 255, 0.9)',
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
        color: 'rgba(255, 255, 255, 0.6)',
    },
});
