import * as z from 'zod';

export const materialItemSchema = z.object({
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
    price: z
        .string()
        .min(1, 'Vui lòng nhập đơn giá')
        .refine(val => {
            const num = parseFloat(val);
            return !isNaN(num) && num >= 0;
        }, 'Đơn giá không được âm')
        .refine(val => {
            return !val.includes('.');
        }, 'Đơn giá phải là số nguyên'),
    unit: z.string().optional(),
});

export const warehouseFormSchema = z.object({
    date: z.date(),
    supplier: z.string().min(1, 'Vui lòng chọn nhà cung cấp'),
    note: z.string().max(2000, 'Ghi chú tối đa 2000 ký tự').optional(),
    files: z.array(z.any()).optional(),
    warehouseItems: z.array(materialItemSchema).min(1, 'Vui lòng chọn ít nhất 1 vật tư'),
});

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;
