/**
 * @file WeatherWidget.tsx
 * @description Compact weather widget for embedding in Farm dashboard/header
 * @author AI Assistant
 * @created 2026-04-03
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { ICurrentWeather } from '@/features/weather/types/weather.types';
import { getWeatherIcon } from '@/features/weather/utils/weatherCodes';

interface WeatherWidgetProps {
    readonly current: ICurrentWeather;
    readonly onPress?: () => void;
}

/**
 * Compact single-line weather widget for headers, dashboards
 * Shows: icon + temperature + humidity + rain
 */
const WeatherWidget: React.FC<WeatherWidgetProps> = ({ current, onPress }) => {
    const icon = getWeatherIcon(current.weatherCode, current.isDay === 1);

    const content = (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.temp}>{Math.round(current.temperature2m)}°C</Text>
            <View style={styles.separator} />
            <Text style={styles.detail}>💧{current.relativeHumidity2m}%</Text>
            {current.rain > 0 && (
                <>
                    <View style={styles.separator} />
                    <Text style={styles.detail}>🌧️{current.rain}mm</Text>
                </>
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
};

export default WeatherWidget;

/* ===== STYLES ===== */
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.blue[50],
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        gap: spacing.xs,
    },

    icon: {
        fontSize: typography.fontSize.base,
    },

    temp: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text,
    },

    separator: {
        width: 1,
        height: 14,
        backgroundColor: colors.borderMedium,
    },

    detail: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
});
