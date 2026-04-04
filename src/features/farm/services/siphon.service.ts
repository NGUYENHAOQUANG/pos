import { SiphonFormValues } from '@/features/farm/schemas/siphonFormSchema';
import { SelectedMaterialItem } from '@/features/farm/components/bottom-sheet/MaterialSelectionBox';
import { CreateSiphonCommand } from '@/features/farm/types/siphon.types';
import { PondLogMaterialType } from '@/shared/types/common.types';

interface SiphonDetailResponse {
    createdAt?: string;
    documentIds?: string[];
    siphonDetail?: {
        shrimpLossKg?: number;
        notes?: string;
        materials?: PondLogMaterialType[];
    };
}

interface MaterialLike {
    id: string;
    name?: string;
    unitName?: string;
    materialDefId?: string;
}

export const siphonFormService = {
    // ── Default form values (create mode) ────────────────────────────
    createDefaultFormValues: (): SiphonFormValues => ({
        lossAmount: '',
        notes: '',
        imageUris: [],
        documentIds: [],
        selectedMaterials: [],
    }),

    // ── Map API detail → form values (edit mode) ─────────────────────
    mapDetailToForm: (
        detail: SiphonDetailResponse,
        materials: MaterialLike[]
    ): SiphonFormValues => {
        const mappedMaterials: SelectedMaterialItem[] = (detail.siphonDetail?.materials || []).map(
            m => {
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
            }
        );

        return {
            lossAmount: detail.siphonDetail?.shrimpLossKg?.toString() || '',
            notes: detail.siphonDetail?.notes || '',
            imageUris: [], // Images fetched separately via documentApi
            documentIds: detail.documentIds || [],
            selectedMaterials: mappedMaterials,
        };
    },

    // ── Snapshot for change detection ────────────────────────────────
    createSnapshot: (data: SiphonFormValues): string =>
        JSON.stringify({
            lossAmount: data.lossAmount || '',
            notes: data.notes || '',
            imageUris: (data.imageUris || []).length,
            documentIds: (data.documentIds || []).sort(),
            materials: (data.selectedMaterials || []).map(m => ({
                id: m.material?.id || '',
                quantity: String(m.quantity),
            })),
        }),

    // ── Check if form has changes ───────────────────────────────────
    hasChanges: (current: SiphonFormValues, initialSnapshot: string | null): boolean => {
        if (!initialSnapshot) {
            // Create mode — any content means unsaved changes
            return (
                (current.lossAmount || '').length > 0 ||
                (current.notes || '').length > 0 ||
                (current.imageUris || []).length > 0 ||
                (current.selectedMaterials || []).length > 0
            );
        }
        return siphonFormService.createSnapshot(current) !== initialSnapshot;
    },

    // ── Map form → API payload ──────────────────────────────────────
    mapFormToPayload: (
        data: SiphonFormValues,
        uploadedDocumentIds: string[]
    ): CreateSiphonCommand => ({
        value: 0,
        documentIds: uploadedDocumentIds,
        siphonDetail: {
            shrimpLossKg: parseFloat(data.lossAmount) || 0,
            notes: data.notes || '',
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
