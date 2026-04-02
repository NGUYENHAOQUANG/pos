import {
    JobExecution,
    ENVIRONMENT_METRIC_IDS,
    EnvironmentMeta,
} from '@/features/farm/types/farm.types';
import { IBaseLogService } from './base-log.interface';
import {
    sortLogsByCreatedAtDesc,
    calculateDailyIndex,
    formatTimeAndDate,
    DailyCountMap,
} from '@/features/farm/utils/work-log.utils';
import { EnvMetricType } from '@/features/farm/types/environment.types';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { IPondRecordReferenceData } from '@/features/farm/types/pondRecord.types';

export const envMeasurementLogService: IBaseLogService<any> = {
    mapRecordToJobExecution: (
        item: any,
        dayCounts: DailyCountMap,
        totalPerDay: DailyCountMap,
        ...extraContexts: any[]
    ): JobExecution => {
        const metricTypes: EnvMetricType[] = extraContexts[0] || [];

        const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
        const dailyIndex = calculateDailyIndex(createdDate, dayCounts, totalPerDay);
        const { timeStr, dateStr } = formatTimeAndDate(createdDate);

        const meta: EnvironmentMeta = {};
        const details = item.envMeasurementDetail?.envMeasurementDetails || [];
        if (details.length > 0 && metricTypes.length > 0) {
            details.forEach((m: any) => {
                const metric = metricTypes.find(mt => mt.id === m.metricId);
                if (!metric) return;

                switch (metric.code) {
                    case ENVIRONMENT_METRIC_IDS.PH:
                        meta.pH = m.value?.toString();
                        meta.pHWarning = m.isAlerted;
                        break;
                    case ENVIRONMENT_METRIC_IDS.DO:
                        meta.do = m.value?.toString();
                        meta.doWarning = m.isAlerted;
                        break;
                    case ENVIRONMENT_METRIC_IDS.TEMPERATURE:
                        meta.temperature = m.value?.toString();
                        meta.temperatureWarning = m.isAlerted;
                        break;
                    case ENVIRONMENT_METRIC_IDS.SALINITY:
                        meta.salinity = m.value?.toString();
                        meta.salinityWarning = m.isAlerted;
                        break;
                    case ENVIRONMENT_METRIC_IDS.ALKALINITY:
                        meta.alkalinity = m.value?.toString();
                        meta.alkalinityWarning = m.isAlerted;
                        break;
                    case ENVIRONMENT_METRIC_IDS.TRANSPARENCY:
                        meta.transparency = m.value?.toString();
                        meta.transparencyWarning = m.isAlerted;
                        break;
                    case ENVIRONMENT_METRIC_IDS.KALI:
                        meta.kali = m.value?.toString();
                        meta.kaliWarning = m.isAlerted;
                        break;
                    case ENVIRONMENT_METRIC_IDS.TAN:
                        meta.tan = m.value?.toString();
                        meta.tanWarning = m.isAlerted;
                        break;
                    case ENVIRONMENT_METRIC_IDS.MAGIE:
                        meta.magie = m.value?.toString();
                        meta.magieWarning = m.isAlerted;
                        break;
                    case ENVIRONMENT_METRIC_IDS.NO3:
                        meta.no3 = m.value?.toString();
                        meta.no3Warning = m.isAlerted;
                        break;
                }
            });
        }

        return {
            id: item.id,
            label: `Lần ${dailyIndex}`,
            time: timeStr,
            date: dateStr,
            pondId: item.pondId ?? '',
            note: item.envMeasurementDetail?.notes,
            meta,
            createdAt: item.createdAt,
        };
    },

    mapRecordsToJobs: (rawItems: any[], ...extraContexts: any[]): JobExecution[] => {
        const metricTypes: EnvMetricType[] = extraContexts[0] || [];

        const totalPerDay: DailyCountMap = {};
        rawItems.forEach(item => {
            const d = item.createdAt ? new Date(item.createdAt) : new Date();
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            totalPerDay[key] = (totalPerDay[key] || 0) + 1;
        });

        const sortedItems = sortLogsByCreatedAtDesc(rawItems);

        const dayCounts: DailyCountMap = {};
        return sortedItems.map(item => {
            return envMeasurementLogService.mapRecordToJobExecution(
                item,
                dayCounts,
                totalPerDay,
                metricTypes
            );
        });
    },

    convertReferenceDataToActivityData: (
        ref: IPondRecordReferenceData | Record<string, unknown>,
        ...extraContexts: unknown[]
    ): ActivityData[] => {
        const metricTypes = (extraContexts[1] as EnvMetricType[]) || [];
        const r = ref as any;
        const data: ActivityData[] = [];

        if (r.envMeasurementDetails?.length) {
            r.envMeasurementDetails.forEach((d: any) => {
                const metric = metricTypes.find(m => m.id === d.metricId);
                const metricName = metric?.name || metric?.code || 'Chỉ số';
                const labelName = (metric as any)?.unit
                    ? `${metricName} (${(metric as any).unit})`
                    : metricName;
                data.push({
                    label: labelName,
                    value:
                        d.value != null
                            ? Number.isInteger(d.value)
                                ? `${d.value}`
                                : `${d.value}`
                            : '-',
                    isWarning: d.isAlerted,
                });
            });
        }
        return data;
    },
};
