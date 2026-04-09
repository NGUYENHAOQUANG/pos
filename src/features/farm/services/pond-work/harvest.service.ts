import { HarvestType } from '@/features/farm/types/harvestRecord.types';
import { HarvestFormData, mapFormToApiRequest } from '@/features/farm/schemas/harvestFormSchema';
import { HarvestMeta, JobExecution } from '@/features/farm/types/farm.types';

export const harvestService = {
    mapDetailToForm: (meta: HarvestMeta, itemToEdit?: JobExecution): HarvestFormData => {
        const typeMap: Record<string, HarvestType> = {
            'Thu hết': 'FullHarvest',
            'Thu hoạch hết': 'FullHarvest',
            FullHarvest: 'FullHarvest',
            'Thu tỉa': 'PartialHarvest',
            PartialHarvest: 'PartialHarvest',
        };
        const harvestType = typeMap[meta.harvestType || 'Thu hết'] || 'PartialHarvest';

        return {
            harvestType,
            totalWeightKg: meta.yieldAmount ? String(meta.yieldAmount) : '',
            shrimpSize: meta.shrimpSize ? String(meta.shrimpSize) : '',
            referencePrice: meta.referencePrice ? String(meta.referencePrice) : '',
            notes: itemToEdit?.note || '',
        };
    },
    mapFormToPayload: mapFormToApiRequest,
};
