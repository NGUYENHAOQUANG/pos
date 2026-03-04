import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { pondRecordApi } from '@/features/farm/api/pondRecordApi';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { formatDate } from '@/features/farm/utils/dateUtils';
import { mapOperationTypeToJobType } from '@/features/farm/utils/operationTypeMapping';
import { mapFromApiResponse as mapShrimpHealthAndEnv } from '@/features/farm/utils/shrimpHealthCheckMapper';
import { JOB_CONFIG, JobType } from '@/features/farm/components/pondwork/JobItem';
import type {
    IPondRecordItem,
    IPondRecordListParams,
    IPondRecordReferenceData,
} from '@/features/farm/types/pondRecord.types';
import type { JobExecution } from '@/features/farm/types/farm.types';
import type { TimelineActivity } from '@/features/farm/components/TrackingList';
import type { ActivityData } from '@/features/farm/components/ActivityCard';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';
import { useEnvironmentInit } from '@/features/farm/hooks/pondwork/envhooks/useEnvironmentLogic';
import { EnvMetricType } from '@/features/farm/api/environmentApi';
import { useFarmStore } from '@/features/farm/store/farmStore';

// Display name mapping for operation types not in operationTypeMapping
const OPERATION_DISPLAY_NAME: Record<string, string> = {
    ReleaseShrimp: 'Thả tôm giống',
    Feeding: 'Cho ăn',
    ShrimpHealthCheck: 'Kiểm tra tôm',
    SizeMeasurement: 'Đo kích thước tôm',
    EnvMeasurement: 'Đo thông số môi trường',
    WaterTreatment: 'Xử lý nước',
    WaterChange: 'Thay/Cấp nước',
    Siphon: 'Xi - phông',
    Incident: 'Xử lý sự cố',
    StockTransfer: 'Sang ao',
    CleanPond: 'Rửa ao',
    SunDryPond: 'Phơi ao',
    CleanRenovation: 'Rửa ao',
    DryRenovation: 'Phơi ao',
    Harvest: 'Thu hoạch',
};

/**
 * Hook to fetch pond records from GET /pond/{pondId}/record
 */
export const usePondRecords = (pondId: string, params?: IPondRecordListParams) => {
    const query = useQuery({
        queryKey: farmKeys.pondRecords.list(pondId, params as Record<string, unknown>),
        queryFn: () => pondRecordApi.list(pondId, params),
        enabled: !!pondId,
    });

    return query;
};

/**
 * Hook to fetch only the latest pond record activity
 */
export const useLatestPondActivity = (pondId: string) => {
    return useQuery({
        queryKey: farmKeys.pondRecords.list(pondId, { PageSize: 1, OrderBy: 'CreatedAt desc' }),
        queryFn: () => pondRecordApi.list(pondId, { PageSize: 1, OrderBy: 'CreatedAt desc' }),
        enabled: !!pondId,
    });
};

/**
 * Convert referenceData to ActivityData[] based on operationType
 */
