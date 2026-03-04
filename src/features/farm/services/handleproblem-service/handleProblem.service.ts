import { HandleProblemFormValues } from '../../schemas/handleProblemSchema';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { IMaterial } from '@/features/material/types/material.types';

export const handleProblemService = {
    mapDetailToForm: (
        item: any,
        materials: IMaterial[],
        imageUrls: string[]
    ): HandleProblemFormValues => {
        let note = '';
        let selectedMaterials: HandleProblemFormValues['selectedMaterials'] = [];
        let initialDocumentIds: string[] = [];
        let selectedDate = new Date();

        if (item) {
            note = item.note || item.meta?.notes || '';

            const rawMaterials = item.materials || item.meta?.materials;
            if (rawMaterials && Array.isArray(rawMaterials)) {
                selectedMaterials = rawMaterials
                    .map((m: any) => {
                        const matId = m.warehouseItemId || m.material?.id;
                        const warehouseItem = materials.find(wm => wm.id === matId);
                        if (warehouseItem) {
                            return {
                                material: warehouseItem,
                                quantity: Number(m.quantity) || 0,
                                unit: warehouseItem.unitName || '',
                            };
                        }
                        return null;
                    })
                    .filter(
                        (m): m is { material: IMaterial; quantity: number; unit: string } =>
                            m !== null
                    );
            }

            if (item.documentIds?.length) {
                initialDocumentIds = item.documentIds;
            } else if (item.meta?.documentIds?.length) {
                initialDocumentIds = item.meta.documentIds;
            }

            if (item.createdAt) {
                selectedDate = new Date(item.createdAt);
            } else if (item.date) {
                if (item.meta?.date && item.meta?.time) {
                    const [day, month, year] = item.meta.date.split('/').map(Number);
                    const [hours, minutes] = item.meta.time.split(':').map(Number);
                    if (
                        !isNaN(day) &&
                        !isNaN(month) &&
                        !isNaN(year) &&
                        !isNaN(hours) &&
                        !isNaN(minutes)
                    ) {
                        selectedDate = new Date(year, month - 1, day, hours, minutes);
                    }
                }
            }
        }

        return {
            selectedDate,
            selectedMaterials,
            note,
            imageUris: imageUrls || item?.images || [],
            documentIds: initialDocumentIds.filter(id => id != null),
        };
    },

    mapFormToPayload: (formData: HandleProblemFormValues, jobType: JobType) => {
        const apiMaterials = formData.selectedMaterials
            .filter(m => m.material?.id)
            .map(m => ({
                warehouseItemId: m.material.id,
                quantity: Number.isNaN(Number(m.quantity)) ? m.quantity : Number(m.quantity),
            }));

        const documentIdsForApi = formData.documentIds || [];

        const commonPayload = {
            notes: formData.note || '',
            materials: apiMaterials,
        };

        if (jobType === 'CLEAN_POND' || jobType === 'SUN_DRY_POND') {
            return {
                detail: commonPayload,
                documentIds: documentIdsForApi,
            };
        }

        if (jobType === 'TROUBLESHOOTING') {
            return {
                incidentDetail: commonPayload,
                documentIds:
                    documentIdsForApi.length > 0
                        ? documentIdsForApi.filter(id => id != null)
                        : undefined,
            };
        }

        return null;
    },
};
