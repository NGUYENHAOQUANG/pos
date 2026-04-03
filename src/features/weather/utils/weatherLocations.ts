/**
 * @file weatherLocations.ts
 * @description Predefined shrimp farming provinces in Vietnam with coordinates
 * @author AI Assistant
 * @created 2026-04-03
 */

import { IWeatherLocation } from '@/features/weather/types/weather.types';

/**
 * Popular shrimp farming provinces in Vietnam
 * Coordinates point to the province center
 */
export const WEATHER_LOCATIONS: readonly IWeatherLocation[] = [
    { latitude: 9.2941, longitude: 105.7216, name: 'Bạc Liêu' },
    { latitude: 9.1527, longitude: 105.1524, name: 'Cà Mau' },
    { latitude: 9.784, longitude: 105.4714, name: 'Sóc Trăng' },
    { latitude: 9.9347, longitude: 105.3544, name: 'Trà Vinh' },
    { latitude: 10.0452, longitude: 105.7469, name: 'Cần Thơ' },
    { latitude: 10.2476, longitude: 106.3755, name: 'Bến Tre' },
    { latitude: 10.0089, longitude: 105.0818, name: 'Kiên Giang' },
    { latitude: 10.3598, longitude: 106.6297, name: 'TP. Hồ Chí Minh' },
    { latitude: 10.9413, longitude: 106.8565, name: 'Bình Dương' },
    { latitude: 10.5417, longitude: 107.4329, name: 'Bà Rịa - Vũng Tàu' },
    { latitude: 11.9404, longitude: 108.4583, name: 'Lâm Đồng' },
    { latitude: 12.2388, longitude: 109.1967, name: 'Khánh Hòa' },
    { latitude: 13.0827, longitude: 109.2757, name: 'Phú Yên' },
    { latitude: 15.9752, longitude: 108.2533, name: 'Quảng Nam' },
    { latitude: 16.0544, longitude: 108.2022, name: 'Đà Nẵng' },
    { latitude: 16.4637, longitude: 107.5909, name: 'Thừa Thiên Huế' },
    { latitude: 18.6791, longitude: 105.6813, name: 'Nghệ An' },
    { latitude: 20.8449, longitude: 106.6881, name: 'Hải Phòng' },
    { latitude: 20.9373, longitude: 106.3145, name: 'Thái Bình' },
    { latitude: 20.4388, longitude: 106.1621, name: 'Nam Định' },
    { latitude: 21.0285, longitude: 105.8542, name: 'Hà Nội' },
] as const;

/**
 * Default location (first in list)
 */
export const DEFAULT_WEATHER_LOCATION: IWeatherLocation = WEATHER_LOCATIONS[0];
