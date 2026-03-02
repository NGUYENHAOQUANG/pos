import * as z from 'zod';

export const inventoryItemSchema = z.object({
    id: z.string(),
    materialId: z.string().min(1, 'Vui lòng chọn vật tư'),
    materialName: z.string().optional(),
    oldStock: z.number().default(0),
    newStock: z
        .string()
        .min(1, 'Vui lòng nhập tồn kho thực tế')
        .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'Số lượng không hợp lệ'), // actualQty
    difference: z.number().default(0),
    unit: z.string().optional(),
    materialCode: z.string().optional(),
});

export const inventoryFormSchema = z.object({
    date: z.date(),
    note: z.string().optional(),
    inventoryItems: z.array(inventoryItemSchema).optional(),
});

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;
