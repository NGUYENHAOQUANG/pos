import { SelectedMaterialItem } from '@/features/farm/components/bottom-sheet/MaterialSelectionBox';
import {
    CreateWaterTreatmentCommand,
    UpdateWaterTreatmentCommand,
    IWaterTreatmentRecord,
    TREATMENT_TYPE_LABELS,
    TREATMENT_LABEL_TO_ENUM,
} from '@/features/farm/types/waterTreatment.types';

import { WaterTreatmentFormValues } from '@/features/farm/schemas/waterTreatmentSchema';

interface MaterialLike {
    id: string;
    name?: string;
    unitName?: string;
    materialDefId?: string;
}

export const waterTreatmentService = {
    // ── Default form values (create mode) ────────────────────────────
    createDefaultFormValues: (): WaterTreatmentFormValues => ({
        executionDate: new Date(),
        activityType: 'Đánh khoáng',
        note: '',
        selectedMaterials: [],
        documentIds: [],
    }),

    // ── Map API detail → form values (edit mode) ─────────────────────
    mapDetailToForm: (
        detail: IWaterTreatmentRecord,
        materials: MaterialLike[]
    ): WaterTreatmentFormValues => {
        const mappedMaterials: SelectedMaterialItem[] = (
            detail.waterTreatmentDetail?.materials || []
        ).map(m => {
            const found =
                materials.length > 0
                    ? materials.find(
                          mat =>
                              mat.id === m.warehouseItemId ||
                              mat.materialDefId === m.warehouseItemId
                      )
                    : undefined;

            return {
                material:
                    found ||
                    ({
                        id: m.warehouseItemId,
                        name: m.name || 'Vật tư',
                        unitName: m.unitName || '',
                        materialDefId: m.warehouseItemId,
                    } as any),
                quantity: m.quantity,
                unit: found?.unitName || m.unitName || '',
            } as SelectedMaterialItem;
        });

        let activityType = 'Đánh khoáng';
        if (detail.waterTreatmentDetail?.treatmentType) {
            const label = TREATMENT_TYPE_LABELS[detail.waterTreatmentDetail.treatmentType];
            if (label) activityType = label;
        }

        return {
            executionDate: detail.createdAt ? new Date(detail.createdAt) : new Date(),
            activityType,
            note: detail.waterTreatmentDetail?.notes || '',
            documentIds: detail.documentIds || [],
            selectedMaterials: mappedMaterials,
        };
    },

    // ── Snapshot for change detection ────────────────────────────────
    createSnapshot: (data: WaterTreatmentFormValues): string =>
        JSON.stringify({
            activityType: data.activityType || 'Đánh khoáng',
            note: data.note || '',
            documentIds: (data.documentIds || []).sort(),
            materials: (data.selectedMaterials || []).map(m => ({
                id: m.material?.id || '',
                quantity: String(m.quantity),
            })),
        }),

    // ── Check if form has changes ───────────────────────────────────
    hasChanges: (current: WaterTreatmentFormValues, initialSnapshot: string | null): boolean => {
        if (!initialSnapshot) {
            // Create mode — any content means unsaved changes
            return (
                current.activityType !== 'Đánh khoáng' ||
                (current.note || '').length > 0 ||
                (current.selectedMaterials || []).length > 0 ||
                (current.documentIds || []).length > 0
            );
        }
        return waterTreatmentService.createSnapshot(current) !== initialSnapshot;
    },

    // ── Map form → API payload ──────────────────────────────────────
    mapFormToPayload: (
        data: WaterTreatmentFormValues,
        uploadedDocumentIds: string[]
    ): CreateWaterTreatmentCommand | UpdateWaterTreatmentCommand => ({
        documentIds: uploadedDocumentIds,
        waterTreatmentDetail: {
            treatmentType: TREATMENT_LABEL_TO_ENUM[data.activityType]!,
            notes: data.note || '',
            materials: (data.selectedMaterials || []).map(m => ({
                warehouseItemId: m.material.id,
                quantity: Number.isNaN(Number(m.quantity)) ? m.quantity : Number(m.quantity),
            })),
        },
    }),

    // ── Validate material quantities ────────────────────────────────
    hasMaterialWithZeroQuantity: (materials: SelectedMaterialItem[]): boolean =>
        materials.length > 0 && materials.some(m => m.quantity <= 0),
};
