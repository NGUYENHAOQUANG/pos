import { z } from 'zod';

const normalizeDecimal = (val: string): number => {
    const normalized = val.replace(/,/g, '.');
    return parseFloat(normalized);
};

const hasMaxDecimalPlaces = (val: string, max: number): boolean => {
    const normalized = val.replace(/,/g, '.');
    const parts = normalized.split('.');
    if (parts.length < 2) return true;
    return parts[1].length <= max;
};

const materialItemSchema = z.object({
    material: z.any(),
    quantity: z.number(),
    unit: z.string().optional().default(''),
});

export const siphonFormSchema = z.object({
    lossAmount: z
        .string()
        .min(1, 'Vui lòng nhập số tôm hao')
        .max(20, 'Số tôm hao tối đa 20 ký tự')
        .refine(val => !isNaN(normalizeDecimal(val)), {
            message: 'Số tôm hao phải là số hợp lệ',
        })
        .refine(val => normalizeDecimal(val) >= 0, {
            message: 'Số tôm hao không được âm',
        })
        .refine(val => hasMaxDecimalPlaces(val, 5), {
            message: 'Tối đa 5 chữ số thập phân',
        }),
    notes: z.string().max(2000, 'Ghi chú tối đa 2000 ký tự').optional().default(''),
    imageUris: z.array(z.string()).default([]),
    documentIds: z.array(z.string()).default([]),
    selectedMaterials: z.array(materialItemSchema).default([]),
});

export type SiphonFormValues = z.infer<typeof siphonFormSchema>;
