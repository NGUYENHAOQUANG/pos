import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { ICurrentWeather } from '@/features/weather/types/weather.types';
import { getWeatherIconKey } from '@/features/weather/utils/weatherCodes';
import WeatherIcon from '@/features/weather/components/WeatherIcon';

interface WeatherWidgetProps {
    readonly current: ICurrentWeather;
    readonly onPress?: () => void;
}

/**
 * Compact single-line weather widget for headers, dashboards
 * Shows: icon + temperature + humidity + rain
 */
const WeatherWidget: React.FC<WeatherWidgetProps> = ({ current, onPress }) => {
    const iconKey = getWeatherIconKey(current.weatherCode, current.isDay === 1);

    const content = (
        <View style={styles.container}>
            <WeatherIcon name={iconKey} size={18} color={colors.blue[600]} />
            <Text style={styles.temp}>{Math.round(current.temperature2m)}°C</Text>
            <View style={styles.separator} />
            <View style={styles.detailRow}>
                <WeatherIcon name="Humidity" size={12} color={colors.textSecondary} />
                <Text style={styles.detail}>{current.relativeHumidity2m}%</Text>
            </View>
            {current.rain > 0 && (
                <>
                    <View style={styles.separator} />
                    <View style={styles.detailRow}>
                        <WeatherIcon name="Raindrop" size={12} color={colors.textSecondary} />
                        <Text style={styles.detail}>{current.rain}mm</Text>
                    </View>
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

    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },

    detail: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
});
