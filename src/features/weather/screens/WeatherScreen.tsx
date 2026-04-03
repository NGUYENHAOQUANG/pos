import React, { useMemo, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from '@/shared/components/typography/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '@/styles';
import ArrowLeftIcon from '@/assets/Icon/ArrowLeft.svg';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useWeatherForecast } from '@/features/weather/hooks/useWeatherForecast';
import { getWeatherInfo, getWeatherIconKey } from '@/features/weather/utils/weatherCodes';
import WeatherIcon from '@/features/weather/components/WeatherIcon';
import { useWeatherStore } from '@/features/weather/store/weatherStore';
import LocationPickerModal from '@/features/weather/components/LocationPickerModal';
import HourlyForecastList from '@/features/weather/components/HourlyForecastList';
import DailyForecastList from '@/features/weather/components/DailyForecastList';
import FarmingWeatherAlert from '@/features/weather/components/FarmingWeatherAlert';

/**
 * Gradient colors for weather backgrounds based on weather condition
 */
const WEATHER_GRADIENTS = {
    clear: ['#1B6CB0', '#3A8FD6', '#73BAE8'],
    cloudy: ['#4A6D8C', '#6E8FAB', '#8BAEC5'],
    rainy: ['#3A4F63', '#506A7E', '#6B8599'],
    storm: ['#2C3E50', '#34495E', '#4A6274'],
    night: ['#0F2027', '#203A43', '#2C5364'],
} as const;

const getGradientForWeather = (code: number, isDay: boolean): readonly string[] => {
    if (!isDay) return WEATHER_GRADIENTS.night;
    if (code >= 95) return WEATHER_GRADIENTS.storm;
    if (code >= 51) return WEATHER_GRADIENTS.rainy;
    if (code >= 2) return WEATHER_GRADIENTS.cloudy;
    return WEATHER_GRADIENTS.clear;
};

const WeatherScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [isLocationPickerVisible, setLocationPickerVisible] = useState(false);

    // Dynamic location from store
    const selectedLocation = useWeatherStore(s => s.selectedLocation);
    const setSelectedLocation = useWeatherStore(s => s.setSelectedLocation);
    const location = selectedLocation;

    const {
        data: weatherData,
        isLoading,
        isError,
        refetch,
        isRefetching,
    } = useWeatherForecast(location);

    const gradientColors = useMemo(() => {
        if (!weatherData) return WEATHER_GRADIENTS.clear;
        return getGradientForWeather(
            weatherData.current.weatherCode,
            weatherData.current.isDay === 1
        );
    }, [weatherData]);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const lastUpdatedText = useMemo(() => {
        if (!weatherData?.lastUpdated) return '';
        const date = new Date(weatherData.lastUpdated);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }, [weatherData?.lastUpdated]);

    // Loading state
    if (isLoading) {
        return (
            <LinearGradient colors={[...WEATHER_GRADIENTS.clear]} style={styles.flex1}>
                <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <ArrowLeftIcon width={20} height={20} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.locationButton}
                        onPress={() => setLocationPickerVisible(true)}
                    >
                        <Text style={styles.headerTitle}>Thời tiết</Text>
                        <AntDesign name="caretdown" size={10} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                    <View style={styles.headerPlaceholder} />
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.white} />
                    <Text style={styles.loadingText}>Đang tải dữ liệu thời tiết...</Text>
                </View>
            </LinearGradient>
        );
    }

    // Error state
    if (isError || !weatherData) {
        return (
            <LinearGradient colors={[...WEATHER_GRADIENTS.cloudy]} style={styles.flex1}>
                <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <ArrowLeftIcon width={20} height={20} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.locationButton}
                        onPress={() => setLocationPickerVisible(true)}
                    >
                        <Text style={styles.headerTitle}>Thời tiết</Text>
                        <AntDesign name="caretdown" size={10} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                    <View style={styles.headerPlaceholder} />
                </View>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>Không thể tải dữ liệu thời tiết</Text>
                    <Text style={styles.errorHint}>Kiểm tra kết nối mạng và thử lại</Text>
                </View>
            </LinearGradient>
        );
    }

    const weatherInfo = getWeatherInfo(weatherData.current.weatherCode);
    const weatherIconKey = getWeatherIconKey(
        weatherData.current.weatherCode,
        weatherData.current.isDay === 1
    );
    const todayForecast = weatherData.daily[0];

    return (
        <LinearGradient colors={[...gradientColors]} style={styles.flex1}>
            {/* Header with back button + location picker */}
            <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <ArrowLeftIcon width={20} height={20} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={() => setLocationPickerVisible(true)}
                >
                    <Text style={styles.headerTitle}>{location.name}</Text>
                    <AntDesign name="caretdown" size={10} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
                style={styles.flex1}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={colors.white}
                    />
                }
            >
                {/* ===== Hero Weather Card (iOS style) ===== */}
                <View style={styles.heroCard}>
                    {/* Location name */}
                    <Text style={styles.locationName}>{location.name}</Text>
                    <Text style={styles.locationTime}>{lastUpdatedText}</Text>

                    {/* Big temperature */}
                    <Text style={styles.heroTemp}>
                        {Math.round(weatherData.current.temperature2m)}°
                    </Text>

                    {/* Weather condition */}
                    <View style={styles.heroConditionRow}>
                        <WeatherIcon name={weatherIconKey} size={28} color={colors.white} />
                        <Text style={styles.heroCondition}>{weatherInfo.label}</Text>
                    </View>

                    {/* High / Low */}
                    {todayForecast && (
                        <Text style={styles.heroHighLow}>
                            C:{Math.round(todayForecast.temperature2mMax)}° T:
                            {Math.round(todayForecast.temperature2mMin)}°
                        </Text>
                    )}
                </View>

                {/* ===== Detail Metrics Row ===== */}
                <View style={styles.metricsCard}>
                    <MetricItem
                        iconName="Thermometer"
                        label="Cảm giác"
                        value={`${Math.round(weatherData.current.apparentTemperature)}°`}
                    />
                    <View style={styles.metricDivider} />
                    <MetricItem
                        iconName="Humidity"
                        label="Độ ẩm"
                        value={`${weatherData.current.relativeHumidity2m}%`}
                    />
                    <View style={styles.metricDivider} />
                    <MetricItem
                        iconName="Wind"
                        label="Gió"
                        value={`${Math.round(weatherData.current.windSpeed10m)} km/h`}
                    />
                    <View style={styles.metricDivider} />
                    <MetricItem
                        iconName="Raindrop"
                        label="Mưa"
                        value={`${weatherData.current.rain} mm`}
                    />
                </View>

                {/* ===== Farming Alerts ===== */}
                <FarmingWeatherAlert current={weatherData.current} daily={weatherData.daily} />

                {/* ===== Hourly Forecast ===== */}
                <HourlyForecastList hourlyData={weatherData.hourly} />

                {/* ===== Daily Forecast ===== */}
                <DailyForecastList dailyData={weatherData.daily} />

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Dữ liệu từ Open-Meteo • Cập nhật mỗi 15 phút
                    </Text>
                </View>
            </ScrollView>

            {/* Location Picker Modal */}
            <LocationPickerModal
                visible={isLocationPickerVisible}
                currentLocation={location}
                onSelect={setSelectedLocation}
                onClose={() => setLocationPickerVisible(false)}
            />
        </LinearGradient>
    );
};

