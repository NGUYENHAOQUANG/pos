import { ExportWarehouseFormValues } from '@/features/material/schemas/exportWarehouseFormSchema';
import {
    ExportReceipt,
    CreateExportReceiptRequest,
    ExportReceiptItem,
} from '@/features/material/types/exportReceipt.types';

/** Normalized shape used for snapshot comparison (change tracking) */
interface NormalizedItem {
    materialId: string;
    quantity: string;
    price: string;
}

export const exportReceiptService = {
    // ─── Mapping ────────────────────────────────────────────

    /** Map API detail + items → form values (edit mode) */
    mapDetailToForm: (
        detail: ExportReceipt,
        itemsData: ExportReceiptItem[]
    ): ExportWarehouseFormValues => {
        return {
            date: detail.createdAt ? new Date(detail.createdAt) : new Date(),
            selectedZone: detail.zoneId || '',
            selectedPond: detail.pondId || '',
            note: detail.note || '',
            files: [],
            exportItems: itemsData.map(item => ({
                id: item.materialId || Date.now().toString() + Math.random(),
                materialName: item.materialName,
                materialId: item.materialId,
                quantity: item.quantity.toString(),
                price: item.costPrice.toString() || '0',
                unit: item.unitName,
                availableQuantity: item.warehouseQuantity,
            })),
        };
    },

    /** Map form values → API create/update payload */
    mapFormToPayload: (
        warehouseId: string,
        formData: ExportWarehouseFormValues,
        documentIds: string[],
        isAutoSubmit: boolean
    ): CreateExportReceiptRequest => {
        return {
            warehouseId,
            pondId: formData.selectedPond,
            documentIds,
            note: formData.note || '',
            date: formData.date.toISOString(),
            autoSubmit: isAutoSubmit,
            items: (formData.exportItems || [])
                .filter(item => item.materialId)
                .map(item => ({
                    materialId: item.materialId,
                    quantity: parseFloat(item.quantity) || 0,
                })),
        };
    },

    // ─── Default Values ─────────────────────────────────────

    /** Create a single blank export item */
    createDefaultExportItem: () => ({
        id: Date.now().toString(),
        materialId: '',
        materialName: '',
        quantity: '',
        price: '',
        unit: '',
    }),

    /** Create default form values for new receipt (create mode) */
    createDefaultFormValues: (selectedZoneId?: string): ExportWarehouseFormValues => ({
        date: new Date(),
        selectedZone: selectedZoneId || '',
        selectedPond: '',
        note: '',
        files: [],
        exportItems: [exportReceiptService.createDefaultExportItem()],
    }),

    // ─── Calculations ───────────────────────────────────────

    /** Calculate total amount = sum(quantity × price) across all items */
    calculateTotalAmount: (items: Array<{ quantity?: string; price?: string }>): number => {
        return (items || []).reduce((sum, item) => {
            const qty = parseFloat(item.quantity || '0');
            const price = parseFloat(item.price || '0');
            return sum + qty * price;
        }, 0);
    },

    // ─── Change Tracking ────────────────────────────────────

    /** Normalize items for stable JSON comparison (strips UI-only fields) */
    normalizeItems: (items: any[]): NormalizedItem[] =>
        (items || []).map((item: any) => ({
            materialId: item.materialId || '',
            quantity: item.quantity || '',
            price: item.price || '',
        })),

    /** Create a JSON snapshot string of form stable fields */
    createFormSnapshot: (formData: ExportWarehouseFormValues): string =>
        JSON.stringify({
            date: new Date(formData.date).getTime(),
            note: formData.note || '',
            exportItems: exportReceiptService.normalizeItems(formData.exportItems as any[]),
        }),

    /** Check if form has changed compared to initial snapshot */
    hasFormChanges: (params: {
        isEditMode: boolean;
        initialSnapshot: string | null;
        currentForm: Record<string, any>;
        settledZone: string | null;
        settledPond: string | null;
    }): boolean => {
        const { isEditMode, initialSnapshot, currentForm, settledZone, settledPond } = params;

        if (!isEditMode) return true;
        if (!initialSnapshot) return true;

        // Compare stable fields via snapshot
        const currentSnapshot = JSON.stringify({
            date: new Date(currentForm.date ?? new Date()).getTime(),
            note: currentForm.note ?? '',
            exportItems: exportReceiptService.normalizeItems(currentForm.exportItems as any[]),
        });
        if (currentSnapshot !== initialSnapshot) return true;

        // Compare zone/pond against settled values
        if (settledZone !== null && (currentForm.selectedZone ?? '') !== settledZone) return true;
        if (settledPond !== null && (currentForm.selectedPond ?? '') !== settledPond) return true;

        // Check new files
        if ((currentForm.files || []).length > 0) return true;

        return false;
    },
};
