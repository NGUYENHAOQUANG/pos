import * as z from 'zod';

const MAX_DECIMAL_PLACES = 5;

export const inventoryItemSchema = z.object({
    id: z.string(),
    materialId: z.string().min(1, 'Vui lòng chọn vật tư'),
    materialName: z.string().optional(),
    oldStock: z.number().min(0, 'Tồn kho không hợp lệ').default(0),
    newStock: z
        .string()
        .min(1, 'Vui lòng nhập tồn kho thực tế')
        .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'Số lượng không được âm')
        .refine(val => {
            const parts = val.split('.');
            return !parts[1] || parts[1].length <= MAX_DECIMAL_PLACES;
        }, `Tối đa ${MAX_DECIMAL_PLACES} chữ số thập phân`),
    difference: z.number().default(0),
    unit: z.string().optional(),
    materialCode: z.string().optional(),
});

export const inventoryFormSchema = z.object({
    date: z.date(),
    note: z.string().max(2000, 'Chú thích tối đa 2000 ký tự').optional(),
    inventoryItems: z.array(inventoryItemSchema).optional(),
});

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;
