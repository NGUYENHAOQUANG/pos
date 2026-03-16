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
                // isLoadingWarehouse: NOT persisted — always false on restore
            }),
            onRehydrateStorage: () => restoredState => {
                // Nếu selectedZoneId có nhưng currentWarehouseId bị mất
                // (e.g. app bị kill giữa chừng), re-fetch lại silently
                if (restoredState?.selectedZoneId && !restoredState?.currentWarehouseId) {
                    restoredState.setSelectedZoneId(restoredState.selectedZoneId);
                }
            },
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
