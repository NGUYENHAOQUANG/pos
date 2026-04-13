import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNewsData } from '@/features/menu/services/newsService';
import { NewsItem } from '@/features/menu/types/news.types';

const CACHE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const CACHE_PREFIX = 'MEBI_NEWS_CACHE_V2_';

interface CachedNewsData {
    timestamp: number;
    data: NewsItem[];
}

/** Load cached news data. Returns null if expired or corrupted */
const loadCachedNews = async (cacheKey: string): Promise<NewsItem[] | null> => {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (!raw) return null;

    try {
        const parsed: CachedNewsData = JSON.parse(raw);
        const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION_MS;

        if (isExpired || !parsed.data || parsed.data.length === 0) return null;
        return parsed.data;
    } catch {
        // Remove corrupted cache entry to prevent repeated failures
        await AsyncStorage.removeItem(cacheKey);
        return null;
    }
};

/** Save news data to AsyncStorage cache */
const saveNewsCache = async (cacheKey: string, data: NewsItem[]): Promise<void> => {
    const payload: CachedNewsData = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(payload));
};

/** Hook to fetch news with cache-first strategy using React Query */
export const useNews = (activeTab: string) => {
    const cacheKey = `${CACHE_PREFIX}${activeTab}`;

    return useQuery<NewsItem[]>({
        queryKey: ['news', activeTab],
        queryFn: async () => {
            // 1. Try valid cache first
            const cached = await loadCachedNews(cacheKey);
            if (cached) return cached;

            // 2. Fetch fresh data
            const freshData = await fetchNewsData(activeTab);
            await saveNewsCache(cacheKey, freshData);
            return freshData;
        },
        staleTime: CACHE_DURATION_MS,
        // Only fetch when news tab is active
        enabled: activeTab === 'Tin tức nổi bật',
    });
};
