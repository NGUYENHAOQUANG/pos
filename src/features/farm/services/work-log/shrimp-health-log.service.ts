import { ShrimpHealthCheckDto } from '@/features/farm/types/shrimpHealthCheck.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { IBaseLogService } from './base-log.interface';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { IPondRecordReferenceData } from '@/features/farm/types/pondRecord.types';
import { mapFromApiResponse } from '@/features/farm/utils/shrimpHealthCheckMapper';
import {
    sortLogsByCreatedAtDesc,
    calculateDailyIndex,
    formatTimeAndDate,
    DailyCountMap,
} from '@/features/farm/utils/work-log.utils';

export const shrimpHealthLogService: IBaseLogService<ShrimpHealthCheckDto> = {
    mapRecordToJobExecution: (
        item: ShrimpHealthCheckDto,
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
        }

        const uiState = mapFromApiResponse({
            value: item.value,
            healthCheck: item.healthCheck,
            images: imageUrls,
        });

        return {
            id: item.id,
            label: `Lần ${dailyIndex}`,
            time: timeStr,
            date: dateStr,
            note: uiState.notes,
            pondId: item.pondId ?? '',
            meta: {
                foodAmount: uiState.foodAmount,
                leftoverFood: uiState.leftoverFood,
                intestine: uiState.intestine,
                intestineColor: uiState.intestineColor,
                stoolColor: uiState.stoolColor,
                liver: uiState.liver,
                images: uiState.images,
                documentIds: item.documents?.map(doc => doc.id) || [],
                averageInfectionRate: uiState.averageInfectionRate,
                isHealthy: uiState.isHealthy,
                diagnosisDetails: uiState.diagnosisDetails,
                aiItems: uiState.aiItems,
            },
            createdAt: item.createdAt,
        };
    },

    mapRecordsToJobs: (rawItems: ShrimpHealthCheckDto[]): JobExecution[] => {
        const totalPerDay: DailyCountMap = {};
        rawItems.forEach(item => {
            const d = item.createdAt ? new Date(item.createdAt) : new Date();
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            totalPerDay[key] = (totalPerDay[key] || 0) + 1;
        });

        const sortedItems = sortLogsByCreatedAtDesc(rawItems);

        const dayCounts: DailyCountMap = {};
        return sortedItems.map(item => {
            return shrimpHealthLogService.mapRecordToJobExecution(item, dayCounts, totalPerDay);
        });
    },

    convertReferenceDataToActivityData: (
        ref: IPondRecordReferenceData | Record<string, unknown>,
        _extraContexts: unknown[]
    ): ActivityData[] => {
        const r = ref as any;
        const uiState = mapFromApiResponse({
            value: r.feedInTrapG ?? 0,
            healthCheck: r,
            images: r.documents?.map((d: any) => d.publicUrl) || [],
        });

        const res: ActivityData[] = [];

        if (uiState.foodAmount)
            res.push({ label: 'Thức ăn trong nhá (g)', value: uiState.foodAmount });
        if (uiState.leftoverFood) res.push({ label: 'Cặn thức ăn', value: uiState.leftoverFood });

        if (uiState.intestine) res.push({ label: 'Tình trạng ruột', value: uiState.intestine });
        if (uiState.intestineColor)
            res.push({ label: 'Màu sắc ruột', value: uiState.intestineColor });
        if (uiState.stoolColor) res.push({ label: 'Màu sắc phân', value: uiState.stoolColor });
        if (uiState.liver) res.push({ label: 'Tình trạng gan', value: uiState.liver });

        if (uiState.averageInfectionRate != null) {
            res.push({
                label: 'Tỷ lệ nhiễm bệnh trung bình (%)',
                value: `${uiState.averageInfectionRate}`,
            });
        }
        if (uiState.isHealthy !== undefined) {
            res.push({
                label: 'Tình trạng tôm',
                value: uiState.isHealthy ? 'Khoẻ mạnh' : 'Nhiễm bệnh',
            });
        }
        if (uiState.diagnosisDetails?.length) {
            const types = uiState.diagnosisDetails.map((d: any) => d.targetType).join(', ');
            res.push({ label: 'Loại bệnh phát hiện', value: types });
        }
        return res;
    },
};
