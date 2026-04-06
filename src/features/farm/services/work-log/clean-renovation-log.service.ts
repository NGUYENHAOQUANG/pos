import { ICleanRenovation } from '@/features/farm/types/cleanRenovation.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { IBaseLogService } from './base-log.interface';
import {
    calculateDailyIndex,
    DailyCountMap,
    formatTimeAndDate,
    sortLogsByCreatedAtDesc,
} from '@/features/farm/utils/work-log.utils';
import { pushMaterialRows } from '@/features/farm/utils/work-log.utils';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { IPondRecordReferenceData } from '@/features/farm/types/pondRecord.types';
import { IMaterial } from '@/features/material/types/material.types';
import { PondLogMaterialType } from '@/shared/types/common.types';

const mapCleanRenovationMaterials = (materials: PondLogMaterialType[] | undefined) => {
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

export const cleanRenovationLogService: IBaseLogService<ICleanRenovation> = {
    mapRecordToJobExecution: (
        item: ICleanRenovation,
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

        return {
            id: item.id,
            label: `Lần ${dailyIndex}`,
            time: timeStr,
            date: dateStr,
            note: item.detail?.notes || undefined,
            pondId: item.pondId ?? '',
            images: imageUrls,
            meta: {
                ...item.detail,
                images: imageUrls,
                documentIds: item.documentIds || [],
            },
            materials: mapCleanRenovationMaterials(item.detail?.materials),
            createdAt: item.createdAt,
        };
    },

    mapRecordsToJobs: (rawItems: ICleanRenovation[]): JobExecution[] => {
        const totalPerDay: DailyCountMap = {};
        rawItems.forEach(item => {
            const d = item.createdAt ? new Date(item.createdAt) : new Date();
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            totalPerDay[key] = (totalPerDay[key] || 0) + 1;
        });

        const sortedItems = sortLogsByCreatedAtDesc(rawItems);

        const dayCounts: DailyCountMap = {};
        return sortedItems.map(item => {
            return cleanRenovationLogService.mapRecordToJobExecution(item, dayCounts, totalPerDay);
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
