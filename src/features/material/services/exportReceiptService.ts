import { ExportWarehouseFormValues } from '@/features/material/schemas/exportWarehouseFormSchema';
import {
    ExportReceipt,
    CreateExportReceiptRequest,
    ExportReceiptItem,
} from '@/features/material/types/exportReceipt.types';

export const exportReceiptService = {
    mapDetailToForm: (
        detail: ExportReceipt,
        itemsData: ExportReceiptItem[]
    ): ExportWarehouseFormValues => {
        return {
            date: detail.createdAt ? new Date(detail.createdAt) : new Date(),
            selectedZone: '',
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
            })),
        };
    },

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
};
