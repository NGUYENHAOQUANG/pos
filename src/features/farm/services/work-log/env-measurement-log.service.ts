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

        // Hỗ trợ rút dữ liệu từ nhiều dạng cấu trúc trả về khác nhau của API
        const detailsList =
            r.envMeasurements ||
            r.EnvMeasurements ||
            r.envMeasurementDetails ||
            r.envMeasurementDetail?.envMeasurementDetails ||
            r.envMeasurementDetail?.EnvMeasurementDetails;

        if (detailsList && Array.isArray(detailsList) && detailsList.length > 0) {
            detailsList.forEach((detail: any) => {
                const metricId = detail.metricId || detail.MetricId;
                const value = detail.value ?? detail.Value;
                if (metricId != null && value != null) {
                    const strMetricId = String(metricId).toLowerCase();
                    const metric = metricTypes.find(
                        m => String(m.id).toLowerCase() === strMetricId
                    );
                    const isAlerted = detail.isAlerted === true || detail.IsAlerted === true;

                    let finalLabel = metric
                        ? metric.name
                        : `Thông số (${strMetricId.substring(0, 4)})`;
                    let finalUnit: string | undefined;

                    const nameMatch = finalLabel.match(/^(.*?)\s*\((.*?)\)$/);
                    if (nameMatch) {
                        finalLabel = nameMatch[1].trim();
                        finalUnit = nameMatch[2].trim();
                    }

                    data.push({
                        label: finalUnit ? `${finalLabel} (${finalUnit})` : finalLabel,
                        value: `${value}`,
                        isWarning: isAlerted,
                    });
                }
            });
        } else {
            // Fallback: Quét trực tiếp object nếu không có array chi tiết
            const objToScan =
                detailsList && typeof detailsList === 'object' && !Array.isArray(detailsList)
                    ? detailsList
                    : r;
            const commonNames: Record<string, string> = {
                ph: 'pH',
                dissolvedoxygen: 'DO (mg/L)',
                do: 'DO (mg/L)',
                temperature: 'Nhiệt độ (°C)',
                temp: 'Nhiệt độ (°C)',
                salinity: 'Độ mặn (ppt)',
                alkalinity: 'Độ kiềm (mg/L)',
                transparency: 'Độ trong (cm)',
                kali: 'Kali (mg/L)',
                tan: 'TAN (mg/L)',
                magie: 'Magie (mg/L)',
                no3: 'NO3 (mg/L)',
            };
            Object.keys(objToScan).forEach(key => {
                const strKey = String(key).toLowerCase();
                if (
                    ['operationtype', 'operationid', 'pondid', 'notes', 'Id', 'CreatedAt'].includes(
                        strKey
                    )
                )
                    return;

                const val = (objToScan as Record<string, unknown>)[key];
                if (val != null && typeof val !== 'object' && val !== '') {
                    const metric = metricTypes.find(
                        m =>
                            String(m.id).toLowerCase() === strKey ||
                            String((m as any).code || '').toLowerCase() === strKey ||
                            String(m.name).toLowerCase() === strKey
                    );
                    let label = metric ? metric.name : commonNames[strKey] ?? key;

                    const nameMatch2 = label.match(/^(.*?)\s*\((.*?)\)$/);
                    if (nameMatch2) {
                        label = nameMatch2[1].trim();
                        const unit = nameMatch2[2].trim();
                        data.push({ label: `${label} (${unit})`, value: String(val) });
                    } else {
                        data.push({ label, value: String(val) });
                    }
                }
            });
        }

        return data;
    },
};
