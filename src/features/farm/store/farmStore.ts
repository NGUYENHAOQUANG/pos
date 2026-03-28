import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// Core Slices
import { createPondListStore, PondListStore } from '@/features/farm/store/core/pondListStore';
import { createZoneStore, ZoneStore } from '@/features/farm/store/core/zoneStore';

export type FarmState = PondListStore & ZoneStore;

export const useFarmStore = create<FarmState>()(
    immer((...a) => ({
        ...createPondListStore(...a),
        ...createZoneStore(...a),
    }))
);

export const useFarm = () => {
    const store = useFarmStore();
    return {
        ...store,
    };
};

export const getFarmState = () => useFarmStore.getState();
