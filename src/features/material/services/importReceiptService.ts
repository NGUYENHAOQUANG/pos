import { MaterialItem } from '@/features/material/components/warehouse/AddWarehouseMaterial';
import {
    ImportSourceEnum,
    ImportReceiptStatus,
    ImportReceiptDetailItem,
    CreateImportReceiptRequest,
} from '@/features/material/types/importReceipt.types';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';

export const importReceiptService = {
    mapDetailToForm: (detail: any, suppliers: any[]) => {
        const formState = {
            date: new Date(),
            supplier: '',
            items: [] as MaterialItem[],
        };

        const data = detail.data || detail;

        if (data.createdAt) {
            formState.date = new Date(data.createdAt);
        }

        if (data.supplierId && suppliers.length > 0) {
            const foundSupplier = suppliers.find(s => s.id === data.supplierId);
            if (foundSupplier) {
                formState.supplier = foundSupplier.name;
            } else {
                formState.supplier = data.supplierName || '';
            }
        } else if (data.supplierName) {
            formState.supplier = data.supplierName;
        }

        return formState;
    },

    mapItemsToForm: (itemsData: ImportReceiptDetailItem[]): MaterialItem[] => {
        if (!itemsData || itemsData.length === 0) return [];

        return itemsData.map(item => ({
            id: item.id || Date.now().toString() + Math.random(),
            materialName: item.materialName || '',
            materialId: item.materialId,
            quantity: item.quantity?.toString() || '0',
            price: item.unitPrice?.toString() || '0',
        }));
    },

    mapFormToPayload: (
        supplierId: string,
        warehouseId: string,
        items: MaterialItem[],
        isDraft: boolean,
        documentIds: string[]
    ): CreateImportReceiptRequest => {
        return {
            supplierId,
            warehouseId,
            items: items.map(m => ({
                materialId: m.materialId || '',
                quantity: parseFloat(m.quantity) || 0,
                unitPrice: parseFloat(m.price) || 0,
            })),
            notes: '',
            autoSubmit: !isDraft,
            importSourceEnum: ImportSourceEnum.Supplier,
            documentIds,
            status: isDraft ? ImportReceiptStatus.Draft : ImportReceiptStatus.Pending,
        };
    },

    mapMaterialsToOptions: (materialsData: any[]): IWarehouseItem[] => {
        return materialsData.map((m: any) => ({
            id: m.id,
            materialId: m.id,
            materialName: m.name,
            unit: m.unitName,
            remaining: 0,
            quantity: 0,
            unitId: m.unitId || '',
        }));
    },

    mapSuppliersToOptions: (suppliers: any[]) => {
        return suppliers.map(s => ({
            label: s.name,
            value: s.name,
        }));
    },
};
