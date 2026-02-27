import {
    CreateCycleCommand,
    UpdateCycleCommand,
    CycleData,
} from '@/features/farm/types/farm.types';
import { formatDateWithTime } from '@/features/farm/utils/dateUtils';
import { CreateCycleFormValues } from '@/features/farm/schemas/createCycleSchema';

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

        // Handle season object vs ID
        let seasonId = data.season;
        if (typeof data.season === 'object' && data.season !== null) {
            seasonId = data.season.id;
        }

        // Determine stock quantity from alternative typings if needed
        const quantity =
            data.stockingQuantity || (data as unknown as Record<string, unknown>).totalStocking;
        const age = data.age || (data as unknown as Record<string, unknown>).ageDays;

        return {
            cycleName: data.cycleName || '',
            season:
                typeof seasonId === 'string' || typeof seasonId === 'number'
                    ? String(seasonId)
                    : undefined,
            breedSource:
                data.breedSource || (data as unknown as Record<string, unknown>).warehouseItemId
                    ? String(
                          data.breedSource ||
                              (data as unknown as Record<string, unknown>).warehouseItemId
                      )
                    : undefined,
            stockingQuantity: quantity ? String(quantity) : undefined,
            age: age ? String(age) : undefined,
            // Override stockingDate with current time in edit mode if needed, or parse existing
            stockingDate: formatDateWithTime(new Date()),
            notes: data.notes || '',
            breedName: data.breedName || undefined,
        };
    },

    /**
     * Maps Zod Form Values to API Create Payload
     */
    mapFormToCreatePayload: (formData: CreateCycleFormValues): CreateCycleCommand => {
        return {
            seasonId: formData.season,
            warehouseItemId: formData.breedSource,
            name: formData.cycleName,
            totalStocking: parseFloat(formData.stockingQuantity),
            ageDays: parseFloat(formData.age),
            notes: formData.notes,
        };
    },

    /**
     * Maps Zod Form Values to API Update Payload
     */
    mapFormToUpdatePayload: (formData: CreateCycleFormValues): UpdateCycleCommand => {
        return {
            // Note: Keep in sync with backend requirements for updating
            warehouseItemId: formData.breedSource,
            name: formData.cycleName,
            totalStocking: parseFloat(formData.stockingQuantity),
            ageDays: parseFloat(formData.age),
            notes: formData.notes,
        };
    },
};
