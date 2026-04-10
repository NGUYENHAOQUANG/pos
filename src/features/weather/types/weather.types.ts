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
    readonly chanceOfRain?: number;
    readonly isDay: number;
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

/** WeatherAPI condition object */
export interface IWeatherApiCondition {
    readonly code: number;
    readonly text: string;
    readonly icon: string;
}

/** WeatherAPI current response */
export interface IWeatherApiCurrent {
    readonly last_updated: string;
    readonly temp_c: number;
    readonly humidity: number;
    readonly feelslike_c: number;
    readonly is_day: number;
    readonly precip_mm: number;
    readonly condition: IWeatherApiCondition;
    readonly wind_kph: number;
    readonly wind_degree: number;
    readonly pressure_mb: number;
}

/** WeatherAPI hourly item */
export interface IWeatherApiHour {
    readonly time: string;
    readonly time_epoch: number;
    readonly temp_c: number;
    readonly humidity: number;
    readonly precip_mm: number;
    readonly condition: IWeatherApiCondition;
    readonly wind_kph: number;
    readonly chance_of_rain: number;
    readonly is_day: number;
}

/** WeatherAPI daily day summary */
export interface IWeatherApiDay {
    readonly maxtemp_c: number;
    readonly mintemp_c: number;
    readonly totalprecip_mm: number;
    readonly maxwind_kph: number;
    readonly uv: number;
    readonly condition: IWeatherApiCondition;
}

/** WeatherAPI astro data */
export interface IWeatherApiAstro {
    readonly sunrise: string;
    readonly sunset: string;
}

/** WeatherAPI forecast day */
export interface IWeatherApiForecastDay {
    readonly date: string;
    readonly day: IWeatherApiDay;
    readonly astro: IWeatherApiAstro;
    readonly hour: readonly IWeatherApiHour[];
}

/** WeatherAPI full response */
export interface IWeatherApiFullResponse {
    readonly current: IWeatherApiCurrent;
    readonly forecast: {
        readonly forecastday: readonly IWeatherApiForecastDay[];
    };
}

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
