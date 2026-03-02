import { z } from 'zod';

export const materialFormSchema = z.object({
    name: z.string().min(1, 'Vui lòng nhập tên vật tư'),
    group: z.string().min(1, 'Vui lòng chọn nhóm vật tư'),
    type: z.string().min(1, 'Vui lòng chọn loại vật tư'),
    unit: z.string().min(1, 'Vui lòng chọn đơn vị tính'),
    usage: z.string().optional(),
    manufacturer: z.string().optional(),
    isActive: z.boolean().default(true),
});

export type MaterialFormValues = z.infer<typeof materialFormSchema>;
