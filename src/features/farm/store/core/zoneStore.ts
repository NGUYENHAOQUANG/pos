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
    getSelectedZone: () => Zone | undefined;
}

export const createZoneStore: StateCreator<ZoneStore, [['zustand/immer', never]], [], ZoneStore> = (
    set,
    get
) => ({
    zones: [],
    isLoadingZones: false,
    selectedZoneId: null,
    currentWarehouseId: null,

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
        set({ selectedZoneId: id, currentWarehouseId: null });

        if (!id) return;

        fetchCurrentWarehouseId(String(id)).then(warehouseId => {
            set({ currentWarehouseId: warehouseId });
        });
    },

    getSelectedZone: () => {
        const { zones, selectedZoneId } = get();
        return zones.find(z => z.id === selectedZoneId);
    },
});