/* ===== Metric Item Sub-component ===== */
interface MetricItemProps {
    readonly iconName: string;
    readonly label: string;
    readonly value: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ iconName, label, value }) => (
    <View style={styles.metricItem}>
        <WeatherIcon name={iconName} size={20} color={colors.white} />
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
    </View>
);

export default WeatherScreen;

/* ===== STYLES ===== */
const styles = StyleSheet.create({
    flex1: {
        flex: 1,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },

    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },

    headerPlaceholder: {
        width: 40,
    },

    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing['2xl'],
    },

    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },

    loadingText: {
        marginTop: spacing.md,
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
    },

    errorIcon: {
        fontSize: typography.fontSize['4xl'],
        marginBottom: spacing.md,
    },

    errorText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
        textAlign: 'center',
    },

    errorHint: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: spacing.xs,
        textAlign: 'center',
    },

    // ── Hero Card ──────────────────────────────────
    heroCard: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
        marginBottom: spacing.md,
    },

    locationName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },

    locationTime: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },

    heroTemp: {
        fontSize: 72,
        fontWeight: typography.fontWeight.light,
        color: colors.white,
        marginVertical: spacing.xs,
    },

    heroConditionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },

    heroCondition: {
        fontSize: typography.fontSize.lg,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: typography.fontWeight.medium,
    },

    heroHighLow: {
        fontSize: typography.fontSize.base,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: spacing.xs,
        fontWeight: typography.fontWeight.medium,
    },

    // ── Metrics Card ───────────────────────────────
    metricsCard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: borderRadius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        marginBottom: spacing.md,
    },

    metricDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },

    metricItem: {
        alignItems: 'center',
        gap: 2,
        flex: 1,
    },

    metricIcon: {
        fontSize: typography.fontSize.base,
    },

    metricValue: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
    },

    metricLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
    },

    // ── Footer ─────────────────────────────────────
    footer: {
        alignItems: 'center',
        marginTop: spacing.lg,
        paddingTop: spacing.md,
    },

    footerText: {
        fontSize: typography.fontSize.xs,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
    },
});
