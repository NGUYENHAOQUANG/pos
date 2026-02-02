import { useMemo } from 'react';
import { DropdownOption } from '@/features/material/components/material/DropdownMaterialGroup';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';

export const useMaterialOptions = (warehouseItems: IWarehouseItem[]): DropdownOption[] => {
    return useMemo(() => {
        if (warehouseItems.length > 0) {
            return warehouseItems.map((m: IWarehouseItem) => ({
                label: m.materialName || 'Unknown Material',
                value: m.materialId,
            }));
        }
        return [
            {
                label: 'Hiện tại không có vật tư',
                value: '__no_materials__',
                disabled: true,
            },
        ];
    }, [warehouseItems]);
};
