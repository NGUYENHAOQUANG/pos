import { useMemo } from 'react';
import { Control, UseFormGetValues, UseFormSetValue, useFieldArray } from 'react-hook-form';
import { InventoryFormValues } from '@/features/material/schemas/inventoryFormSchema';
import { InventoryItem } from '@/features/material/components/inventory/InventoryMaterialList';

export const useInventoryMaterialActions = (
    control: Control<InventoryFormValues>,
    getValues: UseFormGetValues<InventoryFormValues>,
    setValue: UseFormSetValue<InventoryFormValues>,
    availableMaterials: any[]
) => {
    const { append, remove } = useFieldArray({
        control,
        name: 'inventoryItems',
    });

    const materialActions = useMemo(
        () => ({
            add: () => {
                append({
                    id: Date.now().toString() + Math.random(),
                    materialId: '',
                    materialName: '',
                    oldStock: 0,
                    newStock: '',
                    difference: 0,
                    unit: '',
                });
            },
            remove: (id: string) => {
                const currentItems = getValues('inventoryItems') || [];
                const index = currentItems.findIndex((i: any) => i.id === id);
                if (index !== -1) {
                    remove(index);
                }
            },
            update: (id: string, field: keyof InventoryItem, value: any) => {
                const currentItems = getValues('inventoryItems') || [];
                const index = currentItems.findIndex((i: any) => i.id === id);
                if (index !== -1) {
                    setValue(`inventoryItems.${index}.${field}` as any, value);

                    if (field === 'materialId') {
                        const selectedMaterial = availableMaterials.find(
                            m => m.materialId === value
                        );
                        if (selectedMaterial) {
                            setValue(
                                `inventoryItems.${index}.materialName` as any,
                                selectedMaterial.materialName || ''
                            );
                            setValue(
                                `inventoryItems.${index}.oldStock` as any,
                                selectedMaterial.quantity || 0
                            );
                            setValue(
                                `inventoryItems.${index}.unit` as any,
                                selectedMaterial.unitName || ''
                            );
                            setValue(
                                `inventoryItems.${index}.materialCode` as any,
                                selectedMaterial.materialCode || ''
                            );

                            const item = getValues(`inventoryItems.${index}`);
                            const currentNewStock = parseFloat(item?.newStock ?? '') || 0;
                            setValue(
                                `inventoryItems.${index}.difference` as any,
                                currentNewStock - (selectedMaterial.quantity || 0)
                            );
                        }
                    } else if (field === 'newStock') {
                        const newStockVal = value === '' ? 0 : parseFloat(value);
                        const item = getValues(`inventoryItems.${index}`);
                        setValue(
                            `inventoryItems.${index}.difference` as any,
                            newStockVal - (item?.oldStock || 0)
                        );
                    }
                }
            },
        }),
        [append, getValues, remove, setValue, availableMaterials]
    );

    return materialActions;
};
