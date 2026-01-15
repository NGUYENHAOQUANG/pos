import { StateCreator } from 'zustand';
import { SeasonData, DropdownItem } from '@/features/farm/types/farm.types';
import { seasonApi } from '@/features/farm/api/seasonApi';

export interface SeasonStore {
    seasons: SeasonData[];
    isLoadingSeasons: boolean;
    selectedSeasonId: string | null;
    fetchSeasons: (zones?: { id: number | string; code?: string }[]) => Promise<void>;
    setSelectedSeasonId: (id: string | null) => void;
    updateSeason: (seasonId: string, data: Partial<SeasonData>) => void;
    updateSeasonApi: (
        zoneId: number | string,
        seasonId: string,
        data: Partial<SeasonData>
    ) => Promise<boolean>;
    deleteSeasonApi: (zoneId: number | string, seasonId: string) => Promise<boolean>;
    getSeasonOptions: () => DropdownItem[];
}

export const createSeasonStore: StateCreator<
    SeasonStore,
    [['zustand/immer', never]],
    [],
    SeasonStore
> = (set, get) => ({
    seasons: [],
    isLoadingSeasons: false,
    selectedSeasonId: null,

    fetchSeasons: async (zones?: { id: number | string; code?: string }[]) => {
        set({ isLoadingSeasons: true });
        try {
            // If no zones provided, we can't fetch anything as endpoint requires zoneId
            if (!zones || zones.length === 0) {
                console.warn('[SeasonStore] No zones provided to fetchSeasons');
                set({ seasons: [], isLoadingSeasons: false });
                return;
            }

            console.log(
                '[SeasonStore] trigger fetchSeasons for zones:',
                zones.map(z => z.id)
            );

            const promises = zones.map(async zone => {
                const results = await seasonApi.getSeasons(zone.id);
                // Map API raw data to Domain SeasonData
                return results.map(item => ({
                    ...item,
                    name: item.seasonName || item.name,
                    // Inject farmCode from zone if missing, or use seasonCode as fallback
                    farmCode: zone.code || item.seasonCode || '',
                    // Store zoneId for filtering
                    zoneId: zone.id,
                    // Map status number to string if needed.
                    status: (item.status === 0 ? 'Đang hoạt động' : 'Đã kết thúc') as
                        | 'Đang hoạt động'
                        | 'Đã kết thúc',
                    id: item.id.toString(), // Ensure string ID
                }));
            });

            const results = await Promise.all(promises);
            console.log('[SeasonStore] fetchSeasons raw results length:', results.length);

            // Flatten the results using concat for compatibility
            const allSeasons = ([] as SeasonData[]).concat(...results);
            console.log('[SeasonStore] merged seasons count:', allSeasons.length);

            set({ seasons: allSeasons, isLoadingSeasons: false });
        } catch (error) {
            console.error('[SeasonStore] Failed to fetch seasons:', error);
            set({ isLoadingSeasons: false });
        }
    },

    setSelectedSeasonId: id => set({ selectedSeasonId: id }),

    updateSeason: (seasonId, data) => {
        set(state => {
            const season = state.seasons.find(s => s.id === seasonId);
            if (season) {
                Object.assign(season, data);
            }
        });
    },

    updateSeasonApi: async (zoneId, seasonId, data) => {
        try {
            await seasonApi.updateSeason(zoneId, seasonId, data);
            // Update local state
            set(state => {
                const season = state.seasons.find(s => s.id.toString() === seasonId);
                if (season) {
                    Object.assign(season, data);
                }
            });
            return true;
        } catch (error) {
            console.error('[SeasonStore] Failed to update season:', error);
            return false;
        }
    },

    deleteSeasonApi: async (zoneId, seasonId) => {
        try {
            await seasonApi.deleteSeason(zoneId, seasonId);
            // Remove from local state
            set(state => {
                state.seasons = state.seasons.filter(s => s.id.toString() !== seasonId);
            });
            return true;
        } catch (error) {
            console.error('[SeasonStore] Failed to delete season:', error);
            return false;
        }
    },

    getSeasonOptions: () => {
        const seasons = get().seasons;
        if (!Array.isArray(seasons)) return [];
        return seasons.map(season => ({
            label: season.name,
            value: season.id.toString(),
        }));
    },
});