const convertReferenceDataToActivityData = (
    operationType: string,
    ref: IPondRecordReferenceData,
    materialMap: Record<string, any>,
    metricTypes: EnvMetricType[] = [],
    pondNameMap: Record<string, string> = {}
): ActivityData[] => {
    const data: ActivityData[] = [];

    switch (operationType) {
        case 'ReleaseShrimp':
            if (ref.quantity != null)
                data.push({ label: 'Số lượng (con)', value: `${ref.quantity}` });
            if (ref.density != null)
                data.push({ label: 'Mật độ (con/m²)', value: `${ref.density}` });
            if (ref.ageDays != null) data.push({ label: 'Số ngày tuổi', value: `${ref.ageDays}` });
            if (ref.estimatedCost != null)
                data.push({
                    label: 'Chi phí ước tính (VNĐ)',
                    value: `${Number(ref.estimatedCost).toLocaleString()}`,
                });
            break;

        case 'Feeding':
            if (ref.materials && ref.materials.length > 0) {
                ref.materials.forEach(m => {
                    const mat = materialMap[m.warehouseItemId];
                    const matName = mat?.name || 'Vật tư';
                    const matUnit = mat?.unitName || '';
                    data.push({ label: matName, value: `SL: ${m.quantity} ${matUnit}` });
                });
            }
            break;

        case 'EnvMeasurement': {
            const r = ref as any;

            const detailsList =
                r.envMeasurements ||
                r.EnvMeasurements ||
                r.envMeasurementDetails ||
                r.envMeasurementDetail?.envMeasurementDetails;

            if (detailsList && Array.isArray(detailsList) && detailsList.length > 0) {
                detailsList.forEach((detail: any) => {
                    const metricId = detail.metricId || detail.MetricId;
                    const value = detail.value ?? detail.Value;

                    if (metricId && value != null) {
                        const strMetricId = String(metricId).toLowerCase();
                        const metric = metricTypes.find(
                            m => String(m.id).toLowerCase() === strMetricId
                        );

                        const isAlerted = detail.isAlerted === true || detail.IsAlerted === true;

                        const warningFlag = isAlerted ? true : false;

                        let finalLabel = metric
                            ? metric.name
                            : `Thông số (${strMetricId.substring(0, 4)})`;
                        let finalUnit: string | undefined = undefined;

                        const nameMatch = finalLabel.match(/^(.*?)\s*\((.*?)\)$/);
                        if (nameMatch) {
                            finalLabel = nameMatch[1].trim();
                            finalUnit = nameMatch[2].trim();
                        }

                        data.push({
                            label: finalLabel,
                            value: `${value}`,
                            unit: finalUnit,
                            isWarning: warningFlag,
                        });
                    }
                });
            } else {
                const objToScan =
                    detailsList && typeof detailsList === 'object' && !Array.isArray(detailsList)
                        ? detailsList
                        : r;

                Object.keys(objToScan).forEach(key => {
                    const strKey = String(key).toLowerCase();
                    if (['operationtype', 'operationid', 'pondid', 'notes'].includes(strKey))
                        return;

                    const val = objToScan[key];
                    if (val != null && typeof val !== 'object' && val !== '') {
                        const metric = metricTypes.find(
                            m =>
                                String(m.id).toLowerCase() === strKey ||
                                String(m.code || '').toLowerCase() === strKey ||
                                String(m.name).toLowerCase() === strKey
                        );

                        let label = key;
                        let unit: string | undefined = undefined;

                        if (metric) {
                            label = metric.name;
                        } else {
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
                            if (commonNames[strKey]) label = commonNames[strKey];
                        }

                        const nameMatch = label.match(/^(.*?)\s*\((.*?)\)$/);
                        if (nameMatch) {
                            label = nameMatch[1].trim();
                            unit = nameMatch[2].trim();
                        }

                        data.push({ label, value: String(val), unit });
                    }
                });
            }

            break;
        }

        case 'ShrimpHealthCheck': {
            // Map raw API data to UI labels
            const uiState = mapShrimpHealthAndEnv({
                value: (ref as any).feedInTrapG ?? 0,
                healthCheck: ref as any,
                images: (ref as any).documents?.map((d: any) => d.publicUrl) || [],
            });

            if (uiState.foodAmount != null)
                data.push({ label: 'Thức ăn cho vào nhá (g)', value: `${uiState.foodAmount}` });
            if (uiState.leftoverFood)
                data.push({ label: 'Thức ăn thừa', value: `${uiState.leftoverFood}` });
            if (uiState.intestine)
                data.push({ label: 'Đường ruột', value: `${uiState.intestine}` });
            if (uiState.intestineColor)
                data.push({ label: 'Màu đường ruột', value: `${uiState.intestineColor}` });
            if (uiState.stoolColor)
                data.push({ label: 'Màu phân', value: `${uiState.stoolColor}` });
            if (uiState.liver) data.push({ label: 'Gan', value: `${uiState.liver}` });
            break;
        }

        case 'SizeMeasurement':
            if (ref.shrimpSizePcsPerKg != null)
                data.push({ label: 'Cỡ tôm (con/kg)', value: `${ref.shrimpSizePcsPerKg}` });
            if (ref.averageShrimpSize != null && Number(ref.averageShrimpSize) > 0)
                data.push({
                    label: 'Trọng lượng tôm TB (g/con)',
                    value: `${ref.averageShrimpSize}`,
                });
            if (ref.estimatedRemainingStockKg != null)
                data.push({
                    label: 'Sản lượng còn lại (kg)',
                    value: `${ref.estimatedRemainingStockKg}`,
                });
            if (ref.totalShrimpCount != null)
                data.push({
                    label: 'Tổng số tôm hiện tại (con)',
                    value: `${Math.round(Number(ref.totalShrimpCount))}`,
                });
            if (ref.releaseQuantity != null)
                data.push({ label: 'Số lượng thả (con)', value: `${ref.releaseQuantity}` });
            if (ref.survivalRatePercentage != null)
                data.push({
                    label: 'Tỉ lệ sống (%)',
                    value: `${Math.round(Number(ref.survivalRatePercentage))}`,
                });
            break;

        case 'Siphon':
            if (ref.shrimpLossKg != null)
                data.push({ label: 'Hao hụt tôm (kg)', value: `${ref.shrimpLossKg}` });
            if (ref.materials && ref.materials.length > 0) {
                ref.materials.forEach(m => {
                    const mat = materialMap[m.warehouseItemId];
                    const matName = mat?.name || 'Vật tư';
                    const matUnit = mat?.unitName || '';
                    data.push({ label: matName, value: `SL: ${m.quantity} ${matUnit}` });
                });
            }
            break;

        case 'WaterChange':
            if (ref.targetWaterLevel != null)
                data.push({ label: 'Mực nước mục tiêu (cm)', value: `${ref.targetWaterLevel}` });
            if (ref.waterAdded != null)
                data.push({ label: 'Số cm cấp', value: `${ref.waterAdded}` });
            if (ref.waterRemoved != null)
                data.push({ label: 'Mực nước xả xuống (cm)', value: `${ref.waterRemoved}` });
            if (ref.previousVolume != null)
                data.push({ label: 'Thể tích trước (m³)', value: `${ref.previousVolume}` });
            if (ref.addedVolume != null)
                data.push({ label: 'Thể tích nước cấp (m³)', value: `${ref.addedVolume}` });
            if (ref.finalVolume != null)
                data.push({ label: 'Thể tích sau cấp (m³)', value: `${ref.finalVolume}` });
            if (ref.materials && ref.materials.length > 0) {
                ref.materials.forEach(m => {
                    const mat = materialMap[m.warehouseItemId];
                    const matName = mat?.name || 'Vật tư';
                    const matUnit = mat?.unitName || '';
                    data.push({ label: matName, value: `SL: ${m.quantity} ${matUnit}` });
                });
            }
            break;

        case 'WaterTreatment':
            if (ref.materials && ref.materials.length > 0) {
                ref.materials.forEach(m => {
                    const mat = materialMap[m.warehouseItemId];
                    const matName = mat?.name || 'Vật tư';
                    const matUnit = mat?.unitName || '';
                    data.push({ label: matName, value: `SL: ${m.quantity} ${matUnit}` });
                });
            }
            break;

        case 'Harvest': {
            const harvestMap: Record<string, string> = {
                FullHarvest: 'Thu hết',
                PartialHarvest: 'Thu tỉa',
                CloseCycle: 'Đóng chu kỳ',
            };
            const displayType = ref.harvestType
                ? harvestMap[String(ref.harvestType)] || ref.harvestType
                : undefined;
            if (displayType) data.push({ label: 'Loại thu hoạch', value: `${displayType}` });
            if (ref.totalWeightKg != null)
                data.push({ label: 'Sản lượng (kg)', value: `${ref.totalWeightKg}` });
            if (ref.shrimpSizePcsPerKg != null)
                data.push({ label: 'Cỡ tôm (con/kg)', value: `${ref.shrimpSizePcsPerKg}` });
            if (ref.referencePrice != null)
                data.push({ label: 'Giá tham khảo (VNĐ/kg)', value: `${ref.referencePrice}` });
            if (ref.revenue != null)
                data.push({ label: 'Doanh thu (VNĐ)', value: `${ref.revenue}` });
            break;
        }

        case 'StockTransfer':
            if (ref.shrimpSizePcsPerKg != null)
                data.push({ label: 'Cỡ tôm (con/kg)', value: `${ref.shrimpSizePcsPerKg}` });
            if (ref.totalStocking != null)
                data.push({
                    label: 'Tổng số lượng sang (con)',
                    value: `${Number(ref.totalStocking).toLocaleString()}`,
                });
            if (ref.toPonds && ref.toPonds.length > 0) {
                ref.toPonds.forEach((pond, index) => {
                    const pondLabel =
                        pondNameMap[pond.toPondId] ||
                        pond.toPondName ||
                        `Ao đích ${ref.toPonds!.length > 1 ? index + 1 : ''}`.trim();
                    data.push({
                        label: pondLabel,
                        value: `${Number(pond.quantity).toLocaleString()} con`,
                    });
                });
            }
            break;

        case 'Incident':
        case 'CleanPond':
        case 'CleanRenovation':
        case 'SunDryPond':
        case 'DryRenovation':
            if (ref.materials && ref.materials.length > 0) {
                ref.materials.forEach(m => {
                    const mat = materialMap[m.warehouseItemId];
                    const matName = mat?.name || 'Vật tư';
                    const matUnit = mat?.unitName || '';
                    data.push({ label: matName, value: `SL: ${m.quantity} ${matUnit}` });
                });
            }
            break;

        default: {
            // For unknown operation types, try to display all non-null fields from referenceData
            const skipKeys = new Set(['OperationType']);
            Object.entries(ref).forEach(([key, value]) => {
                if (value != null && !skipKeys.has(key) && typeof value !== 'object') {
                    data.push({ label: key, value: `${value}` });
                }
            });
            break;
        }
    }

    return data;
};

