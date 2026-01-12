import { StateCreator } from 'zustand';
import { SeasonData, DropdownItem } from '@/features/farm/types/farm.types';
import { DUMMY_SEASON_DATA } from '@/features/farm/data/seasonData';

export interface SeasonStore {
    seasons: SeasonData[];
    updateSeason: (seasonId: string, data: Partial<SeasonData>) => void;
    getSeasonOptions: () => DropdownItem[];
}

export const createSeasonStore: StateCreator<
    SeasonStore,
    [['zustand/immer', never]],
    [],
    SeasonStore
> = (set, get) => ({
    seasons: DUMMY_SEASON_DATA,
    updateSeason: (seasonId, data) => {
        set(state => {
            const season = state.seasons.find(s => s.id === seasonId);
            if (season) {
                Object.assign(season, data);
            }
        });
    },
    getSeasonOptions: () => {
        return get().seasons.map(season => ({
            label: season.name,
            value: season.id,
        }));
    },
});
