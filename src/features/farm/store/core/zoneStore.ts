import { StateCreator } from 'zustand';
import { Zone } from '@/features/farm/types/farm.types';
import { zoneApi } from '@/features/farm/api/zoneApi';

export interface ZoneStore {
    zones: Zone[];
    isLoadingZones: boolean;
    fetchZones: () => Promise<void>;
    selectedZoneId: number | null;
    setSelectedZoneId: (id: number | null) => void;
    // Helper to get selected zone object
    getSelectedZone: () => Zone | undefined;
}

export const createZoneStore: StateCreator<ZoneStore, [['zustand/immer', never]], [], ZoneStore> = (
    set,
    get
) => ({
    zones: [],
    isLoadingZones: false,
    selectedZoneId: null,

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

    setSelectedZoneId: id => set({ selectedZoneId: id }),

    getSelectedZone: () => {
        const { zones, selectedZoneId } = get();
        return zones.find(z => z.id === selectedZoneId);
    },
});
