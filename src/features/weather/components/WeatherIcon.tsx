import React from 'react';
import { SvgProps } from 'react-native-svg';

// Weather condition icons
import ClearDay from '@/assets/Icon/IconWeather/ClearDay.svg';
import ClearNight from '@/assets/Icon/IconWeather/ClearNight.svg';
import PartlyCloudy from '@/assets/Icon/IconWeather/PartlyCloudy.svg';
import Cloudy from '@/assets/Icon/IconWeather/Cloudy.svg';
import Fog from '@/assets/Icon/IconWeather/Fog.svg';
import LightRain from '@/assets/Icon/IconWeather/LightRain.svg';
import Rain from '@/assets/Icon/IconWeather/Rain.svg';
import HeavyRain from '@/assets/Icon/IconWeather/HeavyRain.svg';
import Snow from '@/assets/Icon/IconWeather/Snow.svg';
import Snowflake from '@/assets/Icon/IconWeather/Snowflake.svg';
import Thunderstorm from '@/assets/Icon/IconWeather/Thunderstorm.svg';

// Metric icons
import Thermometer from '@/assets/Icon/IconWeather/Thermometer.svg';
import Humidity from '@/assets/Icon/IconWeather/Humidity.svg';
import Wind from '@/assets/Icon/IconWeather/Wind.svg';
import Raindrop from '@/assets/Icon/IconWeather/Raindrop.svg';
import Pressure from '@/assets/Icon/IconWeather/Pressure.svg';

// Alert icons
import Fire from '@/assets/Icon/IconWeather/Fire.svg';
import Cold from '@/assets/Icon/IconWeather/Cold.svg';
import Lightning from '@/assets/Icon/IconWeather/Lightning.svg';
import Tornado from '@/assets/Icon/IconWeather/Tornado.svg';
import CheckCircle from '@/assets/Icon/IconWeather/CheckCircle.svg';
import Warning from '@/assets/Icon/IconWeather/Warning.svg';
import Info from '@/assets/Icon/IconWeather/Info.svg';

/** All available weather icon keys */
export type WeatherIconKey =
    | 'ClearDay'
    | 'ClearNight'
    | 'PartlyCloudy'
    | 'Cloudy'
    | 'Fog'
    | 'LightRain'
    | 'Rain'
    | 'HeavyRain'
    | 'Snow'
    | 'Snowflake'
    | 'Thunderstorm'
    | 'Thermometer'
    | 'Humidity'
    | 'Wind'
    | 'Raindrop'
    | 'Pressure'
    | 'Fire'
    | 'Cold'
    | 'Lightning'
    | 'Tornado'
    | 'CheckCircle'
    | 'Warning'
    | 'Info';

/** SVG component map */
const ICON_MAP: Record<WeatherIconKey, React.FC<SvgProps>> = {
    ClearDay,
    ClearNight,
    PartlyCloudy,
    Cloudy,
    Fog,
    LightRain,
    Rain,
    HeavyRain,
    Snow,
    Snowflake,
    Thunderstorm,
    Thermometer,
    Humidity,
    Wind,
    Raindrop,
    Pressure,
    Fire,
    Cold,
    Lightning,
    Tornado,
    CheckCircle,
    Warning,
    Info,
};

interface WeatherIconProps extends SvgProps {
    readonly name: string;
    readonly size?: number;
}

/** Renders a weather SVG icon by key name */
const WeatherIcon: React.FC<WeatherIconProps> = ({ name, size = 24, color, ...rest }) => {
    const IconComponent = ICON_MAP[name as WeatherIconKey];

    if (!IconComponent) {
        // Fallback to Cloudy if key not found
        const Fallback = ICON_MAP.Cloudy;
        return <Fallback width={size} height={size} color={color} {...rest} />;
    }

    return <IconComponent width={size} height={size} color={color} {...rest} />;
};

export default WeatherIcon;
