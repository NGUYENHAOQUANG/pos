import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    useAnimatedScrollHandler,
    interpolate,
} from 'react-native-reanimated';
import { Text } from '@/shared/components/typography/Text';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, spacing, typography } from '@/styles';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useWeatherForecast } from '@/features/weather/hooks/useWeatherForecast';
import { getWeatherInfo, getWeatherIconKey } from '@/features/weather/utils/weatherCodes';
import WeatherIcon from '@/features/weather/components/WeatherIcon';
import { useWeatherStore } from '@/features/weather/store/weatherStore';
import LocationPickerModal from '@/features/weather/components/LocationPickerModal';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import DegreeIcon from '@/assets/Icon/IconWeather/Temperature.svg';
import HourlyForecastList from '@/features/weather/components/HourlyForecastList';
import DailyForecastList from '@/features/weather/components/DailyForecastList';
import FarmingWeatherAlert from '@/features/weather/components/FarmingWeatherAlert';
import { CurrentWeatherCard } from '@/features/weather/components/CurrentWeatherCard';
import { MoonPhaseCard } from '@/features/weather/components/MoonPhaseCard';
import AnimatedSun from '@/features/weather/animation/AnimatedSun';
import { RainShaderBackground } from '@/features/weather/components/RainShaderBackground';
import SunShaderEffect from '@/features/weather/components/SunShaderEffect';
import MoonShaderEffect from '@/features/weather/components/MoonShaderEffect';
import CloudShaderEffect from '@/features/weather/components/CloudShaderEffect';

/**
 * Get dynamic background image source based on weather code and day/night
 */
const getBackgroundImageSource = (code?: number, isDay?: boolean) => {
    if (code === undefined || isDay === undefined) {
        return require('@/assets/Icon/IconWeather/BG/BG-Day.png');
    }

    if (code >= 51) return require('@/assets/Icon/IconWeather/BG/BG-Rain.png'); // Rainy/Storm
    if (!isDay) return require('@/assets/Icon/IconWeather/BG/BG-Night.png');

    // Default: clear/partly cloudy day
    return require('@/assets/Icon/IconWeather/BG/BG-Day.png');
};

