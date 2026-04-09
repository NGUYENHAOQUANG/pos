import { IWeatherCodeInfo } from '@/features/weather/types/weather.types';

/**
 * WMO Weather interpretation codes (WW)
 * icon values are SVG component keys matching files in @/assets/Icon/IconWeather/
 * Available icons: ClearDay, ClearNight, PartlyCloudy, CloudyNight, LightRain, HeavyRain, Snow, Thunderstorm
 * @see https://open-meteo.com/en/docs
 */
export const WEATHER_CODES: Readonly<Record<number, IWeatherCodeInfo>> = {
    0: { label: 'Trời quang', icon: 'ClearDay' },
    1: { label: 'Gần quang', icon: 'ClearDay' },
    2: { label: 'Có mây', icon: 'PartlyCloudy' },
    3: { label: 'Nhiều mây', icon: 'PartlyCloudy' },
    45: { label: 'Sương mù', icon: 'PartlyCloudy' },
    48: { label: 'Sương mù đóng băng', icon: 'PartlyCloudy' },
    51: { label: 'Mưa phùn nhẹ', icon: 'LightRain' },
    53: { label: 'Mưa phùn', icon: 'LightRain' },
    55: { label: 'Mưa phùn dày', icon: 'LightRain' },
    56: { label: 'Mưa phùn đóng băng', icon: 'LightRain' },
    57: { label: 'Mưa phùn đóng băng dày', icon: 'LightRain' },
    61: { label: 'Mưa nhỏ', icon: 'LightRain' },
    63: { label: 'Mưa vừa', icon: 'HeavyRain' },
    65: { label: 'Mưa to', icon: 'HeavyRain' },
    66: { label: 'Mưa đóng băng nhẹ', icon: 'LightRain' },
    67: { label: 'Mưa đóng băng nặng', icon: 'HeavyRain' },
    71: { label: 'Tuyết nhẹ', icon: 'Snow' },
    73: { label: 'Tuyết vừa', icon: 'Snow' },
    75: { label: 'Tuyết nặng', icon: 'Snow' },
    77: { label: 'Hạt tuyết', icon: 'Snow' },
    80: { label: 'Mưa rào nhẹ', icon: 'LightRain' },
    81: { label: 'Mưa rào vừa', icon: 'HeavyRain' },
    82: { label: 'Mưa rào mạnh', icon: 'Thunderstorm' },
    85: { label: 'Mưa tuyết nhẹ', icon: 'Snow' },
    86: { label: 'Mưa tuyết nặng', icon: 'Snow' },
    95: { label: 'Giông bão', icon: 'Thunderstorm' },
    96: { label: 'Giông có mưa đá nhẹ', icon: 'Thunderstorm' },
    99: { label: 'Giông có mưa đá nặng', icon: 'Thunderstorm' },
};

const DEFAULT_WEATHER_INFO: IWeatherCodeInfo = {
    label: 'Không xác định',
    icon: 'PartlyCloudy',
};

/** Get weather info from WMO code */
export const getWeatherInfo = (code: number): IWeatherCodeInfo => {
    return WEATHER_CODES[code] ?? DEFAULT_WEATHER_INFO;
};

/** Get icon key with night-time variant */
export const getWeatherIconKey = (code: number, isDay: boolean): string => {
    // Clear night
    if (!isDay && code <= 1) {
        return 'ClearNight';
    }
    // Cloudy at night uses the CloudyNight icon
    if (!isDay && (code === 2 || code === 3)) {
        return 'CloudyNight';
    }
    return getWeatherInfo(code).icon;
};
