import { z } from 'zod';

export const materialFormSchema = z.object({
    name: z.string().min(1, 'Vui lòng nhập tên vật tư').max(255, 'Tên vật tư tối đa 255 ký tự'),
    group: z.string().min(1, 'Vui lòng chọn nhóm vật tư'),
    type: z.string().min(1, 'Vui lòng chọn loại vật tư'),
    unit: z.string().min(1, 'Vui lòng chọn đơn vị tính'),
    usage: z.string().max(2000, 'Công dụng tối đa 2000 ký tự').optional(),
    manufacturer: z.string().max(255, 'Nhãn hàng tối đa 255 ký tự').optional(),
    isActive: z.boolean().default(true),
});

export type MaterialFormValues = z.infer<typeof materialFormSchema>;
