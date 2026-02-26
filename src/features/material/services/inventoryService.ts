import { InventoryFormValues } from '../schemas/inventoryFormSchema';
import {
    IInventoryCheckDetail,
    InventoryCheckItem,
    CreateInventoryCheckRequest,
    UpdateInventoryCheckRequest,
} from '../types/inventoryCheck.types';

export const inventoryService = {
    mapDetailToForm: (
        detail: IInventoryCheckDetail,
        items: InventoryCheckItem[]
    ): InventoryFormValues => {
        return {
            date: detail.createdAt ? new Date(detail.createdAt) : new Date(),
            note: detail.note || '',
            inventoryItems: items.map(item => ({
                id: item.id || Date.now().toString() + Math.random(),
                materialId: item.materialId || '',
                materialName: item.materialName || '',
                oldStock: item.expectedQty || 0,
                newStock: item.actualQty?.toString() || '0',
                difference: item.difference || 0,
                unit: item.unitName || '',
                materialCode: item.materialCode || '',
            })),
        };
    },

    mapFormToPayload: (
        id: string | undefined,
        warehouseId: string,
        formData: InventoryFormValues,
        isDraft: boolean
    ): CreateInventoryCheckRequest | (UpdateInventoryCheckRequest & { id: string }) => {
        const items = formData.inventoryItems?.map(i => ({
            materialId: i.materialId,
            actualQty: i.newStock === '' ? 0 : parseFloat(i.newStock),
            expectedQty: i.oldStock,
        }));

        if (id) {
            return {
                id,
                warehouseId,
                note: formData.note || '',
                items,
                autoSubmit: !isDraft,
            };
        }

        return {
            warehouseId,
            note: formData.note || '',
            items,
            autoSubmit: !isDraft,
        };
    },
};
