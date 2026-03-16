import { z } from 'zod';

export const createCycleSchema = z.object({
    breedSource: z
        .string({ required_error: 'Bạn chưa chọn tôm giống' })
        .min(1, { message: 'Bạn chưa chọn tôm giống' }),
    season: z
        .string({ required_error: 'Bạn chưa chọn vụ nuôi' })
        .min(1, { message: 'Bạn chưa chọn vụ nuôi' }),
    cycleName: z
        .string({ required_error: 'Tên chu kỳ không được để trống' })
        .trim()
        .min(1, { message: 'Tên chu kỳ không được để trống' }),
    stockingDate: z.string().optional(),
    stockingQuantity: z
        .string({ required_error: 'Tổng số lượng thả không được để trống' })
        .min(1, { message: 'Tổng số lượng thả không được để trống' }),
    age: z
        .string({ required_error: 'Ngày tuổi không được để trống' })
        .min(1, { message: 'Ngày tuổi không được để trống' }),
    notes: z.string().optional(),
    density: z.number().optional(),
    breedName: z.string().optional(),
});

export type CreateCycleFormValues = z.infer<typeof createCycleSchema>;