const WeatherScreen: React.FC = () => {
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

    const translateX = useSharedValue(40);
    const insets = useSafeAreaInsets();
    const scrollY = useSharedValue(0);
    const [snapOffset, setSnapOffset] = React.useState(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: event => {
            scrollY.value = event.contentOffset.y;
        },
    });

    React.useEffect(() => {
        translateX.value = withRepeat(
            withTiming(-40, {
                duration: 12000,
                easing: Easing.inOut(Easing.sin),
            }),
            -1,
            true
        );
    }, [translateX]);

    const animatedBgStyle = useAnimatedStyle(() => {
        // Hiệu ứng Parallax: nền cuộn lên chậm hơn so với nội dung
        const translateY = interpolate(scrollY.value, [0, 300], [0, -50], 'clamp');
        return {
            transform: [{ scale: 1.3 }, { translateX: translateX.value }, { translateY }],
        };
    });

    const blurLayerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, 150], [0, 1], 'clamp');
        return { opacity, position: 'absolute', width: '100%', height: '100%' };
    });

    const overlayStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, 200], [0, 0.4], 'clamp');
        return {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: '#000',
            opacity,
        };
    });

    const heroOpacityStyle = useAnimatedStyle(() => {
        // Mờ đi nhanh hơn để không bị cắt nắp khi cuộn
        return { opacity: interpolate(scrollY.value, [0, 50], [1, 0], 'clamp') };
    });

    const stickyOpacityStyle = useAnimatedStyle(() => {
        // Hiện ra ngay khi Hero bắt đầu biến mất
        return { opacity: interpolate(scrollY.value, [20, 70], [0, 1], 'clamp') };
    });

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <View style={styles.flex1}>
                <Animated.Image
                    source={getBackgroundImageSource()}
                    style={[styles.bgImage, animatedBgStyle]}
                />
                <HeaderSection
                    transparent
                    containerStyle={{ zIndex: 10 }}
                    leftComponent={
                        <TouchableOpacity onPress={handleBack} style={styles.headerBtnLeft}>
                            <Ionicons name="arrow-back" size={26} color={colors.white} />
                        </TouchableOpacity>
                    }
                    rightComponent={
                        <TouchableOpacity
                            onPress={() => setLocationPickerVisible(true)}
                            style={styles.headerBtnRight}
                        >
                            <Feather name="menu" size={26} color={colors.white} />
                        </TouchableOpacity>
                    }
                />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.white} />
                    <Text style={styles.loadingText}>Đang tải dữ liệu thời tiết...</Text>
                </View>
            </View>
        );
    }

    // Error state
    if (isError || !weatherData) {
        return (
            <View style={styles.flex1}>
                <Animated.Image
                    source={getBackgroundImageSource()}
                    style={[styles.bgImage, animatedBgStyle]}
                />
                <HeaderSection
                    transparent
                    containerStyle={{ zIndex: 10 }}
                    leftComponent={
                        <TouchableOpacity onPress={handleBack} style={styles.headerBtnLeft}>
                            <Ionicons name="arrow-back" size={26} color={colors.white} />
                        </TouchableOpacity>
                    }
                    rightComponent={
                        <TouchableOpacity
                            onPress={() => setLocationPickerVisible(true)}
                            style={styles.headerBtnRight}
                        >
                            <Feather name="menu" size={26} color={colors.white} />
                        </TouchableOpacity>
                    }
                />
                <View style={styles.centerContainer}>
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
            </View>
        );
    }

    // DEBUG: Force night mode for testing moon shader. Set to false when done.
    const DEBUG_FORCE_NIGHT = false;
    const isDay = DEBUG_FORCE_NIGHT ? false : weatherData.current.isDay === 1;

    const weatherInfo = getWeatherInfo(weatherData.current.weatherCode);
    const weatherIconKey = getWeatherIconKey(weatherData.current.weatherCode, isDay);
    const todayForecast = weatherData.daily[0];

    return (
        <View style={styles.flex1}>
            <Animated.Image
                source={getBackgroundImageSource(weatherData.current.weatherCode, isDay)}
                style={[styles.bgImage, animatedBgStyle]}
            />
            {/* Lớp nền mờ thay thế dần lớp nền rõ */}
            <Animated.View style={blurLayerStyle} pointerEvents="none">
                <Animated.Image
                    source={getBackgroundImageSource(weatherData.current.weatherCode, isDay)}
                    style={[styles.bgImage, animatedBgStyle]}
                    blurRadius={15}
                />
            </Animated.View>

            {weatherData.current.weatherCode >= 51 && (
                <RainShaderBackground weatherCode={weatherData.current.weatherCode} />
            )}

            {/* Sun shader effect for clear/partly cloudy daytime (codes 0, 1, 2) */}
            {isDay && [0, 1, 2].includes(weatherData.current.weatherCode) && (
                <SunShaderEffect
                    scrollY={scrollY}
                    sunrise={todayForecast?.sunrise}
                    sunset={todayForecast?.sunset}
                />
            )}

            {/* Moon shader effect for clear/partly cloudy nighttime */}
            {!isDay && [0, 1, 2, 3].includes(weatherData.current.weatherCode) && (
                <MoonShaderEffect
                    scrollY={scrollY}
                    sunset={todayForecast?.sunset}
                    sunrise={todayForecast?.sunrise}
                />
            )}

            {/* Cloud shader effect for volumetric drifting clouds */}
            <CloudShaderEffect
                weatherCode={weatherData.current.weatherCode}
                isDay={isDay}
                scrollY={scrollY}
            />

            <Animated.View style={overlayStyle} pointerEvents="none" />

            <HeaderSection
                transparent
                containerStyle={{ zIndex: 10 }}
                leftComponent={
                    <TouchableOpacity onPress={handleBack} style={styles.headerBtnLeft}>
                        <Ionicons name="arrow-back" size={26} color={colors.white} />
                    </TouchableOpacity>
                }
                centerComponent={
                    <Animated.View
                        style={[styles.headerLocationContainer, stickyOpacityStyle]}
                        pointerEvents="none"
                    >
                        <Text style={styles.headerLocationText}>{location.name}</Text>
                    </Animated.View>
                }
                rightComponent={
                    <TouchableOpacity
                        onPress={() => setLocationPickerVisible(true)}
                        style={styles.headerBtnRight}
                    >
                        <Feather name="menu" size={26} color={colors.white} />
                    </TouchableOpacity>
                }
            />
            <Animated.ScrollView
                style={[styles.flex1, { marginTop: 60 }]}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                snapToOffsets={snapOffset > 0 ? [0, snapOffset] : undefined}
                snapToStart={true}
                snapToEnd={false}
                decelerationRate="fast"
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={colors.white}
                    />
                }
            >
                {/* Hero content - centered layout */}
                <Animated.View style={[styles.heroSection, heroOpacityStyle]}>
                    {/* Location name */}
                    <TouchableOpacity
                        style={styles.locationRow}
                        onPress={() => setLocationPickerVisible(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.locationName}>{location.name}</Text>
                    </TouchableOpacity>

                    {/* Big temperature + icon row */}
                    <View style={styles.tempRow}>
                        <Text style={styles.heroTemp}>
                            {Math.round(weatherData.current.temperature2m)}
                        </Text>
                        <DegreeIcon
                            width={40}
                            height={40}
                            color={colors.white}
                            style={styles.degreeIcon}
                        />
                        {weatherIconKey === 'ClearDay' ? (
                            <AnimatedSun size={64} color={colors.white} />
                        ) : (
                            <WeatherIcon
                                name={weatherIconKey}
                                size={64}
                                color={colors.white}
                                animate={true}
                            />
                        )}
                    </View>

                    {/* Weather condition */}
                    <Text style={styles.heroCondition}>{weatherInfo.label}</Text>

                    {/* High / Low & Feels Like */}
                    {todayForecast && (
                        <Text style={styles.heroHighLow}>
                            {Math.round(todayForecast.temperature2mMax)}° /{' '}
                            {Math.round(todayForecast.temperature2mMin)}° Cảm giác như{' '}
                            {Math.round(weatherData.current.apparentTemperature)}°
                        </Text>
                    )}
                </Animated.View>

                {/* Content Cards */}
                <View
                    style={styles.contentWrapper}
                    onLayout={e => setSnapOffset(e.nativeEvent.layout.y)}
                >
                    <HourlyForecastList
                        hourlyData={weatherData.hourly}
                        conditionLabel={weatherInfo.label}
                        tempMax={todayForecast?.temperature2mMax}
                        tempMin={todayForecast?.temperature2mMin}
                    />
                    <FarmingWeatherAlert current={weatherData.current} daily={weatherData.daily} />
                    <DailyForecastList dailyData={weatherData.daily} />
                    <CurrentWeatherCard current={weatherData.current} />
                    <MoonPhaseCard />
                </View>
            </Animated.ScrollView>

            <Animated.View
                style={[styles.stickyBar, stickyOpacityStyle, { top: insets.top + 60 }]}
                pointerEvents="none"
            >
                <Text style={styles.stickyTemp}>
                    {Math.round(weatherData.current.temperature2m)}°
                </Text>

                {weatherIconKey === 'ClearDay' ? (
                    <AnimatedSun size={36} color={colors.white} />
                ) : (
                    <WeatherIcon
                        name={weatherIconKey}
                        size={36}
                        color={colors.white}
                        animate={true}
                    />
                )}

                <View style={styles.stickyMiddle}>
                    {todayForecast && (
                        <Text style={styles.stickyHighLow}>
                            {Math.round(todayForecast.temperature2mMax)}° /{' '}
                            {Math.round(todayForecast.temperature2mMin)}°
                        </Text>
                    )}
                    <Text style={styles.stickyCondition} numberOfLines={1}>
                        {weatherInfo.label}
                    </Text>
                </View>
            </Animated.View>

            <LocationPickerModal
                visible={isLocationPickerVisible}
                onClose={() => setLocationPickerVisible(false)}
                currentLocation={location}
                onSelect={newLoc => useWeatherStore.getState().setSelectedLocation(newLoc)}
            />
        </View>
    );
};

