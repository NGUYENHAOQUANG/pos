import { z } from 'zod';

export enum LeftoverFoodEnum {
    NONE = 'Hết',
    LESS_THAN_10 = 'Còn 5–10%',
    LESS_THAN_15 = 'Còn 10–15%',
    LESS_THAN_20 = 'Còn 15–20%',
}

export enum IntestineStatusEnum {
    FULL = 'Đầy',
    EMPTY = 'Rỗng',
}

export enum IntestineColorEnum {
    FOOD_COLOR = 'Màu thức ăn',
    BLACK = 'Màu đen',
    ABNORMAL = 'Bất thường',
}

export enum StoolColorEnum {
    FOOD_COLOR = 'Màu thức ăn',
    ABNORMAL = 'Bất thường',
}

export enum LiverStatusEnum {
    NORMAL = 'Bình thường',
    ABNORMAL = 'Bất thường',
}

export const shrimpInspectionSchema = z.object({
    date: z.date(),
    foodAmount: z.string().trim().min(1, 'Vui lòng nhập lượng thức ăn cho vào nhá'),
    leftoverFood: z.nativeEnum(LeftoverFoodEnum).default(LeftoverFoodEnum.NONE),
    intestine: z.nativeEnum(IntestineStatusEnum).default(IntestineStatusEnum.FULL),
    intestineColor: z.nativeEnum(IntestineColorEnum).default(IntestineColorEnum.FOOD_COLOR),
    stoolColor: z.nativeEnum(StoolColorEnum).default(StoolColorEnum.FOOD_COLOR),
    liver: z.nativeEnum(LiverStatusEnum).default(LiverStatusEnum.NORMAL),
    notes: z.string().max(2000, 'Ghi chú tối đa 2000 ký tự').optional().default(''),
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
