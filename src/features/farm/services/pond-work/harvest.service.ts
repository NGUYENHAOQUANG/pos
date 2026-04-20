import { HarvestType, IHarvestRecord } from '@/features/farm/types/harvestRecord.types';
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
    mapFormToPayload: (formData: HarvestFormData, sessionId?: string | null) =>
        mapFormToApiRequest(formData, sessionId),
    mapRecordToForm: (record?: IHarvestRecord): HarvestFormData => {
        if (!record) {
            return {
                harvestType: 'PartialHarvest',
                totalWeightKg: '0',
                shrimpSize: '',
                referencePrice: '',
                notes: '',
            };
        }
        const harvest = record.harvest || record.harvestDetail;
        return {
            harvestType: harvest?.harvestType || 'PartialHarvest',
            totalWeightKg: harvest?.totalWeightKg ? String(harvest.totalWeightKg) : '',
            shrimpSize: harvest?.shrimpSize ? String(harvest.shrimpSize) : '',
            referencePrice: harvest?.referencePrice ? String(harvest.referencePrice) : '',
            notes: harvest?.notes || '',
        };
    },
};
