import { useMemo } from 'react';
import { Control, UseFormGetValues, UseFormSetValue, useFieldArray } from 'react-hook-form';
import { ExportWarehouseFormValues } from '@/features/material/schemas/exportWarehouseFormSchema';

export const useExportMaterialActions = (
    control: Control<ExportWarehouseFormValues>,
    getValues: UseFormGetValues<ExportWarehouseFormValues>,
    setValue: UseFormSetValue<ExportWarehouseFormValues>
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
                const index = currentItems.findIndex((i: { id: string }) => i.id === id);
                if (index !== -1) {
                    remove(index);
                }
            },
            update: (
                id: string,
                field: keyof NonNullable<ExportWarehouseFormValues['exportItems']>[number],
                value: string | number
            ) => {
                const currentItems = getValues('exportItems') || [];
                const index = currentItems.findIndex((i: { id: string }) => i.id === id);
                if (index !== -1) {
                    setValue(`exportItems.${index}.${field}` as any, value as any);
                }
            },
        }),
        [append, getValues, remove, setValue]
    );

    return materialActions;
};
