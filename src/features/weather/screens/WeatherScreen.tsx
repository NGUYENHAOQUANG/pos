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
import { colors, spacing, typography } from '@/styles';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useWeatherForecast } from '@/features/weather/hooks/useWeatherForecast';
import { getWeatherInfo, getWeatherIconKey } from '@/features/weather/utils/weatherCodes';
import WeatherIcon from '@/features/weather/components/WeatherIcon';
import { useWeatherStore } from '@/features/weather/store/weatherStore';
import LocationPickerModal from '@/features/weather/components/LocationPickerModal';
import HourlyForecastList from '@/features/weather/components/HourlyForecastList';
import DailyForecastList from '@/features/weather/components/DailyForecastList';
import FarmingWeatherAlert from '@/features/weather/components/FarmingWeatherAlert';
import { CurrentWeatherCard } from '@/features/weather/components/CurrentWeatherCard';

/**
 * Get weather-code based gradient for the hero card.
 * In this layout, this gradient covers the entire screen!
 */
const getScreenGradient = (code: number, isDay: boolean): readonly string[] => {
    // A nice solid Light Blue gradient resembling the provided UI
    if (!isDay) return ['#2C3E50', '#34495E', '#4A6274'];
    if (code >= 95) return ['#3A4F63', '#506A7E', '#6B8599']; // Storm
    if (code >= 51) return ['#4A6D8C', '#6E8FAB', '#8BAEC5']; // Rainy

    // Default bright blue gradient for Sun/Cloud
    return ['#7AB2FA', '#68A4F1', '#5A99E9'];
};

const WeatherScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [isLocationPickerVisible, setLocationPickerVisible] = useState(false);

    // Dynamic location from store
    const selectedLocation = useWeatherStore(s => s.selectedLocation);
    const location = selectedLocation;

    const {
        data: weatherData,
        isLoading,
        isError,
        refetch,
        isRefetching,
    } = useWeatherForecast(location);

    /** Screen gradient based on weather code */
    const screenGradient = useMemo(() => {
        if (!weatherData) return ['#7AB2FA', '#68A4F1', '#5A99E9'];
        return getScreenGradient(weatherData.current.weatherCode, weatherData.current.isDay === 1);
    }, [weatherData]);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <LinearGradient colors={['#7AB2FA', '#68A4F1']} style={styles.flex1}>
                <View style={[styles.heroOverlay, { paddingTop: insets.top + spacing.md }]}>
                    <TouchableOpacity onPress={handleBack} style={styles.headerBtnLeft}>
                        <Ionicons name="arrow-back" size={26} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setLocationPickerVisible(true)}
                        style={styles.headerBtnRight}
                    >
                        <Feather name="menu" size={26} color={colors.white} />
                    </TouchableOpacity>
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
            <LinearGradient colors={['#4A6D8C', '#6E8FAB']} style={styles.flex1}>
                <View style={[styles.heroOverlay, { paddingTop: insets.top + spacing.md }]}>
                    <TouchableOpacity onPress={handleBack} style={styles.headerBtnLeft}>
                        <Ionicons name="arrow-back" size={26} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setLocationPickerVisible(true)}
                        style={styles.headerBtnRight}
                    >
                        <Feather name="menu" size={26} color={colors.white} />
                    </TouchableOpacity>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>Không thể tải dữ liệu thời tiết</Text>
                    <Text style={styles.errorHint}>Kiểm tra kết nối mạng và thử lại</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                        <Ionicons name="refresh" size={18} color={colors.white} />
                        <Text style={styles.retryText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
                <LocationPickerModal
                    visible={isLocationPickerVisible}
                    onClose={() => setLocationPickerVisible(false)}
                    currentLocation={location}
                    onSelect={newLoc => useWeatherStore.getState().setSelectedLocation(newLoc)}
                />
            </LinearGradient>
        );
    }

    const weatherInfo = getWeatherInfo(weatherData.current.weatherCode);
    const weatherIconKey = getWeatherIconKey(
        weatherData.current.weatherCode,
        weatherData.current.isDay === 1
    );
    const todayForecast = weatherData.daily[0];
    const lastUpdatedTime = new Date(weatherData.lastUpdated).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <LinearGradient colors={[...screenGradient]} style={styles.flex1}>
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
                {/* Overlay: hamburger menu */}
                <View style={[styles.heroOverlay, { paddingTop: insets.top + spacing.md }]}>
                    <TouchableOpacity onPress={handleBack} style={styles.headerBtnLeft}>
                        <Ionicons name="arrow-back" size={26} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setLocationPickerVisible(true)}
                        style={styles.headerBtnRight}
                    >
                        <Feather name="menu" size={26} color={colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Hero content matching UI */}
                <View style={styles.heroSection}>
                    <View style={styles.heroLeft}>
                        {/* Huge temperature */}
                        <Text style={styles.heroTemp}>
                            {Math.round(weatherData.current.temperature2m)}°
                        </Text>

                        {/* Weather condition */}
                        <Text style={styles.heroCondition}>{weatherInfo.label}</Text>

                        {/* Location name with pin */}
                        <TouchableOpacity
                            style={styles.locationRow}
                            onPress={() => setLocationPickerVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.locationName}>{location.name}</Text>
                            <Ionicons name="location-sharp" size={14} color={colors.white} />
                        </TouchableOpacity>

                        {/* High / Low & Feels Like */}
                        {todayForecast && (
                            <Text style={styles.heroHighLow}>
                                {Math.round(todayForecast.temperature2mMax)}° /{' '}
                                {Math.round(todayForecast.temperature2mMin)}° Cảm giác như{' '}
                                {Math.round(weatherData.current.apparentTemperature)}°
                            </Text>
                        )}
                    </View>

                    <View style={styles.heroRight}>
                        {/* Large icon illustration */}
                        <WeatherIcon name={weatherIconKey} size={120} color="#FFD700" />
                    </View>
                </View>

                {/* Content Cards */}
                <View style={styles.contentWrapper}>
                    <HourlyForecastList hourlyData={weatherData.hourly} />
                    <FarmingWeatherAlert current={weatherData.current} daily={weatherData.daily} />
                    <DailyForecastList dailyData={weatherData.daily} />
                    <CurrentWeatherCard current={weatherData.current} />

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Dữ liệu từ WeatherAPI • Cập nhật lúc {lastUpdatedTime}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <LocationPickerModal
                visible={isLocationPickerVisible}
                onClose={() => setLocationPickerVisible(false)}
                currentLocation={location}
                onSelect={newLoc => useWeatherStore.getState().setSelectedLocation(newLoc)}
            />
        </LinearGradient>
    );
};

