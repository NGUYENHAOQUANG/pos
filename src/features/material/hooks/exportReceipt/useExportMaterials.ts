import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDeleteExportReceiptItem } from './useExportReceiptItems';
import { showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

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

    // Refs to track loaded state
    const itemsLoadedRef = useRef(false);

    // Mutation for deleting items
    const { mutate: deleteReceiptItem } = useDeleteExportReceiptItem();

    // Load items for edit mode (API does not include items in detail response)
    useEffect(() => {
        if (
            isEditMode &&
            exportReceiptItems &&
            exportReceiptItems.length > 0 &&
            warehouseItems.length > 0 && // Wait for warehouse items to be loaded
            !itemsLoadedRef.current
        ) {
            const mappedMaterials: MaterialItem[] = exportReceiptItems.map((item, index) => {
                // Lookup stock from warehouseItems to show available quantity
                const warehouseItem = warehouseItems.find(
                    (w: WarehouseItem) => String(w.materialId) === String(item.materialId)
                );

                return {
                    id: item.materialId || Date.now().toString() + index, // Use materialId as ID if available for easier deletion
                    materialId: item.materialId,
                    materialName: item.materialName || '',
                    quantity: item.quantity ? String(item.quantity) : '0',
                    price: item.costPrice ? String(item.costPrice) : '',
                    unit: item.unitName || '',
                    availableQuantity: warehouseItem?.quantity || 0, // Show available stock from warehouse
                };
            });
            setFormMaterials(mappedMaterials);
            itemsLoadedRef.current = true;
        }
    }, [isEditMode, exportReceiptItems, warehouseItems]);

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
                                price: (
                                    selectedMaterial?.costPrice ??
                                    selectedMaterial?.averagePrice ??
                                    0
                                ).toString(),
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

    // Handler: Remove material
    const handleRemoveMaterial = useCallback(
        (id: string, exportReceiptId?: string) => {
            // Optimistic update
            const previousMaterials = [...formMaterials];
            setFormMaterials(prev => prev.filter(item => item.id !== id));

            // If in edit mode and item has real ID (assuming id is materialId for server items), call API
            // Note: The mapping above uses materialId as 'id'.
            // However, we need to distinguish between 'temp local id' and 'server material id'.
            // In the map above: id: item.materialId || Date.now()...
            // So if it's a server item, id IS materialId.

            // Check if it's a server item (usually UUID, temp IDs are timestamps)
            const isTempId = !id.includes('-');

            if (isEditMode && exportReceiptId && !isTempId) {
                deleteReceiptItem(
                    { receiptId: exportReceiptId, itemId: id },
                    {
                        onError: (error: unknown) => {
                            const errorMessage = getErrorMessage(error, 'Lỗi xóa vật tư');
                            // Ignore "not found" errors as item is already gone
                            if (
                                !errorMessage.toLowerCase().includes('không tồn tại') &&
                                !errorMessage.toLowerCase().includes('not found')
                            ) {
                                showErrorToast(errorMessage);
                                setFormMaterials(previousMaterials); // Rollback
                            }
                        },
                    }
                );
            }
        },
        [formMaterials, isEditMode, deleteReceiptItem]
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
        handleRemoveMaterial,
    };
};
