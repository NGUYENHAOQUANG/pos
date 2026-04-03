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
