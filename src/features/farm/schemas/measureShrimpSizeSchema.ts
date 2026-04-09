import { z } from 'zod';

const normalizeDecimal = (val: string): number => {
    const normalized = val.replace(/,/g, '.');
    return parseFloat(normalized);
};

export const measureShrimpSizeSchema = z.object({
    executionDate: z.date(),
    shrimpSizePcsPerKg: z
        .string()
        .min(1, 'Vui lòng nhập kích cỡ tôm')
        .refine(val => !isNaN(normalizeDecimal(val)), { message: 'Kích cỡ tôm không hợp lệ' })
        .refine(val => normalizeDecimal(val) > 0, { message: 'Kích cỡ tôm phải lớn hơn 0' }),
    estimatedRemainingStockKg: z
        .string()
        .min(1, 'Vui lòng nhập trọng lượng tôm ước tính')
        .refine(val => !isNaN(normalizeDecimal(val)), { message: 'Trọng lượng không hợp lệ' })
        .refine(val => normalizeDecimal(val) >= 0, { message: 'Trọng lượng không hợp lệ' }),
    averageShrimpSize: z.string().optional().default(''),
    notes: z.string().max(2000, 'Ghi chú tối đa 2000 ký tự').optional().default(''),
    documentIds: z.array(z.string()).default([]),
    imageUris: z.array(z.string()).default([]),
});

export type MeasureShrimpSizeFormValues = z.infer<typeof measureShrimpSizeSchema>;
