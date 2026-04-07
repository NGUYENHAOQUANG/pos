import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Colors, spacing, typography, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { ICurrentWeather } from '@/features/weather/types/weather.types';
import { getWeatherIconKey } from '@/features/weather/utils/weatherCodes';
import WeatherIcon from '@/features/weather/components/WeatherIcon';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface WeatherWidgetProps {
    readonly current: ICurrentWeather;
    readonly onPress?: () => void;
}

/**
 * Compact single-line weather widget for headers, dashboards
 * Shows: icon + temperature + humidity + rain
 */
const WeatherWidget: React.FC<WeatherWidgetProps> = ({ current, onPress }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const iconKey = getWeatherIconKey(current.weatherCode, current.isDay === 1);

    const content = (
        <View style={styles.container}>
            <WeatherIcon name={iconKey} size={18} color={theme.info} />
            <Text style={styles.temp}>{Math.round(current.temperature2m)}°C</Text>
            <View style={styles.detailRow}>
                <Ionicons name="water-outline" size={12} color={theme.textSecondary} />
                <Text style={styles.detail}>{current.relativeHumidity2m}%</Text>
            </View>
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
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.isDark ? 'rgba(10, 132, 255, 0.15)' : '#E6F4FF',
            borderRadius: borderRadius.full,
            paddingHorizontal: spacing.sm,
            paddingVertical: 4,
            gap: 6,
        },

        temp: {
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: theme.text,
        },

        detailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
        },

        detail: {
            fontSize: typography.fontSize.xs,
            color: theme.textSecondary,
        },
    });
