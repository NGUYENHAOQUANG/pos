import { z } from 'zod';

export const shrimpInspectionSchema = z.object({
    // Thông tin chung
    date: z.date(),

    // Trường bắt buộc khi tạo mới
    foodAmount: z.string().trim().min(1, 'Vui lòng nhập lượng thức ăn giảm'),

    // Các trường tuỳ chọn / có giá trị mặc định
    leftoverFood: z.string().optional(),
    intestine: z.string().optional(),
    intestineColor: z.string().optional(),
    stoolColor: z.string().optional(),
    liver: z.string().optional(),
    notes: z.string().optional(),

    // Hình ảnh
    images: z.array(z.string()).optional(),

    // Kết quả AI (không bắt buộc)
    averageInfectionRate: z.number().optional(),
    isHealthy: z.boolean().optional(),
    diagnosisDetails: z
        .array(
            z.object({
                diseaseType: z.string(),
                probabilityPercent: z.number(),
            })
        )
        .nullable()
        .optional(),
    aiItems: z.array(z.unknown()).optional(),
});

export type ShrimpInspectionFormValues = z.infer<typeof shrimpInspectionSchema>;
