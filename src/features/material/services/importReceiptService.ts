import { MaterialItem } from '@/features/material/components/AddWarehouseMaterial';
import {
    ImportSourceEnum,
    ImportReceiptStatus,
    ImportReceiptDetailItem,
    CreateImportReceiptRequest,
    ImportReceipt,
} from '@/features/material/types/importReceipt.types';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';
import { ISupplier } from '@/features/material/types/supplier.types';
import { IMaterial } from '@/features/material/types/material.types';

export const importReceiptService = {
    mapDetailToForm: (detail: ImportReceipt | { data: ImportReceipt }, suppliers: ISupplier[]) => {
        const formState = {
            date: new Date(),
            supplier: '',
            items: [] as MaterialItem[],
        };

        const data = 'data' in detail ? detail.data : detail;

        if (data.createdAt) {
            formState.date = new Date(data.createdAt);
        }

        if (data.supplierId && suppliers.length > 0) {
            const foundSupplier = suppliers.find(s => s.id === data.supplierId);
            if (foundSupplier) {
                formState.supplier = foundSupplier.name;
            } else if (data.supplierName) {
                formState.supplier = data.supplierName;
            }
        } else if (data.supplierName) {
            formState.supplier = data.supplierName;
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

    mapMaterialsToOptions: (materialsData: IMaterial[]): IWarehouseItem[] => {
        return materialsData.map((m: IMaterial) => ({
            id: m.id,
            materialId: m.id,
            materialName: m.name,
            unit: m.unitName || '',
            remaining: 0,
            quantity: 0,
            unitId: '',
        }));
    },

    mapSuppliersToOptions: (suppliers: ISupplier[]) => {
        return suppliers.map(s => ({
            label: s.name,
            value: s.name,
        }));
    },
};
