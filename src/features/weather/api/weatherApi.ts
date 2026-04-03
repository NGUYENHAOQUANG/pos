/**
 * @file weatherApi.ts
 * @description Open-Meteo API client - no API key required
 * @author AI Assistant
 * @created 2026-04-03
 */

import axios from 'axios';
import {
    IOpenMeteoFullResponse,
    IWeatherData,
    ICurrentWeather,
    IHourlyForecast,
    IDailyForecast,
} from '@/features/weather/types/weather.types';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/** Max hours to show in hourly forecast */
const HOURLY_FORECAST_HOURS = 24;

/**
 * Parse raw Open-Meteo response into app-friendly format
 */
const parseCurrentWeather = (raw: IOpenMeteoFullResponse['current']): ICurrentWeather => ({
    time: raw.time,
    temperature2m: raw.temperature_2m,
    relativeHumidity2m: raw.relative_humidity_2m,
    apparentTemperature: raw.apparent_temperature,
    isDay: raw.is_day,
    rain: raw.rain,
    weatherCode: raw.weather_code,
    windSpeed10m: raw.wind_speed_10m,
    windDirection10m: raw.wind_direction_10m,
    pressure: raw.surface_pressure,
});

const parseHourlyForecast = (raw: IOpenMeteoFullResponse['hourly']): IHourlyForecast[] => {
    const now = new Date();
    const items: IHourlyForecast[] = [];

    for (let i = 0; i < raw.time.length && items.length < HOURLY_FORECAST_HOURS; i++) {
        const forecastTime = new Date(raw.time[i]);
        // Only include future hours
        if (forecastTime >= now) {
            items.push({
                time: raw.time[i],
                temperature2m: raw.temperature_2m[i],
                relativeHumidity2m: raw.relative_humidity_2m[i],
                rain: raw.rain[i],
                weatherCode: raw.weather_code[i],
                windSpeed10m: raw.wind_speed_10m[i],
            });
        }
    }

    return items;
};

const parseDailyForecast = (raw: IOpenMeteoFullResponse['daily']): IDailyForecast[] => {
    return raw.time.map((time, index) => ({
        time,
        weatherCode: raw.weather_code[index],
        temperature2mMax: raw.temperature_2m_max[index],
        temperature2mMin: raw.temperature_2m_min[index],
        rainSum: raw.rain_sum[index],
        windSpeed10mMax: raw.wind_speed_10m_max[index],
        sunrise: raw.sunrise[index],
        sunset: raw.sunset[index],
        uvIndexMax: raw.uv_index_max[index],
    }));
};

export const weatherApi = {
    /**
     * Fetch full weather data (current + hourly + daily)
     * Open-Meteo is free, no API key needed
     */
    getWeatherForecast: async (latitude: number, longitude: number): Promise<IWeatherData> => {
        const response = await axios.get<IOpenMeteoFullResponse>(OPEN_METEO_BASE_URL, {
            params: {
                latitude,
                longitude,
                current: [
                    'temperature_2m',
                    'relative_humidity_2m',
                    'apparent_temperature',
                    'is_day',
                    'rain',
                    'weather_code',
                    'wind_speed_10m',
                    'wind_direction_10m',
                    'surface_pressure',
                ].join(','),
                hourly: [
                    'temperature_2m',
                    'relative_humidity_2m',
                    'rain',
                    'weather_code',
                    'wind_speed_10m',
                ].join(','),
                daily: [
                    'weather_code',
                    'temperature_2m_max',
                    'temperature_2m_min',
                    'rain_sum',
                    'wind_speed_10m_max',
                    'sunrise',
                    'sunset',
                    'uv_index_max',
                ].join(','),
                timezone: 'Asia/Ho_Chi_Minh',
                forecast_days: 7,
            },
            timeout: 10000,
        });

        const data = response.data;

        return {
            current: parseCurrentWeather(data.current),
            hourly: parseHourlyForecast(data.hourly),
            daily: parseDailyForecast(data.daily),
            lastUpdated: new Date().toISOString(),
        };
    },
};
