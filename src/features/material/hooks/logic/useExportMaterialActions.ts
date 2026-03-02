import { useMemo } from 'react';
import { Control, UseFormGetValues, UseFormSetValue, useFieldArray } from 'react-hook-form';
import { ExportWarehouseFormValues } from '@/features/material/schemas/exportWarehouseFormSchema';

export const useExportMaterialActions = (
    control: Control<ExportWarehouseFormValues>,
    getValues: UseFormGetValues<ExportWarehouseFormValues>,
    setValue: UseFormSetValue<ExportWarehouseFormValues>,
    availableMaterials: any[]
) => {
    const { append, remove } = useFieldArray({
        control,
        name: 'exportItems',
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
                    unit: '',
                });
            },
            remove: (id: string) => {
                const currentItems = getValues('exportItems') || [];
                const index = currentItems.findIndex((i: any) => i.id === id);
                if (index !== -1) {
                    remove(index);
                }
            },
            update: (
                id: string,
                field: keyof NonNullable<ExportWarehouseFormValues['exportItems']>[number],
                value: any
            ) => {
                const currentItems = getValues('exportItems') || [];
                const index = currentItems.findIndex((i: any) => i.id === id);
                if (index !== -1) {
                    setValue(`exportItems.${index}.${field}` as any, value);
                    if (field === 'materialId') {
                        const selectedMaterial = availableMaterials.find(
                            m => m.materialId === value
                        );
                        setValue(
                            `exportItems.${index}.materialName` as any,
                            selectedMaterial?.materialName || ''
                        );
                        if (selectedMaterial) {
                            setValue(
                                `exportItems.${index}.price` as any,
                                selectedMaterial.costPrice?.toString() || '0'
                            );
                            setValue(
                                `exportItems.${index}.unit` as any,
                                selectedMaterial.unitName || ''
                            );
                            // Set availableQuantity for dropdown stock check visualization
                            setValue(
                                `exportItems.${index}.availableQuantity` as any,
                                selectedMaterial.quantity || 0
                            );
                        }
                    }
                }
            },
        }),
        [append, getValues, remove, setValue, availableMaterials]
    );

    return materialActions;
};
