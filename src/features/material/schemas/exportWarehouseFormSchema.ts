import * as z from 'zod';

export const exportMaterialItemSchema = z.object({
    id: z.string(),
    materialId: z.string().min(1, 'Vui lòng chọn vật tư'),
    materialName: z.string().optional(),
    quantity: z.string().refine(val => parseFloat(val) > 0, 'Số lượng phải lớn hơn 0'),
    price: z.string().optional(),
    unit: z.string().optional(),
    availableQuantity: z.number().optional(),
});

export const exportWarehouseFormSchema = z.object({
    date: z.date(),
    selectedZone: z.string().min(1, 'Vui lòng chọn trại nuôi'),
    selectedPond: z.string().min(1, 'Vui lòng chọn ao nuôi'),
    note: z.string().optional(),
    files: z.array(z.any()).optional(),
    exportItems: z
        .array(exportMaterialItemSchema)
        .min(1, 'Vui lòng chọn ít nhất 1 vật tư')
        .optional(),
});

export type ExportWarehouseFormValues = z.infer<typeof exportWarehouseFormSchema>;
