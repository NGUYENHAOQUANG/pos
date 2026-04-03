/**
 * @file useWeatherForecast.ts
 * @description React Query hook for weather forecast data
 * @author AI Assistant
 * @created 2026-04-03
 */

import { useQuery } from '@tanstack/react-query';
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
export const useWeatherForecast = (location: IWeatherLocation | null) => {
    return useQuery<IWeatherData>({
        queryKey: weatherKeys.forecast(location?.latitude ?? 0, location?.longitude ?? 0),
        queryFn: () => weatherApi.getWeatherForecast(location!.latitude, location!.longitude),
        enabled: !!location,
        refetchInterval: REFETCH_INTERVAL,
        staleTime: STALE_TIME,
        retry: 2,
    });
};
