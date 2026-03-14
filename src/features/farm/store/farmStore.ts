import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Core Slices
import { createPondListStore, PondListStore } from '@/features/farm/store/core/pondListStore';
import { createZoneStore, ZoneStore } from '@/features/farm/store/core/zoneStore';

export type FarmState = PondListStore & ZoneStore;

export const useFarmStore = create<FarmState>()(
    persist(
        immer((...a) => ({
            ...createPondListStore(...a),
            ...createZoneStore(...a),
        })),
        {
            name: 'farm-storage-v3',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: state => ({
                ponds: state.ponds,
                zones: state.zones,
                selectedZoneId: state.selectedZoneId,
                currentWarehouseId: state.currentWarehouseId,
            }),
        }
    )
);

export const useFarm = () => {
    const store = useFarmStore();
    return {
        ...store,
    };
};

export const getFarmState = () => useFarmStore.getState();
