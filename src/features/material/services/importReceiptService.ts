import { MaterialItem } from '@/features/material/components/AddWarehouseMaterial';
import {
    ImportSourceEnum,
    ImportReceiptStatus,
    ImportReceiptDetailItem,
    CreateImportReceiptRequest,
    ImportReceipt,
} from '@/features/material/types/importReceipt.types';

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
};
