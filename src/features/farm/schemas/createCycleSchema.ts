import { z } from 'zod';

export const createCycleSchema = z.object({
    breedSource: z
        .string({ required_error: 'Bạn chưa chọn tôm giống' })
        .min(1, { message: 'Bạn chưa chọn tôm giống' }),
    season: z
        .string({ required_error: 'Bạn chưa chọn vụ nuôi' })
        .min(1, { message: 'Bạn chưa chọn vụ nuôi' }),
    cycleName: z
        .string({ required_error: 'Tên vụ nuôi không được để trống' })
        .trim()
        .min(1, { message: 'Tên vụ nuôi không được để trống' }),
    stockingDate: z.string().optional(),
    stockingQuantity: z.string().optional(),
    age: z.string().optional(),
    notes: z.string().optional(),
    density: z.number().optional(),
    breedName: z.string().optional(),
});

export type CreateCycleFormValues = z.infer<typeof createCycleSchema>;
