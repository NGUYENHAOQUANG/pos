import { useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { WeatherNotificationService } from '@/features/weather/services/weatherNotification.service';
import { weatherApi } from '@/features/weather/api/weatherApi';
import { IWeatherData, IWeatherLocation } from '@/features/weather/types/weather.types';

/** 15 minutes in milliseconds */
const REFETCH_INTERVAL = 15 * 60 * 1000;

/** 10 minutes stale time */
const STALE_TIME = 10 * 60 * 1000;

export const weatherKeys = {
    all: ['weather'] as const,
    forecast: (lat: number, lon: number) => [...weatherKeys.all, 'forecast', lat, lon] as const,
};

/**
 * Hook to fetch weather forecast for a given location
 * Auto-refreshes every 15 minutes for near real-time data
 */
export const useWeatherForecast = (
    location: IWeatherLocation | null,
    options?: { enableNotify?: boolean }
) => {
    const query = useQuery<IWeatherData>({
        queryKey: weatherKeys.forecast(location?.latitude ?? 0, location?.longitude ?? 0),
        queryFn: () => weatherApi.getWeatherForecast(location!.latitude, location!.longitude),
        enabled: !!location,
        refetchInterval: REFETCH_INTERVAL,
        staleTime: STALE_TIME,
        retry: 2,
        placeholderData: keepPreviousData,
    });

    useEffect(() => {
        if (options?.enableNotify) {
            WeatherNotificationService.initialize().catch(() => {
                // Ignore permission silently if user denies it
                console.log('Push notification permission denied / ignored.');
            });
        }
    }, [options?.enableNotify]);

    useEffect(() => {
        if (query.data && options?.enableNotify) {
            WeatherNotificationService.checkAndNotify(query.data.current, query.data.daily).catch(
                console.error
            );
        }
    }, [query.data, query.data?.current.time, options?.enableNotify]);

    return query;
};
