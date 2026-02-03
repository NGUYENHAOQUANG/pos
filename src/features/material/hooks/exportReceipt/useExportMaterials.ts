import { useState, useEffect, useMemo, useCallback } from 'react';

import { MaterialItem } from '@/features/material/components/warehouse/AddWarehouseMaterial';
import { useWarehouses, useWarehouseItems } from '@/features/material/hooks/useWarehouses';
import {
    MaterialOption,
    WarehouseItem,
    UseExportMaterialsParams,
} from '@/features/material/types/exportReceipt.types';

/**
 * Hook to manage materials list for export warehouse form
 */
export const useExportMaterials = ({
    selectedZone,
    isEditMode,
    exportReceiptItems,
}: UseExportMaterialsParams) => {
    // Form materials state
    const [formMaterials, setFormMaterials] = useState<MaterialItem[]>([
        { id: '1', materialId: '', materialName: '', quantity: '', price: '' },
    ]);

    // Get warehouse for the selected zone
    const { data: warehouses } = useWarehouses({ ZoneId: selectedZone || undefined });
    const warehouseId = warehouses?.[0]?.id;

    // Fetch warehouse items using the warehouse ID
    const { data: warehouseData } = useWarehouseItems(warehouseId, undefined, {
        enabled: !!warehouseId,
    });
    const warehouseItems = useMemo(() => warehouseData?.items || [], [warehouseData]);

    // Material options with stock info for dropdown
    const materialOptions: MaterialOption[] = useMemo(() => {
        if (warehouseItems.length > 0) {
            return warehouseItems.map((m: WarehouseItem) => ({
                label: m.materialName || '',
                value: String(m.materialId || ''),
                unit: m.unitName || '',
                quantity: m.quantity || 0,
            }));
        }
        return [
            {
                label: 'Hiện tại không có vật tư',
                value: '__no_materials__',
                unit: '',
                quantity: 0,
                disabled: true,
            },
        ];
    }, [warehouseItems]);

    // Load items for edit mode (API does not include items in detail response)
    useEffect(() => {
        if (
            isEditMode &&
            exportReceiptItems &&
            exportReceiptItems.length > 0 &&
            formMaterials.length <= 1
        ) {
            const mappedMaterials: MaterialItem[] = exportReceiptItems.map((item, index) => {
                return {
                    id: Date.now().toString() + index,
                    materialId: item.materialId,
                    materialName: item.materialName || '',
                    quantity: item.quantity ? String(item.quantity) : '0',
                    price: item.costPrice ? String(item.costPrice) : '',
                    unit: item.unitName || '',
                };
            });
            setFormMaterials(mappedMaterials);
        }
    }, [isEditMode, exportReceiptItems, formMaterials.length]);

    // Handler: Add new material row
    const handleAddMaterial = useCallback(() => {
        setFormMaterials(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                materialId: '',
                materialName: '',
                quantity: '',
                price: '',
            },
        ]);
    }, []);

    // Handler: Update material field
    const handleUpdateMaterial = useCallback(
        (id: string, field: keyof MaterialItem, value: string | number) => {
            setFormMaterials(prev =>
                prev.map(item => {
                    if (item.id === id) {
                        if (field === 'materialId') {
                            const selectedMaterial = warehouseItems.find(
                                (m: WarehouseItem) => String(m.materialId || '') === String(value)
                            );
                            return {
                                ...item,
                                materialId: String(value),
                                materialName: selectedMaterial?.materialName || '',
                                availableQuantity: selectedMaterial?.quantity || 0,
                                unit: selectedMaterial?.unitName || '',
                            };
                        }
                        return { ...item, [field]: value };
                    }
                    return item;
                })
            );
        },
        [warehouseItems]
    );

    // Calculate total amount
    const calculateTotal = useCallback(() => {
        return formMaterials.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return sum + qty * price;
        }, 0);
    }, [formMaterials]);

    return {
        // State
        formMaterials,
        warehouseId,
        materialOptions,

        // Calculated
        totalAmount: calculateTotal(),

        // Handlers
        handleAddMaterial,
        handleUpdateMaterial,
    };
};
