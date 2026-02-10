import { z } from 'zod';
import { HarvestType } from '@/features/farm/types/harvestRecord.types';

/**
 * Harvest Form Schema
 * Simple schema without validation - API handles all validation
 */
export const harvestFormSchema = z.object({
    harvestType: z.enum(['FullHarvest', 'PartialHarvest'] as const),
    totalWeightKg: z.string().optional(),
    shrimpSize: z.string().optional(),
    referencePrice: z.string().optional(),
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
