import { StateCreator } from 'zustand';
import { PondData, PondType } from '@/features/farm/types/farm.types';
import { DUMMY_POND_DATA } from '@/features/farm/data/pondData';

export interface PondListStore {
    ponds: PondData[];
    getPondById: (pondId: string) => PondData | undefined;
    updatePondType: (pondId: string, newType: PondType) => void;
}

export const createPondListStore: StateCreator<
    PondListStore,
    [['zustand/immer', never]],
    [],
    PondListStore
> = (set, get) => ({
    ponds: DUMMY_POND_DATA,
    getPondById: pondId => {
        return get().ponds.find(pond => pond.id === pondId);
    },
    updatePondType: (pondId, newType) => {
        set(state => {
            const pond = state.ponds.find(p => p.id === pondId);
            if (pond) {
                pond.type = newType;
            }
        });
    },
});
