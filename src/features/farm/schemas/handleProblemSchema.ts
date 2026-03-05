import { z } from 'zod';
import { IMaterial } from '@/features/material/types/material.types';

export const handleProblemMaterialSchema = z.object({
    material: z.any() as unknown as z.ZodType<IMaterial>,
    quantity: z.number().min(0, 'Vui lòng nhập số lượng'),
    unit: z.string().min(1, 'Vui lòng chọn đơn vị'),
});

export const handleProblemSchema = z.object({
    selectedDate: z.date({ required_error: 'Vui lòng chọn ngày giờ' }),
    selectedMaterials: z.array(handleProblemMaterialSchema),
    note: z.string().optional(),
    imageUris: z.array(z.string()).optional(),
    documentIds: z.array(z.string()).optional(),
});

export type HandleProblemFormValues = z.infer<typeof handleProblemSchema>;
