import { IHarvestRecord } from '@/features/farm/types/harvestRecord.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { getHarvestTypeDisplay } from '@/features/farm/schemas/harvestFormSchema';
import { IBaseLogService } from './base-log.interface';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { IPondRecordReferenceData } from '@/features/farm/types/pondRecord.types';
import {
    sortLogsByCreatedAtDesc,
    calculateDailyIndex,
    formatTimeAndDate,
    DailyCountMap,
} from '@/features/farm/utils/work-log.utils';

export const harvestLogService: IBaseLogService<IHarvestRecord> = {
    mapRecordToJobExecution: (
        item: IHarvestRecord,
        dayCounts: DailyCountMap,
        totalPerDay: DailyCountMap
    ): JobExecution => {
        const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
        const dailyIndex = calculateDailyIndex(createdDate, dayCounts, totalPerDay);
        const { timeStr, dateStr } = formatTimeAndDate(createdDate);

        const detail = item.harvestDetail ?? item.harvest;

        return {
            id: item.id,
            label: `Lần ${dailyIndex}`,
            time: timeStr,
            date: dateStr,
            note: detail?.notes ?? undefined,
            pondId: item.pondId,
            documentIds: item.documentIds,
            images: item.documentIds ?? [],
            createdAt: item.createdAt,
            meta: detail
                ? {
                      harvestType: getHarvestTypeDisplay(detail.harvestType),
                      yieldAmount: detail.totalWeightKg?.toString(),
                      shrimpSize: detail.shrimpSize?.toString(),
                      referencePrice: detail.referencePrice?.toString(),
                      revenue: detail.revenue,
                      notes: detail.notes ?? undefined,
                  }
                : undefined,
        };
    },

    mapRecordsToJobs: (rawItems: IHarvestRecord[]): JobExecution[] => {
        const totalPerDay: DailyCountMap = {};
        rawItems.forEach(item => {
            const d = item.createdAt ? new Date(item.createdAt) : new Date();
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            totalPerDay[key] = (totalPerDay[key] || 0) + 1;
        });

        const sortedItems = sortLogsByCreatedAtDesc(rawItems);

        const dayCounts: DailyCountMap = {};
        return sortedItems.map(item => {
            return harvestLogService.mapRecordToJobExecution(item, dayCounts, totalPerDay);
        });
    },

    convertReferenceDataToActivityData: (
        ref: IPondRecordReferenceData | Record<string, unknown>,
        ..._extraContexts: unknown[]
    ): ActivityData[] => {
        const data: ActivityData[] = [];
        const r = ref as any;
        if (r.harvestType)
            data.push({ label: 'Loại thu hoạch', value: getHarvestTypeDisplay(r.harvestType) });
        if (r.totalWeightKg != null)
            data.push({ label: 'Sản lượng thu được (kg)', value: `${r.totalWeightKg}` });
        if (r.shrimpSize != null)
            data.push({ label: 'Cỡ tôm khu thu hoạch (con/kg)', value: `${r.shrimpSize}` });
        if (r.referencePrice != null && Number(r.referencePrice) > 0)
            data.push({
                label: 'Khảo giá (đ)',
                value: `${Number(r.referencePrice).toLocaleString('vi-VN')}`,
            });
        if (r.revenue != null && Number(r.revenue) > 0)
            data.push({
                label: 'Doanh thu',
                value: `${Number(r.revenue).toLocaleString('vi-VN')}`,
            });
        return data;
    },
};
