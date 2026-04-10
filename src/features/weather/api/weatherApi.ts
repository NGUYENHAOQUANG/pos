import axios from 'axios';
import {
    IWeatherData,
    ICurrentWeather,
    IHourlyForecast,
    IDailyForecast,
    IWeatherApiFullResponse,
    IWeatherApiForecastDay,
} from '@/features/weather/types/weather.types';
import { WEATHER_API_KEY, WEATHER_API_BASE_URL } from '@env';

/** Max hours to show in hourly forecast */
const HOURLY_FORECAST_HOURS = 24;

const mapWeatherApiCodeToWMO = (code: number): number => {
    switch (code) {
        case 1000:
            return 0; // Clear
        case 1003:
            return 2; // Partly cloudy
        case 1006:
            return 3; // Cloudy
        case 1009:
            return 3; // Overcast
        case 1030:
            return 45; // Mist
        case 1135:
            return 45; // Fog
        case 1148:
            return 48; // Freezing fog
        case 1063:
            return 51; // Patchy rain possible
        case 1180:
            return 61; // Patchy light rain
        case 1183:
            return 61; // Light rain
        case 1186:
            return 63; // Moderate rain at times
        case 1189:
            return 63; // Moderate rain
        case 1192:
            return 65; // Heavy rain at times
        case 1195:
            return 65; // Heavy rain
        case 1198:
            return 66; // Light freezing rain
        case 1201:
            return 67; // Moderate or heavy freezing rain
        case 1069:
            return 71; // Patchy sleet possible
        case 1204:
            return 71; // Light sleet
        case 1207:
            return 73; // Moderate or heavy sleet
        case 1066:
            return 71; // Patchy snow possible
        case 1210:
            return 71; // Patchy light snow
        case 1213:
            return 71; // Light snow
        case 1216:
            return 73; // Patchy moderate snow
        case 1219:
            return 73; // Moderate snow
        case 1222:
            return 75; // Patchy heavy snow
        case 1225:
            return 75; // Heavy snow
        case 1237:
            return 77; // Ice pellets
        case 1240:
            return 80; // Light rain shower
        case 1243:
            return 81; // Moderate or heavy rain shower
        case 1246:
            return 82; // Torrential rain shower
        case 1249:
            return 85; // Light sleet showers
        case 1252:
            return 86; // Moderate or heavy sleet showers
        case 1255:
            return 85; // Light snow showers
        case 1258:
            return 86; // Moderate or heavy snow showers
        case 1261:
            return 85; // Light showers of ice pellets
        case 1264:
            return 86; // Moderate or heavy showers of ice pellets
        case 1087:
            return 95; // Thundery outbreaks possible
        case 1273:
            return 95; // Patchy light rain with thunder
        case 1276:
            return 95; // Moderate or heavy rain with thunder
        case 1279:
            return 95; // Patchy light snow with thunder
        case 1282:
            return 95; // Moderate or heavy snow with thunder
        default:
            return 0;
    }
};

export const weatherApi = {
    getWeatherForecast: async (latitude: number, longitude: number): Promise<IWeatherData> => {
        if (!WEATHER_API_KEY) {
            console.warn('Missing WEATHER_API_KEY trong file .env!');
        }

        const response = await axios.get<IWeatherApiFullResponse>(WEATHER_API_BASE_URL, {
            params: {
                key: WEATHER_API_KEY,
                q: `${latitude},${longitude}`,
                days: 7,
                aqi: 'no',
                alerts: 'no',
                lang: 'vi',
            },
            timeout: 10000,
        });

        const data = response.data;
        const currentRaw = data.current;
        const forecastDays = data.forecast.forecastday;

        const parsedCurrent: ICurrentWeather = {
            time: currentRaw.last_updated,
            temperature2m: currentRaw.temp_c,
            relativeHumidity2m: currentRaw.humidity,
            apparentTemperature: currentRaw.feelslike_c,
            isDay: currentRaw.is_day,
            rain: currentRaw.precip_mm,
            weatherCode: mapWeatherApiCodeToWMO(currentRaw.condition.code),
            windSpeed10m: currentRaw.wind_kph,
            windDirection10m: currentRaw.wind_degree,
            pressure: currentRaw.pressure_mb,
        };

        const parsedHourly: IHourlyForecast[] = [];
        const nowMs = Date.now();
        for (const fDay of forecastDays) {
            for (const hour of fDay.hour) {
                const hourTimeMs = hour.time_epoch * 1000;
                if (hourTimeMs >= nowMs - 3600000 && parsedHourly.length < HOURLY_FORECAST_HOURS) {
                    parsedHourly.push({
                        time: hour.time,
                        temperature2m: hour.temp_c,
                        relativeHumidity2m: hour.humidity,
                        rain: hour.precip_mm,
                        weatherCode: mapWeatherApiCodeToWMO(hour.condition.code),
                        windSpeed10m: hour.wind_kph,
                        chanceOfRain: hour.chance_of_rain,
                        isDay: hour.is_day,
                    });
                }
            }
        }

        const parsedDaily: IDailyForecast[] = forecastDays.map((fDay: IWeatherApiForecastDay) => {
            return {
                time: fDay.date,
                weatherCode: mapWeatherApiCodeToWMO(fDay.day.condition.code),
                temperature2mMax: fDay.day.maxtemp_c,
                temperature2mMin: fDay.day.mintemp_c,
                rainSum: fDay.day.totalprecip_mm,
                windSpeed10mMax: fDay.day.maxwind_kph,
                sunrise: fDay.astro.sunrise,
                sunset: fDay.astro.sunset,
                uvIndexMax: fDay.day.uv,
            };
        });

        return {
            current: parsedCurrent,
            hourly: parsedHourly,
            daily: parsedDaily,
            lastUpdated: new Date().toISOString(),
        };
    },
};
