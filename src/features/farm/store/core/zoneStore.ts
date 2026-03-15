import { StateCreator } from 'zustand';
import { Zone } from '@/features/farm/types/farm.types';
import { zoneApi } from '@/features/farm/api/zoneApi';
import { fetchCurrentWarehouseId } from '@/features/material/hooks/useWarehouses';

export interface ZoneStore {
    zones: Zone[];
    isLoadingZones: boolean;
    fetchZones: () => Promise<void>;
    selectedZoneId: string | null;
    setSelectedZoneId: (id: string | null) => void;
    currentWarehouseId: string | null;
    isLoadingWarehouse: boolean;
    getSelectedZone: () => Zone | undefined;
}

// Track in-flight request to prevent stale results from overwriting newer ones
let _warehouseFetchId = 0;

export const createZoneStore: StateCreator<ZoneStore, [['zustand/immer', never]], [], ZoneStore> = (
    set,
    get
) => ({
    zones: [],
    isLoadingZones: false,
    selectedZoneId: null,
    currentWarehouseId: null,
    isLoadingWarehouse: false,

    fetchZones: async () => {
        set({ isLoadingZones: true });
        try {
            const zones = await zoneApi.getZones();
            set({ zones, isLoadingZones: false });
        } catch (error) {
            console.error('Failed to fetch zones:', error);
            set({ isLoadingZones: false });
        }
    },

    setSelectedZoneId: id => {
        const fetchId = ++_warehouseFetchId;

        set({ selectedZoneId: id, isLoadingWarehouse: !!id });

        if (!id) {
            set({ currentWarehouseId: null, isLoadingWarehouse: false });
            return;
        }

        fetchCurrentWarehouseId(String(id))
            .then(warehouseId => {
                if (fetchId !== _warehouseFetchId) return;

                if (get().selectedZoneId !== id) return;

                set({ currentWarehouseId: warehouseId, isLoadingWarehouse: false });
            })
            .catch(err => {
                if (fetchId !== _warehouseFetchId) return;
                console.error('Failed to fetch warehouseId for zone:', err);
                set({ isLoadingWarehouse: false });
            });
    },

    getSelectedZone: () => {
        const { zones, selectedZoneId } = get();
        return zones.find(z => z.id === selectedZoneId);
    },
});