export default React.memo(WeatherScreen);

const styles = StyleSheet.create({
    flex1: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: spacing['2xl'],
    },

    bgImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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

    // ── Header Actions ──
    headerBtnLeft: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.backgroundWeather,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBtnRight: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.backgroundWeather,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Hero Section ────
    heroSection: {
        alignItems: 'center',
        paddingTop: spacing.sm,
        paddingBottom: spacing['2xl'],
    },

    locationRow: {
        marginBottom: spacing.xs,
    },

    locationName: {
        fontSize: 24,
        fontWeight: typography.fontWeight.regular,
        color: colors.white,
        textAlign: 'center',
    },

    tempRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    heroTemp: {
        fontSize: 100,
        fontWeight: '400',
        color: colors.white,
        lineHeight: 110,
        letterSpacing: -4,
    },

    tempRight: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },

    degreeIcon: {
        alignSelf: 'flex-start',
        marginLeft: -2,
        marginRight: 6,
    },

    heroCondition: {
        fontSize: 18,
        color: colors.white,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: spacing.xs,
    },

    heroHighLow: {
        fontSize: 14,
        color: colors.white,
        fontWeight: '400',
        textAlign: 'center',
        marginTop: spacing.sm,
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
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },

    retryText: {
        fontSize: typography.fontSize.sm,
        color: colors.white,
        fontWeight: typography.fontWeight.medium,
    },

    // ── Sticky Header Styles ──
    headerLocationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
    },
    headerLocationText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.white,
    },
    stickyBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        paddingHorizontal: 16, // Đồng bộ padding bằng đúng 16px
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        zIndex: 100,
    },
    stickyTemp: {
        fontSize: 48,
        fontWeight: '400',
        color: colors.white,
        letterSpacing: -1,
    },
    stickyMiddle: {
        paddingHorizontal: 8,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    stickyHighLow: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
        fontWeight: '600',
    },
    stickyCondition: {
        fontSize: 14,
        color: colors.white,
        fontWeight: '400',
    },
});
