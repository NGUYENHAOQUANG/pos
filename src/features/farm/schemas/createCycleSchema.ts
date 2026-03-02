import { z } from 'zod';

export const createCycleSchema = z.object({
    breedSource: z.string({
        required_error: 'Vui lòng chọn nguồn giống',
        invalid_type_error: 'Nguồn giống không hợp lệ',
    }),
    season: z.string({
        required_error: 'Vui lòng chọn vụ nuôi',
        invalid_type_error: 'Vụ nuôi không hợp lệ',
    }),
    cycleName: z
        .string({
            required_error: 'Vui lòng nhập tên chu kỳ',
        })
        .min(3, 'Tên chu kỳ phải có ít nhất 3 ký tự')
        .max(100, 'Tên chu kỳ không được vượt quá 100 ký tự'),
    stockingDate: z
        .string({
            required_error: 'Vui lòng chọn ngày thả',
        })
        .min(1, 'Ngày thả không được để trống'),
    stockingQuantity: z
        .string({
            required_error: 'Vui lòng nhập số lượng thả',
        })
        .min(1, 'Số lượng thả không được để trống')
        .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'Số lượng thả phải lớn hơn 0',
        }),
    age: z
        .string({
            required_error: 'Vui lòng nhập ngày tuổi',
        })
        .min(1, 'Ngày tuổi không được để trống')
        .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'Ngày tuổi phải lớn hơn 0',
        }),
    notes: z.string().optional(),

    // Extra fields that help rendering UI but not sent to the server directly
    density: z.number().optional(),
    breedName: z.string().optional(),
});

export type CreateCycleFormValues = z.infer<typeof createCycleSchema>;
