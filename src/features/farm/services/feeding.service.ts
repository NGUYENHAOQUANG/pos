import {
    FeedingRecordItem,
    CreateFeedingRecordPayload,
} from '@/features/farm/types/feedingRecord.types';
import { FeedingFormValues } from '@/features/farm/schemas/feedingFormSchema';
import { IMaterial } from '@/features/material/types/material.types';
import { JobExecution } from '@/features/farm/types/farm.types';

export const feedingService = {
    filterFeedingMaterials: (materials: IMaterial[]): IMaterial[] => {
        return materials.filter(m => m.group && m.group.toLowerCase().includes('nuôi'));
    },

    mapDetailToForm: (item: FeedingRecordItem, materialsList: IMaterial[]): FeedingFormValues => {
        const mappedMaterials = (item.feedingDetail?.materials || [])
            .map(apiMat => {
                const fullMaterial = materialsList.find(m => m.id === apiMat.warehouseItemId);
                if (fullMaterial) {
                    return {
                        materialId: fullMaterial.id,
                        materialName: fullMaterial.name,
                        quantity: apiMat.quantity,
                        unit: fullMaterial.unitName || '',
                        rawMaterial: fullMaterial,
                    };
                }
                if (apiMat.name) {
                    const fallbackMaterial: IMaterial = {
                        id: apiMat.warehouseItemId,
                        name: apiMat.name,
                        group: '' as any,
                        unit: apiMat.unitName || '',
                        unitName: apiMat.unitName || '',
                    };
                    return {
                        materialId: apiMat.warehouseItemId,
                        materialName: apiMat.name,
                        quantity: apiMat.quantity,
                        unit: apiMat.unitName || '',
                        rawMaterial: fallbackMaterial,
                    };
                }
                return null;
            })
            .filter((m): m is NonNullable<typeof m> => m !== null);

        return {
            executionDate: item.createdAt ? new Date(item.createdAt) : new Date(),
            materials: mappedMaterials,
            mode: 'manual',
            schedules: [],
            note: item.feedingDetail?.notes || '',
        };
    },

    mapMetaToForm: (
        itemToEdit: JobExecution | undefined,
        materialsList: IMaterial[]
    ): FeedingFormValues => {
        const meta = itemToEdit?.meta as Record<string, unknown> | undefined;
        const feedingDetail = meta?.feedingDetail as Record<string, unknown> | undefined;

        const rawMaterials =
            ((feedingDetail?.materials || meta?.materials) as Array<Record<string, unknown>>) || [];

        const mappedMaterials = rawMaterials
            .map(apiMat => {
                const matId = String(apiMat?.warehouseItemId || apiMat?.id || '');
                const quantity = Number(apiMat?.quantity || 0);

                const fullMaterial = materialsList.find(m => m.id === matId);
                if (fullMaterial) {
                    return {
                        materialId: fullMaterial.id,
                        materialName: fullMaterial.name,
                        quantity: quantity,
                        unit: fullMaterial.unitName || '',
                        rawMaterial: fullMaterial,
                    };
                }
                // Fallback: use name/unitName from BE response (for cross-page pagination)
                const apiName = String(apiMat?.name || '');
                if (apiName) {
                    const fallbackMaterial: IMaterial = {
                        id: matId,
                        name: apiName,
                        group: '' as any,
                        unit: String(apiMat?.unitName || ''),
                        unitName: String(apiMat?.unitName || ''),
                    };
                    return {
                        materialId: matId,
                        materialName: apiName,
                        quantity: quantity,
                        unit: String(apiMat?.unitName || ''),
                        rawMaterial: fallbackMaterial,
                    };
                }
                return null;
            })
            .filter((m): m is NonNullable<typeof m> => m !== null);

        let executionDate = new Date();
        if (itemToEdit?.createdAt) {
            executionDate = new Date(itemToEdit.createdAt);
        }

        return {
            executionDate,
            materials: mappedMaterials,
            mode: 'manual',
            schedules: [],
            note: String(feedingDetail?.notes || meta?.notes || ''),
        };
    },

    mapFormToPayload: (formData: FeedingFormValues): CreateFeedingRecordPayload => {
        return {
            feedingDetail: {
                notes: formData.note || '',
                materials: formData.materials.map(m => ({
                    warehouseItemId: m.materialId,
                    quantity: m.quantity,
                })),
            },
        };
    },
};