export default React.memo(WeatherScreen);

/* ===== STYLES ===== */
const styles = StyleSheet.create({
    flex1: {
        flex: 1,
    },

    scrollContent: {
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
        color: 'rgba(255,255,255,0.8)',
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
        color: 'rgba(255,255,255,0.6)',
        marginTop: spacing.xs,
        textAlign: 'center',
    },

    // ── Hero Overlay ──
    heroOverlay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.sm,
    },
    headerBtnLeft: {
        padding: spacing.xs,
        marginLeft: -spacing.xs,
    },
    headerBtnRight: {
        padding: spacing.xs,
        marginRight: -spacing.xs,
    },

    // ── Hero Section ────
    heroSection: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing['3xl'],
        justifyContent: 'space-between',
    },

    heroLeft: {
        flex: 1,
    },

    heroRight: {
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingRight: spacing.sm,
        paddingTop: spacing.lg,
    },

    heroTemp: {
        fontSize: 90,
        fontWeight: '300',
        color: colors.white,
        lineHeight: 100,
        letterSpacing: -2,
    },

    heroCondition: {
        fontSize: typography.fontSize.xl,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: typography.fontWeight.medium,
        marginBottom: spacing.xl,
    },

    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },

    locationName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.medium,
        color: colors.white,
    },

    heroHighLow: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: typography.fontWeight.regular,
    },

    contentWrapper: {
        paddingHorizontal: spacing.md,
        gap: 10,
    },

    // ── Footer ─────────────────────────────────────
    footer: {
        alignItems: 'center',
        marginTop: spacing.xl,
        paddingTop: spacing.md,
    },

    footerText: {
        fontSize: typography.fontSize.xs,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
    },

    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },

    retryText: {
        fontSize: typography.fontSize.sm,
        color: colors.white,
        fontWeight: typography.fontWeight.medium,
    },
});
