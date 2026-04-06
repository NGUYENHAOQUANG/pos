import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { ICurrentWeather, IDailyForecast } from '@/features/weather/types/weather.types';
import WeatherIcon from '@/features/weather/components/WeatherIcon';

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
            icon: 'Fire',
        });
    } else if (current.temperature2m < 22) {
        alerts.push({
            type: 'danger',
            message: `Nhiệt độ thấp ${Math.round(
                current.temperature2m
            )}°C — Tôm dễ bị stress, giảm ăn. Cần giảm lượng thức ăn.`,
            icon: 'Cold',
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
            icon: 'Thunderstorm',
        });
    } else if (current.rain > 5) {
        alerts.push({
            type: 'warning',
            message: `Đang mưa ${current.rain}mm/h — Theo dõi DO và pH, giảm cho ăn.`,
            icon: 'Rain',
        });
    }

    // Wind alert
    if (current.windSpeed10m > 40) {
        alerts.push({
            type: 'warning',
            message: `Gió mạnh ${Math.round(
                current.windSpeed10m
            )} km/h — Kiểm tra bạt phủ ao, dây neo.`,
            icon: 'Tornado',
        });
    }

    // Humidity alert
    if (current.relativeHumidity2m > 95) {
        alerts.push({
            type: 'info',
            message: 'Độ ẩm rất cao — Tăng sục khí để bổ sung oxy cho ao.',
            icon: 'Humidity',
        });
    }

    // Thunderstorm from weather code
    if (current.weatherCode >= 95) {
        alerts.push({
            type: 'danger',
            message: 'Cảnh báo giông bão — Tắt thiết bị điện, gia cố ao nuôi.',
            icon: 'Lightning',
        });
    }

    // If no issues, show a positive message
    if (alerts.length === 0) {
        alerts.push({
            type: 'info',
            message: 'Thời tiết thuận lợi cho nuôi tôm. Tiếp tục chế độ chăm sóc bình thường.',
            icon: 'CheckCircle',
        });
    }

    return alerts;
};

const FarmingWeatherAlert: React.FC<FarmingWeatherAlertProps> = ({ current, daily }) => {
    const alerts = useMemo(() => analyzeAlerts(current, daily), [current, daily]);

    const getAlertBg = (type: IWeatherAlert['type']) => {
        if (type === 'danger') return colors.weather.alert.dangerBg;
        if (type === 'warning') return colors.weather.alert.warningBg;
        return colors.weather.alert.infoBg;
    };

    const getAlertText = (type: IWeatherAlert['type']) => {
        if (type === 'danger') return colors.weather.alert.dangerText;
        if (type === 'warning') return colors.weather.alert.warningText;
        return colors.weather.alert.infoText;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Cảnh báo nuôi tôm</Text>
            <View style={styles.alertList}>
                {alerts.map((alert, index) => (
                    <View
                        key={`alert-${index}`}
                        style={[styles.alertItem, { backgroundColor: getAlertBg(alert.type) }]}
                    >
                        <WeatherIcon name={alert.icon} size={20} color={getAlertText(alert.type)} />
                        <Text style={[styles.alertMessage, { color: getAlertText(alert.type) }]}>
                            {alert.message}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default React.memo(FarmingWeatherAlert);

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
