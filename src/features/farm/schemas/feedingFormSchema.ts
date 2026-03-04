import { z } from 'zod';
import { IMaterial } from '@/features/material/types/material.types';

export const feedingFormSchema = z.object({
    executionDate: z.date({ required_error: 'Vui lòng chọn ngày giờ' }),
    materials: z
        .array(
            z.object({
                materialId: z.string(),
                materialName: z.string(),
                quantity: z.number().min(0.0001, 'Số lượng phải lớn hơn 0'),
                unit: z.string(),
                rawMaterial: z.custom<IMaterial>().optional(),
            })
        )
        .min(1, 'Vui lòng chọn ít nhất một vật tư'),
    mode: z.enum(['manual', 'schedule']).default('manual'),
    schedules: z
        .array(
            z.object({
                id: z.string().optional(),
                startTime: z.date().nullable(),
                endTime: z.date().nullable(),
            })
        )
        .optional()
        .default([]),
    note: z.string().optional(),
});

export type FeedingFormValues = z.infer<typeof feedingFormSchema>;
