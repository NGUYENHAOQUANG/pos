/**
 * @file weatherStore.ts
 * @description Zustand store for weather location persistence
 * @author AI Assistant
 * @created 2026-04-03
 */

import { create } from 'zustand';
import { IWeatherLocation } from '@/features/weather/types/weather.types';
import { DEFAULT_WEATHER_LOCATION } from '@/features/weather/utils/weatherLocations';

interface WeatherState {
    readonly selectedLocation: IWeatherLocation;
    readonly setSelectedLocation: (location: IWeatherLocation) => void;
}

export const useWeatherStore = create<WeatherState>(set => ({
    selectedLocation: DEFAULT_WEATHER_LOCATION,
    setSelectedLocation: (location: IWeatherLocation) => set({ selectedLocation: location }),
}));
