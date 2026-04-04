import { IWaterSupplyRecord } from '@/features/farm/types/waterChange.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { IMaterial } from '@/features/material/types/material.types';
import { IBaseLogService } from './base-log.interface';
import { PondLogMaterialType } from '@/shared/types/common.types';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { IPondRecordReferenceData } from '@/features/farm/types/pondRecord.types';
import {
    sortLogsByCreatedAtDesc,
    calculateDailyIndex,
    formatTimeAndDate,
    DailyCountMap,
    pushMaterialRows,
} from '@/features/farm/utils/work-log.utils';

const mapWaterChangeMaterials = (materials: PondLogMaterialType[] | undefined) => {
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

export const waterChangeLogService: IBaseLogService<IWaterSupplyRecord> = {
    mapRecordToJobExecution: (
        item: IWaterSupplyRecord,
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
            note: item.waterChangeDetail?.note || undefined,
            pondId: item.pondId,
            materials: mapWaterChangeMaterials(item.waterChangeDetail?.materials),
            documentIds: item.waterChangeDetail?.documentIds || item.documentIds,
            images: item.waterChangeDetail?.documentIds || item.documentIds || [],
            meta: {
                targetLevel: item.waterChangeDetail?.targetWaterLevel,
                supplyLevel: item.waterChangeDetail?.waterAdded,
                drainLevel: item.waterChangeDetail?.waterRemoved?.toString(),
                volumeAfterDrain: item.waterChangeDetail?.previousVolume?.toString(),
                volumeSupply: item.waterChangeDetail?.addedVolume?.toString(),
                volumeAfterSupply: item.waterChangeDetail?.finalVolume?.toString(),
                images: item.waterChangeDetail?.documentIds || item.documentIds || [],
            },
            createdAt: item.createdAt,
        };
    },

    mapRecordsToJobs: (rawItems: IWaterSupplyRecord[]): JobExecution[] => {
        const totalPerDay: DailyCountMap = {};
        rawItems.forEach(item => {
            const d = item.createdAt ? new Date(item.createdAt) : new Date();
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            totalPerDay[key] = (totalPerDay[key] || 0) + 1;
        });

        const sortedItems = sortLogsByCreatedAtDesc(rawItems);

        const dayCounts: DailyCountMap = {};
        return sortedItems.map(item => {
            return waterChangeLogService.mapRecordToJobExecution(item, dayCounts, totalPerDay);
        });
    },

    convertReferenceDataToActivityData: (
        ref: IPondRecordReferenceData | Record<string, unknown>
    ): ActivityData[] => {
        const data: ActivityData[] = [];
        const ra = ref as any;
        if (ra.targetWaterLevel != null)
            data.push({ label: 'Mực nước mục tiêu (cm)', value: `${ra.targetWaterLevel}` });
        if (ra.waterAdded != null) data.push({ label: 'Số cm cấp', value: `${ra.waterAdded}` });
        if (ra.waterRemoved != null)
            data.push({ label: 'Mực nước xả xuống (cm)', value: `${ra.waterRemoved}` });
        if (ra.previousVolume != null)
            data.push({ label: 'Thể tích trước (m³)', value: `${ra.previousVolume}` });
        if (ra.addedVolume != null)
            data.push({ label: 'Thể tích nước cấp (m³)', value: `${ra.addedVolume}` });
        if (ra.finalVolume != null)
            data.push({ label: 'Thể tích sau cấp (m³)', value: `${ra.finalVolume}` });
        pushMaterialRows(data, ra.materials);
        return data;
    },
};
