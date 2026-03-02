import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { FarmData, POND_TYPES, PondData, Zone } from '@/features/farm/types/farm.types';
import { PondCategory } from '@/features/farm/types/pond-category.types';

// Sort order map
const POND_TYPE_ORDER: Record<string, number> = {
    [POND_TYPES.NURSERY]: 1,
    [POND_TYPES.CULTIVATION]: 2,
    [POND_TYPES.READY]: 3,
    [POND_TYPES.WATER_STORAGE]: 4,
    [POND_TYPES.TREATMENT]: 5,
    [POND_TYPES.WASTE]: 6,
    [POND_TYPES.SETTLING]: 7,
};

export const pondListService = {
    mapZonesToOptions: (zones: Zone[]): DropDownItem[] => {
        return zones.map(zone => ({
            id: zone.id.toString(),
            label: zone.name,
            value: zone.code || zone.id.toString(),
        }));
    },

    mapPondsWithCategories: (ponds: PondData[], categories: PondCategory[]): PondData[] => {
        if (!categories || categories.length === 0) return ponds;

        return ponds.map(pond => {
            const matchedCategory = categories.find(c => c.id === pond.pondCategoryId);
            if (matchedCategory) {
                return {
                    ...pond,
                    type: { id: matchedCategory.id, name: matchedCategory.name },
                };
            }
            return pond;
        });
    },

    mapFarmData: (selectedFarm: DropDownItem, fullZoneData?: Zone): FarmData => {
        return {
            id: selectedFarm.id.toString(),
            name: selectedFarm.label,
            code: selectedFarm.value,
            area: fullZoneData?.area?.toString() || '',
            address: fullZoneData?.address || '',
        };
    },

    getComputedStatus: (pond: PondData): 'active' | 'preparing' | undefined => {
        // Available = 0 (Chuẩn bị)
        // Framing = 1 (Đang nuôi/Active)
        // Null = 2 (Không có trạng thái)
        if (pond.status === 'Framing') return 'active';
        if (pond.status === 'Available') return 'preparing';

        return undefined;
    },

    filterAndSortPonds: (ponds: PondData[], selectedTab: string): PondData[] => {
        let data = ponds;
        if (selectedTab === 'active') {
            data = ponds.filter(
                (pond: PondData) => pondListService.getComputedStatus(pond) === 'active'
            );
        } else if (selectedTab === 'preparing') {
            data = ponds.filter(
                (pond: PondData) => pondListService.getComputedStatus(pond) === 'preparing'
            );
        }

        return [...data].sort((a: PondData, b: PondData) => {
            const typeA = typeof a.type === 'string' ? a.type : a.type?.name;
            const typeB = typeof b.type === 'string' ? b.type : b.type?.name;

            const orderA = typeA ? POND_TYPE_ORDER[typeA] || 99 : 99;
            const orderB = typeB ? POND_TYPE_ORDER[typeB] || 99 : 99;
            return orderA - orderB;
        });
    },
};
