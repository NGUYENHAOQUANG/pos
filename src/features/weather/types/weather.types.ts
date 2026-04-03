/**
 * @file weather.types.ts
 * @description Weather forecast type definitions for Open-Meteo API
 * @author AI Assistant
 * @created 2026-04-03
 */

/** Weather code mapping from WMO standard */
export interface IWeatherCodeInfo {
    readonly label: string;
    readonly icon: string;
}

/** Current weather data from Open-Meteo */
export interface ICurrentWeather {
    readonly time: string;
    readonly temperature2m: number;
    readonly relativeHumidity2m: number;
    readonly apparentTemperature: number;
    readonly isDay: number;
    readonly rain: number;
    readonly weatherCode: number;
    readonly windSpeed10m: number;
    readonly windDirection10m: number;
    readonly pressure: number;
}

/** Hourly forecast item */
export interface IHourlyForecast {
    readonly time: string;
    readonly temperature2m: number;
    readonly relativeHumidity2m: number;
    readonly rain: number;
    readonly weatherCode: number;
    readonly windSpeed10m: number;
}

/** Daily forecast item */
export interface IDailyForecast {
    readonly time: string;
    readonly weatherCode: number;
    readonly temperature2mMax: number;
    readonly temperature2mMin: number;
    readonly rainSum: number;
    readonly windSpeed10mMax: number;
    readonly sunrise: string;
    readonly sunset: string;
    readonly uvIndexMax: number;
}

/** Raw API response from Open-Meteo */
export interface IOpenMeteoCurrentResponse {
    readonly current: {
        readonly time: string;
        readonly temperature_2m: number;
        readonly relative_humidity_2m: number;
        readonly apparent_temperature: number;
        readonly is_day: number;
        readonly rain: number;
        readonly weather_code: number;
        readonly wind_speed_10m: number;
        readonly wind_direction_10m: number;
        readonly surface_pressure: number;
    };
}

export interface IOpenMeteoHourlyResponse {
    readonly hourly: {
        readonly time: readonly string[];
        readonly temperature_2m: readonly number[];
        readonly relative_humidity_2m: readonly number[];
        readonly rain: readonly number[];
        readonly weather_code: readonly number[];
        readonly wind_speed_10m: readonly number[];
    };
}

export interface IOpenMeteoDailyResponse {
    readonly daily: {
        readonly time: readonly string[];
        readonly weather_code: readonly number[];
        readonly temperature_2m_max: readonly number[];
        readonly temperature_2m_min: readonly number[];
        readonly rain_sum: readonly number[];
        readonly wind_speed_10m_max: readonly number[];
        readonly sunrise: readonly string[];
        readonly sunset: readonly string[];
        readonly uv_index_max: readonly number[];
    };
}

export interface IOpenMeteoFullResponse
    extends IOpenMeteoCurrentResponse,
        IOpenMeteoHourlyResponse,
        IOpenMeteoDailyResponse {}

/** Parsed weather data for UI consumption */
export interface IWeatherData {
    readonly current: ICurrentWeather;
    readonly hourly: readonly IHourlyForecast[];
    readonly daily: readonly IDailyForecast[];
    readonly lastUpdated: string;
}

/** Location coordinates for weather query */
export interface IWeatherLocation {
    readonly latitude: number;
    readonly longitude: number;
    readonly name?: string;
}
