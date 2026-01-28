import { useCallback } from 'react';
import { IWarehouseItem } from '@/features/material/types/material.types';

interface UseMaterialSelectionProps {
    warehouseItems: IWarehouseItem[];
    setSelectedMaterialId: (id: string) => void;
    setMaterialName: (name: string) => void;
    setOldStock: (stock: number) => void;
    setMaterialGroup: (group: string) => void;
    setNewStock: (stock: string) => void;
}

export const useMaterialSelection = ({
    warehouseItems,
    setSelectedMaterialId,
    setMaterialName,
    setOldStock,
    setMaterialGroup,
    setNewStock,
}: UseMaterialSelectionProps) => {
    const handleMaterialSelect = useCallback(
        (val: string) => {
            setSelectedMaterialId(val);
            const selectedItem = warehouseItems.find((m: IWarehouseItem) => m.materialId === val);

            if (selectedItem) {
                setMaterialName(selectedItem.materialName || '');
                setOldStock(selectedItem.quantity || 0);
                setMaterialGroup('');
            } else {
                setMaterialName('');
                setOldStock(0);
                setMaterialGroup('');
            }
            setNewStock('');
        },
        [
            warehouseItems,
            setSelectedMaterialId,
            setMaterialName,
            setOldStock,
            setMaterialGroup,
            setNewStock,
        ]
    );

    return { handleMaterialSelect };
};
