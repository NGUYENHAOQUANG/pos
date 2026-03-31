import { InventoryFormValues } from '@/features/material/schemas/inventoryFormSchema';
import {
    IInventoryCheckDetail,
    InventoryCheckItem,
    CreateInventoryCheckRequest,
    UpdateInventoryCheckRequest,
} from '@/features/material/types/inventoryCheck.types';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';

export const inventoryService = {
    createDefaultItem: () => ({
        id: Date.now().toString(),
        materialId: '',
        materialName: '',
        oldStock: 0,
        newStock: '',
        difference: 0,
        unit: '',
    }),

    createDefaultFormValues: (): InventoryFormValues => ({
        date: new Date(),
        note: '',
        inventoryItems: [inventoryService.createDefaultItem()],
    }),

    createFormFromWarehouseItem: (item: IWarehouseItem): InventoryFormValues => ({
        date: new Date(),
        note: '',
        inventoryItems: [
            {
                id: Date.now().toString(),
                materialId: item.materialId,
                materialName: item.materialName ?? '',
                oldStock: item.quantity ?? 0,
                newStock: '',
                difference: 0,
                unit: item.unitName ?? '',
                materialCode: item.materialCode ?? '',
            },
        ],
    }),

    mapDetailToForm: (
        detail: IInventoryCheckDetail,
        items: InventoryCheckItem[]
    ): InventoryFormValues => {
        return {
            date: detail.createdAt ? new Date(detail.createdAt) : new Date(),
            note: detail.note,
            inventoryItems: items.map(item => ({
                id: item.id,
                materialId: item.materialId,
                materialName: item.materialName,
                oldStock: item.expectedQty ?? item.actualQty,
                newStock: item.actualQty.toString(),
                difference: item.difference,
                unit: item.unitName,
                materialCode: item.materialCode,
            })),
        };
    },

    normalizeFormValues: (data: InventoryFormValues): InventoryFormValues => ({
        date: data.date || new Date(),
        note: data.note || '',
        inventoryItems: data.inventoryItems,
    }),

    createSnapshot: (data: InventoryFormValues): string =>
        JSON.stringify({
            date: new Date(data.date || new Date()).getTime(),
            note: data.note || '',
            inventoryItems: (data.inventoryItems || []).map(item => ({
                materialId: item.materialId || '',
                newStock: item.newStock || '',
            })),
        }),

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
