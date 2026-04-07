import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Colors, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { ICurrentWeather } from '@/features/weather/types/weather.types';
import MapPinIcon from '@/assets/Icon/IconWeather/IconTag/MapPin.svg';
import AntDesign from 'react-native-vector-icons/AntDesign';

// Weather tag icons
import SunIcon from '@/assets/Icon/IconWeather/IconTag/Sun.svg';
import MoonIcon from '@/assets/Icon/IconWeather/IconTag/Moon.svg';
import MoonStarsIcon from '@/assets/Icon/IconWeather/IconTag/MoonStars.svg';
import CloudSunIcon from '@/assets/Icon/IconWeather/IconTag/CloudSun.svg';
import CloudMoonIcon from '@/assets/Icon/IconWeather/IconTag/CloudMoon.svg';
import CloudRainIcon from '@/assets/Icon/IconWeather/IconTag/CloudRain.svg';
import CloudLightningIcon from '@/assets/Icon/IconWeather/IconTag/CloudLightning.svg';
import WindIcon from '@/assets/Icon/IconWeather/IconTag/Wind.svg';
import TornadoIcon from '@/assets/Icon/IconWeather/IconTag/Tornado.svg';
import DegreeIcon from '@/assets/Icon/IconWeather/IconTag/o.svg';
import { SvgProps } from 'react-native-svg';

/** Tag icon size */
const TAG_ICON_SIZE = 16;

type SvgComponent = React.FC<SvgProps>;

/**
 * Map WMO weather code + day/night to the appropriate tag SVG icon
 * @see https://open-meteo.com/en/docs (WMO Weather interpretation codes)
 */
function getWeatherTagIcon(weatherCode: number, isDay: boolean): SvgComponent {
    // Clear sky
    if (weatherCode === 0) {
        return isDay ? SunIcon : MoonIcon;
    }

    // Mainly clear / partly cloudy
    if (weatherCode >= 1 && weatherCode <= 2) {
        return isDay ? CloudSunIcon : CloudMoonIcon;
    }

    // Overcast
    if (weatherCode === 3) {
        return WindIcon;
    }

    // Fog
    if (weatherCode === 45 || weatherCode === 48) {
        return WindIcon;
    }

    // Drizzle (light to moderate)
    if (weatherCode >= 51 && weatherCode <= 55) {
        return CloudRainIcon;
    }

    // Freezing drizzle
    if (weatherCode >= 56 && weatherCode <= 57) {
        return CloudRainIcon;
    }

    // Rain (light to heavy)
    if (weatherCode >= 61 && weatherCode <= 67) {
        return CloudRainIcon;
    }

    // Snow
    if (weatherCode >= 71 && weatherCode <= 77) {
        return CloudRainIcon;
    }

    // Rain showers (light/moderate)
    if (weatherCode >= 80 && weatherCode <= 81) {
        return CloudRainIcon;
    }

    // Heavy rain showers
    if (weatherCode === 82) {
        return CloudLightningIcon;
    }

    // Snow showers
    if (weatherCode >= 85 && weatherCode <= 86) {
        return CloudRainIcon;
    }

    // Thunderstorm (no hail)
    if (weatherCode === 95) {
        return CloudLightningIcon;
    }

    // Thunderstorm with hail — severe warning
    if (weatherCode === 96 || weatherCode === 99) {
        return TornadoIcon;
    }

    // Default: sun for day, moon for night
    return isDay ? SunIcon : MoonStarsIcon;
}

interface WeatherWidgetProps {
    readonly current: ICurrentWeather;
    readonly locationName?: string;
    readonly onPress?: () => void;
}

/**
 * Compact pill-shaped weather widget for farm header
 * Shows: MapPin + location + temperature + dynamic weather icon + chevron
 */
const WeatherWidget: React.FC<WeatherWidgetProps> = ({ current, locationName, onPress }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const isDay = current.isDay === 1;
    const WeatherTagIcon = getWeatherTagIcon(current.weatherCode, isDay);

    const content = (
        <View style={styles.container}>
            <MapPinIcon width={16} height={16} color={theme.textSecondary} />
            <Text style={styles.location} numberOfLines={1}>
                {locationName || '---'}
            </Text>
            <Text style={styles.dash}>-</Text>
            <Text style={styles.temp}>{Math.round(current.temperature2m)}</Text>
            <DegreeIcon
                width={5}
                height={5}
                color={theme.textSecondary}
                style={{ marginBottom: 8 }}
            />
            <WeatherTagIcon width={TAG_ICON_SIZE} height={TAG_ICON_SIZE} />
            <AntDesign name="right" size={12} color={theme.textSecondary} />
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
            backgroundColor: theme.background,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: theme.border,
            paddingHorizontal: 12,
            height: 28,
            gap: 4,
        },

        location: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.text,
            maxWidth: 80,
        },

        dash: {
            fontSize: 13,
            color: theme.textSecondary,
        },

        temp: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.text,
        },
    });
