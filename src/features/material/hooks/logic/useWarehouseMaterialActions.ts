import { useMemo } from 'react';
import { Control, UseFormGetValues, UseFormSetValue, useFieldArray } from 'react-hook-form';
import { WarehouseFormValues } from '@/features/material/schemas/warehouseFormSchema';

export const useWarehouseMaterialActions = (
    control: Control<WarehouseFormValues>,
    getValues: UseFormGetValues<WarehouseFormValues>,
    setValue: UseFormSetValue<WarehouseFormValues>,
    availableMaterials: any[]
) => {
    const { append, remove } = useFieldArray({
        control,
        name: 'warehouseItems',
    });

    const materialActions = useMemo(
        () => ({
            add: () => {
                append({
                    id: Date.now().toString(),
                    materialId: '',
                    materialName: '',
                    quantity: '',
                    price: '',
                });
            },
            remove: (id: string) => {
                const currentItems = getValues('warehouseItems') || [];
                const index = currentItems.findIndex((i: any) => i.id === id);
                if (index !== -1) {
                    remove(index);
                }
            },
            update: (id: string, field: string, value: any) => {
                const currentItems = getValues('warehouseItems') || [];
                const index = currentItems.findIndex((i: any) => i.id === id);
                if (index !== -1) {
                    setValue(`warehouseItems.${index}.${field}` as any, value);
                    if (field === 'materialId') {
                        const selectedMaterial = availableMaterials.find(
                            m => m.materialId === value
                        );
                        setValue(
                            `warehouseItems.${index}.materialName` as any,
                            selectedMaterial?.materialName || ''
                        );
                    }
                }
            },
        }),
        [append, getValues, remove, setValue, availableMaterials]
    );

    return materialActions;
};
