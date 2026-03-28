import { MaterialItem } from '@/features/material/components/AddWarehouseMaterial';
import {
    ImportSourceEnum,
    ImportReceiptStatus,
    ImportReceiptDetailItem,
    CreateImportReceiptRequest,
    ImportReceipt,
} from '@/features/material/types/importReceipt.types';

interface NormalizedItem {
    materialId: string;
    quantity: string;
    price: string;
}

export const importReceiptService = {
    mapDetailToForm: (detail: ImportReceipt | { data: ImportReceipt }) => {
        const formState = {
            date: new Date(),
            supplier: '',
            supplierName: '',
            items: [] as MaterialItem[],
        };

        const data = 'data' in detail ? detail.data : detail;

        if (data.createdAt) {
            formState.date = new Date(data.createdAt);
        }

        if (data.supplierId) {
            formState.supplier = data.supplierId;
            formState.supplierName = data.supplierName || '';
        }

        return formState;
    },

    mapItemsToForm: (itemsData: ImportReceiptDetailItem[]): MaterialItem[] => {
        if (!itemsData || itemsData.length === 0) return [];

        return itemsData.map(item => ({
            id: item.id,
            materialName: item.materialName,
            materialId: item.materialId,
            quantity: item.quantity.toString(),
            price: item.unitPrice.toString(),
            unit: item.unitName,
        }));
    },

    mapFormToPayload: (
        supplierId: string,
        warehouseId: string,
        items: MaterialItem[],
        status: ImportReceiptStatus,
        documentIds: string[]
    ): CreateImportReceiptRequest => {
        return {
            supplierId,
            warehouseId,
            items: items
                .filter(m => m.materialId)
                .map(m => ({
                    materialId: m.materialId as string,
                    quantity: parseFloat(m.quantity) || 0,
                    unitPrice: parseFloat(m.price) || 0,
                })),
            notes: '',
            autoSubmit: status === ImportReceiptStatus.Pending,
            importSourceEnum: ImportSourceEnum.Supplier,
            documentIds,
            status,
        };
    },

    // ─── Default Values ─────────────────────────────────────

    createDefaultItem: (): MaterialItem => ({
        id: Date.now().toString(),
        materialId: '',
        materialName: '',
        quantity: '',
        price: '',
        unit: '',
    }),

    createDefaultFormValues: () => ({
        date: new Date(),
        supplier: '',
        files: [] as any[],
        warehouseItems: [importReceiptService.createDefaultItem()],
    }),

    // ─── Change Tracking ────────────────────────────────────

    normalizeItems: (items: MaterialItem[]): NormalizedItem[] =>
        (items || []).map((item: MaterialItem) => ({
            materialId: item.materialId || '',
            quantity: item.quantity || '',
            price: item.price || '',
        })),

    createFormSnapshot: (data: {
        date: Date;
        supplier: string;
        warehouseItems: MaterialItem[];
    }): string =>
        JSON.stringify({
            date: new Date(data.date).getTime(),
            supplier: data.supplier || '',
            warehouseItems: importReceiptService.normalizeItems(data.warehouseItems),
        }),

    hasFormChanges: (params: {
        isEditMode: boolean;
        initialSnapshot: string | null;
        date: Date;
        supplier: string;
        warehouseItems: MaterialItem[];
        files: any[];
    }): boolean => {
        const { isEditMode, initialSnapshot, date, supplier, warehouseItems, files } = params;

        if (!isEditMode) return true;
        if (!initialSnapshot) return true;

        const currentSnapshot = JSON.stringify({
            date: new Date(date).getTime(),
            supplier: supplier || '',
            warehouseItems: importReceiptService.normalizeItems(warehouseItems),
        });
        if (currentSnapshot !== initialSnapshot) return true;
        if ((files || []).length > 0) return true;

        return false;
    },
};
