import {
    IWaterTreatmentRecord,
    TREATMENT_TYPE_LABELS,
} from '@/features/farm/types/waterTreatment.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { IMaterial } from '@/features/material/types/material.types';
import { IBaseLogService } from './base-log.interface';
import { PondLogMaterialType } from '@/shared/types/common.types';
import {
    sortLogsByCreatedAtDesc,
    calculateDailyIndex,
    formatTimeAndDate,
    DailyCountMap,
} from '@/features/farm/utils/work-log.utils';
import { pushMaterialRows } from '@/features/farm/utils/work-log.utils';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { IPondRecordReferenceData } from '@/features/farm/types/pondRecord.types';

const mapWaterTreatmentMaterials = (materials: PondLogMaterialType[] | undefined) => {
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

export const waterTreatmentLogService: IBaseLogService<IWaterTreatmentRecord> = {
    mapRecordToJobExecution: (
        item: IWaterTreatmentRecord,
        dayCounts: DailyCountMap,
        totalPerDay: DailyCountMap
    ): JobExecution => {
        const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
        const dailyIndex = calculateDailyIndex(createdDate, dayCounts, totalPerDay);
        const { timeStr, dateStr } = formatTimeAndDate(createdDate);

        const treatmentType = item.waterTreatmentDetail?.treatmentType;
        const treatmentLabel = treatmentType
            ? TREATMENT_TYPE_LABELS[treatmentType] || treatmentType
            : undefined;

        return {
            id: item.id,
            label: `Lần ${dailyIndex}`,
            time: timeStr,
            date: dateStr,
            note: item.waterTreatmentDetail?.notes?.trim() || undefined,
            pondId: item.pondId,
            waterTreatmentType: treatmentLabel,
            materials: mapWaterTreatmentMaterials(item.waterTreatmentDetail?.materials),
            images: item.documentIds || [],
            documentIds: item.documentIds || [],
            createdAt: item.createdAt,
        };
    },

    mapRecordsToJobs: (rawItems: IWaterTreatmentRecord[]): JobExecution[] => {
        const totalPerDay: DailyCountMap = {};
        rawItems.forEach(item => {
            const d = item.createdAt ? new Date(item.createdAt) : new Date();
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            totalPerDay[key] = (totalPerDay[key] || 0) + 1;
        });

        const sortedItems = sortLogsByCreatedAtDesc(rawItems);

        const dayCounts: DailyCountMap = {};
        const jobs = sortedItems.map(item => {
            return waterTreatmentLogService.mapRecordToJobExecution(item, dayCounts, totalPerDay);
        });

        return jobs;
    },

    convertReferenceDataToActivityData: (
        ref: IPondRecordReferenceData | Record<string, unknown>
    ): ActivityData[] => {
        const data: ActivityData[] = [];
        pushMaterialRows(data, (ref as any).materials);
        return data;
    },
};
