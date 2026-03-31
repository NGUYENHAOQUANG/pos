import * as z from 'zod';

export const exportMaterialItemSchema = z.object({
    id: z.string(),
    materialId: z.string().min(1, 'Vui lòng chọn vật tư'),
    materialName: z.string().optional(),
    quantity: z
        .string()
        .min(1, 'Vui lòng nhập số lượng')
        .refine(val => {
            const num = parseFloat(val);
            return !isNaN(num) && num > 0;
        }, 'Số lượng phải lớn hơn 0')
        .refine(val => {
            const parts = val.split('.');
            if (parts.length === 2) {
                return parts[1].length <= 5;
            }
            return true;
        }, 'Tối đa 5 chữ số thập phân'),
    price: z.string().optional(),
    unit: z.string().optional(),
    availableQuantity: z.number().optional(),
});

export const exportWarehouseFormSchema = z.object({
    date: z.date(),
    selectedZone: z.string().min(1, 'Vui lòng chọn trại nuôi'),
    selectedPond: z.string().min(1, 'Vui lòng chọn ao nuôi'),
    note: z.string().max(2000, 'Ghi chú tối đa 2000 ký tự').optional(),
    files: z.array(z.any()).optional(),
    exportItems: z.array(exportMaterialItemSchema).min(1, 'Vui lòng chọn ít nhất 1 vật tư'),
});

export type ExportWarehouseFormValues = z.infer<typeof exportWarehouseFormSchema>;
