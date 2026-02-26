import * as z from 'zod';

export const materialItemSchema = z.object({
    id: z.string(),
    materialId: z.string().min(1, 'Vui lòng chọn vật tư'),
    materialName: z.string().optional(),
    quantity: z.string().refine(val => parseFloat(val) > 0, 'Số lượng phải lớn hơn 0'),
    price: z.string().refine(val => parseFloat(val) > 0, 'Đơn giá phải lớn hơn 0'),
});

export const warehouseFormSchema = z.object({
    date: z.date(),
    supplier: z.string().min(1, 'Vui lòng chọn nhà cung cấp'),
    files: z.array(z.any()).optional(),
    warehouseItems: z.array(materialItemSchema).optional(),
});

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;
