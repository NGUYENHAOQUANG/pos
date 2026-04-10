import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchShrimpPriceData } from '@/features/menu/services/shrimpPriceService';
import { ShrimpPrice } from '@/features/menu/types/shrimpPrice.types';

const CACHE_KEY = '@shrimp_price_cache_v3';
const STALE_TIME_MS = 24 * 60 * 60 * 1000;

interface CachedPriceData {
    timestamp: number;
    data: ShrimpPrice[];
}

const cacheData = async (data: ShrimpPrice[]): Promise<void> => {
    const payload: CachedPriceData = { timestamp: Date.now(), data };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
};

const loadCachedData = async (ignoreExpiration = false): Promise<ShrimpPrice[] | null> => {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed: CachedPriceData = JSON.parse(raw);
    const isExpired = Date.now() - parsed.timestamp > STALE_TIME_MS;

    if (isExpired && !ignoreExpiration) return null;
    return parsed.data;
};

export const useShrimpPrice = () => {
    return useQuery<ShrimpPrice[]>({
        queryKey: ['shrimpPrice', '4'],
        queryFn: async () => {
            const validCache = await loadCachedData();
            if (validCache) return validCache;

            try {
                const data = await fetchShrimpPriceData();
                await cacheData(data);
                return data;
            } catch (error) {
                const staleCache = await loadCachedData(true);
                if (staleCache) return staleCache;
                throw error;
            }
        },
        staleTime: STALE_TIME_MS,
    });
};
