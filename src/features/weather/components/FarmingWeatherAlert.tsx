import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, borderRadius } from '@/styles';
import { ICurrentWeather, IDailyForecast } from '@/features/weather/types/weather.types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CheckIcon from '@/assets/Icon/IconWeather/Check.svg';

interface FarmingWeatherAlertProps {
    readonly current: ICurrentWeather;
    readonly daily: readonly IDailyForecast[];
}

interface IWeatherAlert {
    readonly type: 'warning' | 'danger' | 'info';
    readonly message: string;
    readonly iconName: string;
    readonly iconLib: 'ionicons' | 'material';
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
            iconName: 'flame',
            iconLib: 'ionicons',
        });
    } else if (current.temperature2m < 22) {
        alerts.push({
            type: 'danger',
            message: `Nhiệt độ thấp ${Math.round(
                current.temperature2m
            )}°C — Tôm dễ bị stress, giảm ăn. Cần giảm lượng thức ăn.`,
            iconName: 'snow',
            iconLib: 'ionicons',
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
            iconName: 'thunderstorm',
            iconLib: 'ionicons',
        });
    } else if (current.rain > 5) {
        alerts.push({
            type: 'warning',
            message: `Đang mưa ${current.rain}mm/h — Theo dõi DO và pH, giảm cho ăn.`,
            iconName: 'rainy',
            iconLib: 'ionicons',
        });
    }

    // Wind alert
    if (current.windSpeed10m > 40) {
        alerts.push({
            type: 'warning',
            message: `Gió mạnh ${Math.round(
                current.windSpeed10m
            )} km/h — Kiểm tra bạt phủ ao, dây neo.`,
            iconName: 'weather-tornado',
            iconLib: 'material',
        });
    }

    // Humidity alert
    if (current.relativeHumidity2m > 95) {
        alerts.push({
            type: 'info',
            message: 'Độ ẩm rất cao — Tăng sục khí để bổ sung oxy cho ao.',
            iconName: 'water',
            iconLib: 'ionicons',
        });
    }

    // Thunderstorm from weather code
    if (current.weatherCode >= 95) {
        alerts.push({
            type: 'danger',
            message: 'Cảnh báo giông bão — Tắt thiết bị điện, gia cố ao nuôi.',
            iconName: 'flash',
            iconLib: 'ionicons',
        });
    }

    // If no issues, show a positive message
    if (alerts.length === 0) {
        alerts.push({
            type: 'info',
            message: 'Thời tiết thuận lợi cho nuôi tôm. Tiếp tục chế độ chăm sóc bình thường.',
            iconName: 'checkmark-circle',
            iconLib: 'ionicons',
        });
    }

    return alerts;
};

/**
 * Render the correct icon based on the library
 */
const AlertIcon: React.FC<{
    readonly iconName: string;
    readonly iconLib: 'ionicons' | 'material';
    readonly color: string;
}> = ({ iconName, iconLib, color }) => {
    if (iconLib === 'material') {
        return <MaterialCommunityIcons name={iconName} size={20} color={color} />;
    }
    return <Ionicons name={iconName} size={20} color={color} />;
};

const FarmingWeatherAlert: React.FC<FarmingWeatherAlertProps> = ({ current, daily }) => {
    const alerts = useMemo(() => analyzeAlerts(current, daily), [current, daily]);

    const getAlertBg = (type: IWeatherAlert['type']) => {
        if (type === 'danger') return colors.weather.alert.dangerBg;
        if (type === 'warning') return colors.weather.alert.warningBg;
        return colors.weather.alert.infoBg;
    };

    return (
        <View style={styles.container}>
            <View style={styles.outerCard}>
                <View style={styles.sectionHeader}>
                    <CheckIcon width={20} height={20} color={colors.white} />
                    <Text style={styles.sectionTitle}>Dự đoán</Text>
                </View>
                <View style={styles.alertList}>
                    {alerts.map((alert, index) => (
                        <View
                            key={`alert-${index}`}
                            style={[styles.alertItem, { backgroundColor: getAlertBg(alert.type) }]}
                        >
                            <AlertIcon
                                iconName={alert.iconName}
                                iconLib={alert.iconLib}
                                color={colors.white}
                            />
                            <Text style={styles.alertMessage}>{alert.message}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default React.memo(FarmingWeatherAlert);

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
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.white,
    },

    alertList: {
        gap: spacing.sm,
    },

    alertItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.sm,
        borderRadius: 12,
        gap: spacing.sm,
    },

    alertMessage: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: colors.white,
    },
});
