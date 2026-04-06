import { FeedingRecordItem } from '@/features/farm/types/feedingRecord.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { IMaterial } from '@/features/material/types/material.types';
import { IBaseLogService } from './base-log.interface';
import {
    sortLogsByCreatedAtDesc,
    calculateDailyIndex,
    formatTimeAndDate,
    DailyCountMap,
} from '@/features/farm/utils/work-log.utils';
import { pushMaterialRows } from '@/features/farm/utils/work-log.utils';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { IPondRecordReferenceData } from '@/features/farm/types/pondRecord.types';

import { PondLogMaterialType } from '@/shared/types/common.types';

const mapFeedingMaterials = (materials: PondLogMaterialType[] | undefined) => {
    if (!materials) return undefined;

    return materials.map(m => {
        return {
            material: {
                id: m.warehouseItemId,
                name: m.name || 'Vật tư',
                unitName: m.unitName || '',
            } as IMaterial,
            quantity: m.quantity,
            unit: m.unitName || '',
        };
    });
};

export const feedingLogService: IBaseLogService<FeedingRecordItem> = {
    mapRecordToJobExecution: (
        item: FeedingRecordItem,
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
            note: item.feedingDetail?.notes ?? undefined,
            pondId: item.pondId,
            materials: mapFeedingMaterials(item.feedingDetail?.materials),
            documentIds: item.documentIds,
            images: item.documentIds ?? [],
            createdAt: item.createdAt,
        };
    },

    mapRecordsToJobs: (rawItems: FeedingRecordItem[]): JobExecution[] => {
        const totalPerDay: DailyCountMap = {};
        rawItems.forEach(item => {
            const d = item.createdAt ? new Date(item.createdAt) : new Date();
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            totalPerDay[key] = (totalPerDay[key] || 0) + 1;
        });

        const sortedItems = sortLogsByCreatedAtDesc(rawItems);

        const dayCounts: DailyCountMap = {};
        return sortedItems.map(item => {
            return feedingLogService.mapRecordToJobExecution(item, dayCounts, totalPerDay);
        });
    },

    convertReferenceDataToActivityData: (
        ref: IPondRecordReferenceData | Record<string, unknown>
    ): ActivityData[] => {
        const data: ActivityData[] = [];
        pushMaterialRows(data, (ref as any).materials);
        return data;
    },
};
