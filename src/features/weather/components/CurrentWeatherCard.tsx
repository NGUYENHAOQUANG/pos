/**
 * @file CurrentWeatherCard.tsx
 * @description Card displaying current weather conditions
 * @author AI Assistant
 * @created 2026-04-03
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { shadows } from '@/styles/shadows';
import { ICurrentWeather } from '@/features/weather/types/weather.types';
import { getWeatherInfo, getWeatherIcon } from '@/features/weather/utils/weatherCodes';

interface CurrentWeatherCardProps {
    readonly current: ICurrentWeather;
    readonly locationName?: string;
}

const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ current, locationName }) => {
    const weatherInfo = getWeatherInfo(current.weatherCode);
    const icon = getWeatherIcon(current.weatherCode, current.isDay === 1);

    return (
        <View style={styles.container}>
            {/* Main temperature area */}
            <View style={styles.mainSection}>
                <Text style={styles.weatherIcon}>{icon}</Text>
                <Text style={styles.temperature}>{Math.round(current.temperature2m)}°C</Text>
                <Text style={styles.weatherLabel}>{weatherInfo.label}</Text>
                {locationName && <Text style={styles.location}>📍 {locationName}</Text>}
            </View>

            {/* Detail metrics */}
            <View style={styles.metricsRow}>
                <MetricItem
                    icon="🌡️"
                    label="Cảm giác"
                    value={`${Math.round(current.apparentTemperature)}°C`}
                />
                <MetricItem icon="💧" label="Độ ẩm" value={`${current.relativeHumidity2m}%`} />
                <MetricItem
                    icon="💨"
                    label="Gió"
                    value={`${Math.round(current.windSpeed10m)} km/h`}
                />
                <MetricItem icon="🌧️" label="Mưa" value={`${current.rain} mm`} />
            </View>

            {/* Pressure row */}
            <View style={styles.pressureRow}>
                <Text style={styles.pressureLabel}>Áp suất:</Text>
                <Text style={styles.pressureValue}>{Math.round(current.pressure)} hPa</Text>
            </View>
        </View>
    );
};

/* ===== Metric Item Sub-component ===== */

interface MetricItemProps {
    readonly icon: string;
    readonly label: string;
    readonly value: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ icon, label, value }) => (
    <View style={styles.metricItem}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
    </View>
);

export default CurrentWeatherCard;

/* ===== STYLES ===== */
const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.blue[50],
        borderRadius: borderRadius.md,
        padding: spacing.md,
        ...shadows.md,
    },

    mainSection: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },

    weatherIcon: {
        fontSize: typography.fontSize['5xl'],
    },

    temperature: {
        fontSize: typography.fontSize['4xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginTop: spacing.xs,
    },

    weatherLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },

    location: {
        fontSize: typography.fontSize.sm,
        color: colors.textTertiary,
        marginTop: spacing.xs,
    },

    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.white,
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.sm,
        marginTop: spacing.md,
    },

    metricItem: {
        alignItems: 'center',
        gap: 2,
    },

    metricIcon: {
        fontSize: typography.fontSize.lg,
    },

    metricValue: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text,
    },

    metricLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },

    pressureRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.sm,
        gap: spacing.xs,
    },

    pressureLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.textTertiary,
    },

    pressureValue: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
    },
});
