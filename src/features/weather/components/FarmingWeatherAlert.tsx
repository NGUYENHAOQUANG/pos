/**
 * @file FarmingWeatherAlert.tsx
 * @description Alert card for weather conditions affecting shrimp farming - iOS style
 * @author AI Assistant
 * @created 2026-04-03
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing, typography, borderRadius } from '@/styles';
import { ICurrentWeather, IDailyForecast } from '@/features/weather/types/weather.types';

interface FarmingWeatherAlertProps {
    readonly current: ICurrentWeather;
    readonly daily: readonly IDailyForecast[];
}

interface IWeatherAlert {
    readonly type: 'warning' | 'danger' | 'info';
    readonly message: string;
    readonly icon: string;
}

/**
 * Analyze weather conditions for shrimp farming risks
 */
const analyzeAlerts = (
    current: ICurrentWeather,
    daily: readonly IDailyForecast[]
): IWeatherAlert[] => {
    const alerts: IWeatherAlert[] = [];

    // Temperature alerts for shrimp (optimal: 25-32°C)
    if (current.temperature2m > 34) {
        alerts.push({
            type: 'danger',
            message: `Nhiệt độ cao ${Math.round(
                current.temperature2m
            )}°C — Nguy cơ tôm bị sốc nhiệt. Cần tăng quạt nước và bổ sung nước.`,
            icon: '🔥',
        });
    } else if (current.temperature2m < 22) {
        alerts.push({
            type: 'danger',
            message: `Nhiệt độ thấp ${Math.round(
                current.temperature2m
            )}°C — Tôm dễ bị stress, giảm ăn. Cần giảm lượng thức ăn.`,
            icon: '🥶',
        });
    }

    // Heavy rain alert
    const todayForecast = daily[0];
    if (todayForecast && todayForecast.rainSum > 30) {
        alerts.push({
            type: 'warning',
            message: `Dự báo mưa lớn ${todayForecast.rainSum.toFixed(
                1
            )}mm — Chuẩn bị vôi, kiểm tra pH sau mưa.`,
            icon: '⛈️',
        });
    } else if (current.rain > 5) {
        alerts.push({
            type: 'warning',
            message: `Đang mưa ${current.rain}mm/h — Theo dõi DO và pH, giảm cho ăn.`,
            icon: '🌧️',
        });
    }

    // Wind alert
    if (current.windSpeed10m > 40) {
        alerts.push({
            type: 'warning',
            message: `Gió mạnh ${Math.round(
                current.windSpeed10m
            )} km/h — Kiểm tra bạt phủ ao, dây neo.`,
            icon: '🌪️',
        });
    }

    // Humidity alert
    if (current.relativeHumidity2m > 95) {
        alerts.push({
            type: 'info',
            message: 'Độ ẩm rất cao — Tăng sục khí để bổ sung oxy cho ao.',
            icon: '💧',
        });
    }

    // Thunderstorm from weather code
    if (current.weatherCode >= 95) {
        alerts.push({
            type: 'danger',
            message: 'Cảnh báo giông bão — Tắt thiết bị điện, gia cố ao nuôi.',
            icon: '⚡',
        });
    }

    // If no issues, show a positive message
    if (alerts.length === 0) {
        alerts.push({
            type: 'info',
            message: 'Thời tiết thuận lợi cho nuôi tôm. Tiếp tục chế độ chăm sóc bình thường.',
            icon: '✅',
        });
    }

    return alerts;
};

const ALERT_COLORS = {
    danger: 'rgba(255, 80, 80, 0.25)',
    warning: 'rgba(255, 180, 50, 0.25)',
    info: 'rgba(100, 220, 120, 0.25)',
} as const;

const ALERT_TEXT_COLORS = {
    danger: '#FFB3B3',
    warning: '#FFE0A0',
    info: '#B0F0C0',
} as const;

const FarmingWeatherAlert: React.FC<FarmingWeatherAlertProps> = ({ current, daily }) => {
    const alerts = useMemo(() => analyzeAlerts(current, daily), [current, daily]);

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Cảnh báo nuôi tôm</Text>
            <View style={styles.alertList}>
                {alerts.map((alert, index) => (
                    <View
                        key={`alert-${index}`}
                        style={[styles.alertItem, { backgroundColor: ALERT_COLORS[alert.type] }]}
                    >
                        <Text style={styles.alertIcon}>{alert.icon}</Text>
                        <Text
                            style={[styles.alertMessage, { color: ALERT_TEXT_COLORS[alert.type] }]}
                        >
                            {alert.message}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default FarmingWeatherAlert;

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

    alertList: {
        gap: spacing.sm,
    },

    alertItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
        gap: spacing.sm,
    },

    alertIcon: {
        fontSize: typography.fontSize.lg,
        marginTop: 2,
    },

    alertMessage: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    },
});
