/**
 * @file weatherCodes.ts
 * @description WMO Weather Code mapping to labels and icons
 * @author AI Assistant
 * @created 2026-04-03
 */

import { IWeatherCodeInfo } from '@/features/weather/types/weather.types';

/**
 * WMO Weather interpretation codes (WW)
 * @see https://open-meteo.com/en/docs
 */
export const WEATHER_CODES: Readonly<Record<number, IWeatherCodeInfo>> = {
    0: { label: 'Trời quang', icon: '☀️' },
    1: { label: 'Gần quang', icon: '🌤️' },
    2: { label: 'Có mây', icon: '⛅' },
    3: { label: 'Nhiều mây', icon: '☁️' },
    45: { label: 'Sương mù', icon: '🌫️' },
    48: { label: 'Sương mù đóng băng', icon: '🌫️' },
    51: { label: 'Mưa phùn nhẹ', icon: '🌦️' },
    53: { label: 'Mưa phùn', icon: '🌦️' },
    55: { label: 'Mưa phùn dày', icon: '🌧️' },
    56: { label: 'Mưa phùn đóng băng', icon: '🌧️' },
    57: { label: 'Mưa phùn đóng băng dày', icon: '🌧️' },
    61: { label: 'Mưa nhỏ', icon: '🌦️' },
    63: { label: 'Mưa vừa', icon: '🌧️' },
    65: { label: 'Mưa to', icon: '🌧️' },
    66: { label: 'Mưa đóng băng nhẹ', icon: '🌧️' },
    67: { label: 'Mưa đóng băng nặng', icon: '🌧️' },
    71: { label: 'Tuyết nhẹ', icon: '🌨️' },
    73: { label: 'Tuyết vừa', icon: '🌨️' },
    75: { label: 'Tuyết nặng', icon: '❄️' },
    77: { label: 'Hạt tuyết', icon: '❄️' },
    80: { label: 'Mưa rào nhẹ', icon: '🌦️' },
    81: { label: 'Mưa rào vừa', icon: '🌧️' },
    82: { label: 'Mưa rào mạnh', icon: '⛈️' },
    85: { label: 'Mưa tuyết nhẹ', icon: '🌨️' },
    86: { label: 'Mưa tuyết nặng', icon: '🌨️' },
    95: { label: 'Giông bão', icon: '⛈️' },
    96: { label: 'Giông có mưa đá nhẹ', icon: '⛈️' },
    99: { label: 'Giông có mưa đá nặng', icon: '⛈️' },
};

const DEFAULT_WEATHER_INFO: IWeatherCodeInfo = {
    label: 'Không xác định',
    icon: '🌡️',
};

/**
 * Get weather info from WMO code
 */
export const getWeatherInfo = (code: number): IWeatherCodeInfo => {
    return WEATHER_CODES[code] ?? DEFAULT_WEATHER_INFO;
};

/**
 * Get night-time icon variant (use moon instead of sun)
 */
export const getWeatherIcon = (code: number, isDay: boolean): string => {
    if (!isDay && code <= 1) {
        return '🌙';
    }
    return getWeatherInfo(code).icon;
};
