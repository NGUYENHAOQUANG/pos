import { ISiphonRecord } from '@/features/farm/types/siphon.types';
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

const mapSiphonMaterials = (materials: PondLogMaterialType[] | undefined) => {
    if (!materials) return undefined;

    return materials.map(m => {
        return {
            material: {
                id: m.warehouseItemId,
                name: m.name || 'Vật tư',
                unitName: m.unitName || 'Đơn vị',
            } as IMaterial,
            quantity: m.quantity,
            unit: m.unitName || '',
        };
    });
};

export const siphonLogService: IBaseLogService<ISiphonRecord> = {
    mapRecordToJobExecution: (
        item: ISiphonRecord,
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
            note: item.siphonDetail?.notes || undefined,
            pondId: item.pondId,
            materials: mapSiphonMaterials(item.siphonDetail?.materials),
            documentIds: item.documentIds,
            images: item.documentIds ?? [],
            meta: {
                lossAmount: item.siphonDetail?.shrimpLossKg?.toString(),
                images: item.documentIds || [],
            },
            createdAt: item.createdAt,
        };
    },

    mapRecordsToJobs: (rawItems: ISiphonRecord[]): JobExecution[] => {
        const totalPerDay: DailyCountMap = {};
        rawItems.forEach(item => {
            const d = item.createdAt ? new Date(item.createdAt) : new Date();
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            totalPerDay[key] = (totalPerDay[key] || 0) + 1;
        });

        const sortedItems = sortLogsByCreatedAtDesc(rawItems);

        const dayCounts: DailyCountMap = {};
        return sortedItems.map(item => {
            return siphonLogService.mapRecordToJobExecution(item, dayCounts, totalPerDay);
        });
    },

    convertReferenceDataToActivityData: (
        ref: IPondRecordReferenceData | Record<string, unknown>
    ): ActivityData[] => {
        const data: ActivityData[] = [];
        if ((ref as any).shrimpLossKg != null) {
            data.push({ label: 'Hao hụt tôm (kg)', value: `${(ref as any).shrimpLossKg}` });
        }
        pushMaterialRows(data, (ref as any).materials);
        return data;
    },
};
