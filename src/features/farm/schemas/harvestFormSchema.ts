import { z } from 'zod';
import { HarvestType } from '@/features/farm/types/harvestRecord.types';

/**
 * Harvest Form Schema
 * Validates required fields before sending to API
 */
export const harvestFormSchema = z.object({
    harvestType: z.enum(['FullHarvest', 'PartialHarvest'] as const),
    totalWeightKg: z
        .string({ required_error: 'Vui lòng nhập sản lượng' })
        .min(1, 'Vui lòng nhập sản lượng')
        .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'Sản lượng phải lớn hơn 0',
        }),
    shrimpSize: z
        .string({ required_error: 'Vui lòng nhập cỡ tôm' })
        .min(1, 'Vui lòng nhập cỡ tôm')
        .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'Cỡ tôm phải lớn hơn 0',
        }),
    referencePrice: z
        .string({ required_error: 'Vui lòng nhập giá tôm tham khảo' })
        .min(1, 'Vui lòng nhập giá tôm tham khảo')
        .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'Giá tôm tham khảo phải lớn hơn 0',
        }),
    notes: z.string().optional(),
});

/**
 * Inferred TypeScript type from schema
 */
export type HarvestFormData = z.infer<typeof harvestFormSchema>;

/**
 * Helper to map form data to API request
 */
export const mapFormToApiRequest = (formData: HarvestFormData) => {
    const totalWeightKgStr = formData.totalWeightKg?.trim();
    const shrimpSizeStr = formData.shrimpSize?.trim();
    const referencePriceStr = formData.referencePrice?.trim();
    const notesStr = formData.notes?.trim();

    const weightNum = totalWeightKgStr ? parseFloat(totalWeightKgStr) : 0;
    const priceNum = referencePriceStr ? parseFloat(referencePriceStr) : 0;
    const revenue = weightNum * priceNum;

    const harvest: any = {
        harvestType: formData.harvestType,
        revenue,
    };

    if (totalWeightKgStr) harvest.totalWeightKg = weightNum;
    if (shrimpSizeStr) harvest.shrimpSize = parseFloat(shrimpSizeStr);
    if (referencePriceStr) harvest.referencePrice = priceNum;
    if (notesStr) harvest.notes = notesStr;

    return {
        value: revenue,
        harvest,
    };
};

/**
 * Helper to map HarvestType to Vietnamese display text
 */
export const getHarvestTypeDisplay = (type: HarvestType): string => {
    const map: Record<HarvestType, string> = {
        FullHarvest: 'Thu hết',
        PartialHarvest: 'Thu tỉa',
    };
    return map[type];
};

/**
 * Helper to map Vietnamese display text to HarvestType
 */
export const getHarvestTypeFromDisplay = (display: string): HarvestType => {
    const map: Record<string, HarvestType> = {
        'Thu hết': 'FullHarvest',
        'Thu tỉa': 'PartialHarvest',
    };
    return map[display] || 'PartialHarvest';
};
