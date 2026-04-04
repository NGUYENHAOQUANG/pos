import { IStockTransfer, IStockTransferToPond } from '@/features/farm/types/stockTransfer.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { IBaseLogService } from './base-log.interface';
import {
    sortLogsByCreatedAtDesc,
    calculateDailyIndex,
    formatTimeAndDate,
    DailyCountMap,
} from '@/features/farm/utils/work-log.utils';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { IPondRecordReferenceData } from '@/features/farm/types/pondRecord.types';

const mapReceivingPonds = (toPonds: IStockTransferToPond[] | undefined) => {
    if (!toPonds) return [];

    return toPonds.map(tp => ({
        id: tp.toPondId,
        receivingPond: tp.toPondId,
        quantity: tp.quantity.toString(),
    }));
};

export const stockTransferLogService: IBaseLogService<IStockTransfer> = {
    mapRecordToJobExecution: (
        item: IStockTransfer,
        dayCounts: DailyCountMap,
        totalPerDay: DailyCountMap
    ): JobExecution => {
        const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
        const dailyIndex = calculateDailyIndex(createdDate, dayCounts, totalPerDay);
        const { timeStr, dateStr } = formatTimeAndDate(createdDate);

        return {
            id: item.id,
            label: `Lần ${dailyIndex}`,
            time: timeStr,
            date: dateStr,
            note: item.notes || undefined,
            pondId: item.fromPondId ?? '',
            meta: {
                shrimpSize: item.shrimpSizePcsPerKg?.toString(),
                transferMethod: 'Sang hết',
                receivingPonds: mapReceivingPonds(item.toPonds),
            },
            createdAt: item.createdAt,
        };
    },

    mapRecordsToJobs: (rawItems: IStockTransfer[]): JobExecution[] => {
        const totalPerDay: DailyCountMap = {};
        rawItems.forEach(item => {
            const d = item.createdAt ? new Date(item.createdAt) : new Date();
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            totalPerDay[key] = (totalPerDay[key] || 0) + 1;
        });

        const sortedItems = sortLogsByCreatedAtDesc(rawItems);

        const dayCounts: DailyCountMap = {};
        const jobs = sortedItems.map(item => {
            return stockTransferLogService.mapRecordToJobExecution(item, dayCounts, totalPerDay);
        });

        return jobs;
    },

    convertReferenceDataToActivityData: (
        ref: IPondRecordReferenceData | Record<string, unknown>,
        ...extraContexts: unknown[]
    ): ActivityData[] => {
        const pondNameMap = (extraContexts[2] as Record<string, string>) || {};
        const data: ActivityData[] = [];
        const r = ref as any;
        if (r.shrimpSizePcsPerKg != null)
            data.push({ label: 'Cỡ tôm (con/kg)', value: `${r.shrimpSizePcsPerKg}` });
        if (r.totalStocking != null)
            data.push({
                label: 'Tổng số lượng sang (con)',
                value: `${Number(r.totalStocking).toLocaleString('vi-VN')}`,
            });
        if (r.toPonds?.length) {
            r.toPonds.forEach((pond: any, index: number) => {
                const pondLabel =
                    pondNameMap[pond.toPondId] ||
                    pond.toPondName ||
                    `Ao đích ${r.toPonds.length > 1 ? index + 1 : ''}`.trim();
                data.push({
                    label: `${pondLabel} (con)`,
                    value: Number(pond.quantity).toLocaleString('vi-VN'),
                });
            });
        }
        return data;
    },
};
