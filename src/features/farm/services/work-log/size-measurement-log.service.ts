import { ISizeMeasurement } from '@/features/farm/types/sizeMeasurement.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { IBaseLogService } from './base-log.interface';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { IPondRecordReferenceData } from '@/features/farm/types/pondRecord.types';
import {
    sortLogsByCreatedAtDesc,
    calculateDailyIndex,
    formatTimeAndDate,
    DailyCountMap,
} from '@/features/farm/utils/work-log.utils';

export const sizeMeasurementLogService: IBaseLogService<ISizeMeasurement> = {
    mapRecordToJobExecution: (
        item: ISizeMeasurement,
        dayCounts: DailyCountMap,
        totalPerDay: DailyCountMap
    ): JobExecution => {
        const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
        const dailyIndex = calculateDailyIndex(createdDate, dayCounts, totalPerDay);
        const { timeStr, dateStr } = formatTimeAndDate(createdDate);

        let imageUrls: string[] = [];
        if (item.documents && item.documents.length > 0) {
            imageUrls = item.documents
                .map(doc => doc.publicUrl)
                .filter((url): url is string => !!url);
        } else if (item.documentIds && item.documentIds.length > 0) {
            imageUrls = item.documentIds;
        }

        const sizeDetail = item.sizeMeasurementDetail ?? item.sizeMeasurement;

        return {
            id: item.id,
            label: `Lần ${dailyIndex}`,
            time: timeStr,
            date: dateStr,
            note: sizeDetail?.notes || undefined,
            pondId: item.pondId ?? '',
            images: imageUrls,
            meta: {
                shrimpSize: sizeDetail?.shrimpSizePcsPerKg?.toString(),
                remainingWeight: sizeDetail?.estimatedRemainingStockKg?.toString(),
                totalShrimpCount: sizeDetail?.totalShrimpCount || null,
                survivalRate: sizeDetail?.survivalRatePercentage || null,
                averageShrimpSize: sizeDetail?.averageShrimpSize ?? null,
                notes: sizeDetail?.notes ?? undefined,
                images: imageUrls,
                documentIds: item.documentIds || [],
            },
            createdAt: item.createdAt,
        };
    },

    mapRecordsToJobs: (rawItems: ISizeMeasurement[]): JobExecution[] => {
        const totalPerDay: DailyCountMap = {};
        rawItems.forEach(item => {
            const d = item.createdAt ? new Date(item.createdAt) : new Date();
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            totalPerDay[key] = (totalPerDay[key] || 0) + 1;
        });

        const sortedItems = sortLogsByCreatedAtDesc(rawItems);

        const dayCounts: DailyCountMap = {};
        return sortedItems.map(item => {
            return sizeMeasurementLogService.mapRecordToJobExecution(item, dayCounts, totalPerDay);
        });
    },

    convertReferenceDataToActivityData: (
        ref: IPondRecordReferenceData | Record<string, unknown>,
        _extraContexts: unknown[]
    ): ActivityData[] => {
        const data: ActivityData[] = [];
        const r = ref as any;
        if (r.shrimpSizePcsPerKg != null)
            data.push({ label: 'Cỡ tôm (con/kg)', value: `${r.shrimpSizePcsPerKg}` });
        if (r.averageShrimpSize != null && Number(r.averageShrimpSize) > 0)
            data.push({ label: 'Trọng lượng tôm TB (g/con)', value: `${r.averageShrimpSize}` });
        if (r.estimatedRemainingStockKg != null)
            data.push({ label: 'Sản lượng còn lại (kg)', value: `${r.estimatedRemainingStockKg}` });
        if (r.totalShrimpCount != null)
            data.push({
                label: 'Tổng số tôm hiện tại (con)',
                value: `${Math.round(Number(r.totalShrimpCount))}`,
            });
        if (r.releaseQuantity != null)
            data.push({ label: 'Số lượng thả (con)', value: `${r.releaseQuantity}` });
        if (r.survivalRatePercentage != null)
            data.push({
                label: 'Tỉ lệ sống (%)',
                value: `${Math.round(Number(r.survivalRatePercentage))}`,
            });
        return data;
    },
};
