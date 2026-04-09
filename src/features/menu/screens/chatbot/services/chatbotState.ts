import { Zone, PondData } from '@/features/farm/types/farm.types';
import { PondCategory } from '@/features/farm/types/pond-category.types';

export const chatbotState = {
    cachedZones: [] as Zone[],
    cachedCategories: [] as PondCategory[],
    cachedPonds: [] as PondData[],
    selectedZoneId: null as string | null,
    selectedZoneName: null as string | null,
    pendingTextContext: null as string | null,

    clear() {
        this.selectedZoneId = null;
        this.selectedZoneName = null;
        this.pendingTextContext = null;
    },
};
