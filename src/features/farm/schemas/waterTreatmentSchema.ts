import { z } from 'zod';
import { SelectedMaterialItem } from '@/features/farm/components/bottom-sheet/MaterialSelectionBox';

const materialItemSchema = z.custom<SelectedMaterialItem>();

export const waterTreatmentSchema = z.object({
    executionDate: z.date(),
    activityType: z.string().min(1, 'Vui lòng chọn loại hoạt động'),
    note: z.string().max(2000, 'Ghi chú tối đa 2000 ký tự').optional().default(''),
    documentIds: z.array(z.string()).default([]),
    selectedMaterials: z.array(materialItemSchema).default([]),
});

export type WaterTreatmentFormValues = z.infer<typeof waterTreatmentSchema>;