/**
 * Determine display title from operationType
 */
const getRecordTitle = (record: IPondRecordItem): string => {
    const opType = record.operationType;
    if (!opType) return 'Công việc';

    // Check display name mapping first
    if (OPERATION_DISPLAY_NAME[opType]) {
        return OPERATION_DISPLAY_NAME[opType];
    }

    // Then try JOB_CONFIG via operationTypeMapping
    const jobType = mapOperationTypeToJobType(opType);
    if (jobType && JOB_CONFIG[jobType]) {
        return JOB_CONFIG[jobType].defaultTitle;
    }
    return opType;
};

/**
 * Determine JobType from record's operationType
 */
const getRecordJobType = (record: IPondRecordItem): JobType | undefined => {
    if (record.operationType) {
        return mapOperationTypeToJobType(record.operationType);
    }
    return undefined;
};

export interface PondRecordGroup {
    id: string;
    date: string;
    activities: TimelineActivity[];
}

/**
 * Hook that fetches pond records and groups them by date for WorkLogScreens display
 */
export const usePondRecordGroups = (
    pondId: string,
    options?: {
        startDate?: Date;
        endDate?: Date;
        operationNameFilter?: string[];
    }
) => {
    const params: IPondRecordListParams = {
        PageSize: 1000,
        OrderBy: 'CreatedAt desc',
    };

    if (options?.startDate) {
        params.CreateAtFrom = options.startDate.toISOString();
    }
    if (options?.endDate) {
        params.CreateAtTo = options.endDate.toISOString();
    }

    const { data, isLoading, error, refetch } = usePondRecords(pondId, params);
    const { materialMap } = useFarmMaterials();
    const { metricTypes } = useEnvironmentInit();
    const ponds = useFarmStore(state => state.ponds);

    // Build pondNameMap from store: pondId -> pondName (for StockTransfer toPonds)
    const pondNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        ponds.forEach(p => {
            if (p.id && p.name) map[p.id] = p.name;
        });
        return map;
    }, [ponds]);

    const rawItems: IPondRecordItem[] = useMemo(() => data?.data?.items ?? [], [data]);

    const groups: PondRecordGroup[] = useMemo(() => {
        let filteredItems = rawItems;

        // Filter by operation type if provided
        if (options?.operationNameFilter && options.operationNameFilter.length > 0) {
            filteredItems = filteredItems.filter(item => {
                if (!item.operationType) return false;
                const jobType = mapOperationTypeToJobType(item.operationType);
                return jobType ? options.operationNameFilter!.includes(jobType) : false;
            });
        }

        // Filter by date range (client-side fallback to ensure consistency)
        if (options?.startDate || options?.endDate) {
            filteredItems = filteredItems.filter(item => {
                if (!item.createdAt) return false;
                const createdDate = new Date(item.createdAt);

                if (options.startDate && createdDate < options.startDate) return false;
                if (options.endDate && createdDate > options.endDate) return false;
                return true;
            });
        }

        // Sort by createdAt desc
        const sortedItems = [...filteredItems].sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
        });

        // Group by date
        const dateGroups: Record<string, TimelineActivity[]> = {};
        const dateOrder: string[] = [];

        sortedItems.forEach(item => {
            const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
            const dateStr = formatDate(createdDate);

            if (!dateGroups[dateStr]) {
                dateGroups[dateStr] = [];
                dateOrder.push(dateStr);
            }

            const timeStr = createdDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            });

            const title = getRecordTitle(item);
            const isEnv = item.operationType === 'EnvMeasurement';

            // Allow processing if referenceData is present OR it's EnvMeasurement (which might be flattened)
            const activityData =
                item.referenceData || isEnv
                    ? convertReferenceDataToActivityData(
                          item.operationType || '',
                          item.referenceData || (item as any),
                          materialMap,
                          metricTypes,
                          pondNameMap
                      )
                    : [];
            const jobType = getRecordJobType(item);

            const refData = (item.referenceData || (isEnv ? item : {})) as any;
            const activity: TimelineActivity = {
                id: item.id,
                time: timeStr,
                title,
                data: activityData,
                note:
                    refData?.notes ??
                    refData?.envMeasurementDetail?.notes ??
                    refData?.EnvMeasurementDetail?.Notes ??
                    undefined,
                onEdit: undefined,
            };

            // Store jobType and record for edit handler
            (activity as TimelineActivity & { _jobType?: JobType })._jobType = jobType;
            (activity as TimelineActivity & { _recordItem?: IPondRecordItem })._recordItem = item;

            dateGroups[dateStr].push(activity);
        });

        return dateOrder.map(date => ({
            id: date,
            date,
            activities: dateGroups[date],
        }));
    }, [
        rawItems,
        options?.operationNameFilter,
        options?.startDate,
        options?.endDate,
        materialMap,
        metricTypes,
        pondNameMap,
    ]);

    return { groups, isLoading, error, refetch, rawItems };
};

/**
 * Convert record items to JobExecution[] for store compatibility
 */
export const useRecordsAsJobs = (pondId: string) => {
    const { data, isLoading, error, refetch } = usePondRecords(pondId);

    const rawItems: IPondRecordItem[] = useMemo(() => data?.data?.items ?? [], [data]);

    const jobs: JobExecution[] = useMemo(() => {
        const sortedItems = [...rawItems].sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeA - timeB;
        });

        const dayCounts: Record<string, number> = {};

        return sortedItems.map(item => {
            const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
            const dateKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}-${createdDate.getDate()}`;
            if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
            dayCounts[dateKey]++;

            const timeStr = createdDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            });
            const dateStr = formatDate(createdDate);

            return {
                id: item.id,
                label: `Lần ${dayCounts[dateKey]}`,
                time: timeStr,
                date: dateStr,
                note: item.referenceData?.notes ?? undefined,
                pondId: undefined,
                createdAt: item.createdAt,
            };
        });
    }, [rawItems]);

    return { jobs, isLoading, error, refetch };
};
