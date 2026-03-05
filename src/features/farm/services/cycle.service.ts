import {
    ICreateCyclePayload,
    IUpdateCyclePayload,
    CycleData,
} from '@/features/farm/types/cycle.types';
import { formatDateWithTime } from '@/features/farm/utils/dateUtils';
import { CreateCycleFormValues } from '@/features/farm/schemas/createCycleSchema';
import { IShrimpSeed } from '@/features/material/types/warehouse.types';
import { BreedOption } from '@/features/farm/types/farm.types';

export const cycleService = {
    /**
     * Maps API Detail (CycleData) to Zod Form Values
     */
    mapDetailToForm: (data: CycleData | null | undefined): Partial<CreateCycleFormValues> => {
        if (!data) {
            return {
                cycleName: '',
                breedSource: undefined,
                season: undefined,
                stockingDate: formatDateWithTime(new Date()),
                notes: '',
            };
        }

        const seasonId = data.season ? (data.season as { id?: string | number }).id : undefined;
        const stockingDate = data.createdAt
            ? formatDateWithTime(new Date(data.createdAt))
            : formatDateWithTime(new Date());

        return {
            cycleName: data.name || '',
            season: seasonId != null ? String(seasonId) : undefined,
            breedSource: data.warehouseItemId ? String(data.warehouseItemId) : undefined,
            stockingQuantity: data.totalStocking ? String(data.totalStocking) : undefined,
            age: data.ageDays ? String(data.ageDays) : undefined,
            stockingDate,
            notes: data.notes || '',
            breedName: undefined,
        };
    },

    /**
     * Maps Zod Form Values to API Create Payload
     */
    mapFormToCreatePayload: (formData: CreateCycleFormValues): ICreateCyclePayload => {
        return {
            seasonId: formData.season || '',
            warehouseItemId: formData.breedSource || '',
            name: formData.cycleName || '',
            totalStocking: parseFloat(formData.stockingQuantity || '0'),
            ageDays: parseFloat(formData.age || '0'),
            notes: formData.notes,
        };
    },

    /**
     * Maps Zod Form Values to API Update Payload
     */
    mapFormToUpdatePayload: (formData: CreateCycleFormValues): IUpdateCyclePayload => {
        return {
            // Note: Keep in sync with backend requirements for updating
            warehouseItemId: formData.breedSource || '',
            name: formData.cycleName || '',
            totalStocking: parseFloat(formData.stockingQuantity || '0'),
            ageDays: parseFloat(formData.age || '0'),
            notes: formData.notes,
        };
    },

    /**
     * Map danh sách tôm giống (IShrimpSeed[]) sang BreedOption[] cho dropdown.
     * Có xử lý fallback cho edit mode nếu giống hiện tại không còn trong kho.
     */
    mapShrimpSeedsToBreedOptions: (
        shrimpSeeds: IShrimpSeed[] | undefined,
        initialBreedSource?: string | number,
        initialBreedName?: string
    ): BreedOption[] => {
        const seeds = shrimpSeeds || [];

        let options: BreedOption[] = seeds.map(seed => ({
            label: seed.materialName || 'N/A',
            value: String(seed.id),
            materialCode: seed.materialCode,
            price: seed.averagePrice || 0,
            supplier: seed.manufacturer || seed.supplier || 'N/A',
            remainingQuantity: seed.quantity ?? 0,
        }));

        if (initialBreedSource) {
            const currentId = String(initialBreedSource);
            const exists = options.some(o => String(o.value) === currentId);

            if (!exists) {
                options = [
                    {
                        label: initialBreedName || 'Giống hiện tại',
                        value: currentId,
                        materialCode: '',
                        price: 0,
                        supplier: '',
                        remainingQuantity: 0,
                    },
                    ...options,
                ];
            }
        }

        return options;
    },
};
