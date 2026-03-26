import {
    FeedingRecordItem,
    CreateFeedingRecordPayload,
} from '@/features/farm/types/feedingRecord.types';
import { FeedingFormValues } from '@/features/farm/schemas/feedingFormSchema';
import { IMaterial } from '@/features/material/types/material.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { formatDate } from '@/features/farm/utils/dateUtils';

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
                // Fallback: use name/unitName from BE response (for cross-page pagination)
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

    mapFeedingItemToJobExecution: (
        item: FeedingRecordItem,
        dayCounts: Record<string, number>,
        totalPerDay: Record<string, number>,
        materialMap: Record<string, IMaterial>
    ): JobExecution => {
        const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
        const dateKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}-${createdDate.getDate()}`;

        if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
        dayCounts[dateKey]++;
        const total = totalPerDay[dateKey] ?? dayCounts[dateKey];
        const dailyIndex = total - dayCounts[dateKey] + 1;

        const timeStr = createdDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const dateStr = formatDate(createdDate);

        return {
            id: item.id,
            label: `Lần ${dailyIndex}`,
            time: timeStr,
            date: dateStr,
            note: item.feedingDetail?.notes ?? undefined,
            pondId: item.pondId,
            materials: item.feedingDetail?.materials?.map(m => {
                const mat = materialMap[m.warehouseItemId];
                return {
                    material: {
                        id: m.warehouseItemId,
                        name: mat?.name || m.name || 'Vật tư',
                        unitName: mat?.unitName || m.unitName || '',
                    } as any,
                    quantity: m.quantity,
                    unit: mat?.unitName || m.unitName || '',
                };
            }),
            documentIds: item.documentIds,
            images: item.documentIds ?? [],
            createdAt: item.createdAt,
        };
    },

    mapRecordsToJobs: (
        rawItems: FeedingRecordItem[],
        materialMap: Record<string, IMaterial>
    ): JobExecution[] => {
        const totalPerDay: Record<string, number> = {};
        rawItems.forEach(item => {
            const d = item.createdAt ? new Date(item.createdAt) : new Date();
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            totalPerDay[key] = (totalPerDay[key] || 0) + 1;
        });

        const sortedItems = [...rawItems].sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
        });

        const dayCounts: Record<string, number> = {};
        return sortedItems.map(item => {
            return feedingService.mapFeedingItemToJobExecution(
                item,
                dayCounts,
                totalPerDay,
                materialMap
            );
        });
    },
};
