import { formatDate } from '@/features/farm/utils/dateUtils';
import { mapOperationTypeToJobType } from '@/features/farm/utils/operationTypeMapping';
import { JOB_CONFIG, JobType } from '@/features/farm/components/pondwork/JobItem';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { TimelineActivity } from '@/features/farm/components/TrackingList';
import { EnvMetricType } from '@/features/farm/types/environment.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import type {
    IPondRecordItem,
    IPondRecordReferenceData,
    RawPondRecordItem,
} from '@/features/farm/types/pondRecord.types';
import {
    feedingLogService,
    siphonLogService,
    waterChangeLogService,
    sizeMeasurementLogService,
    shrimpHealthLogService,
    stockTransferLogService,
    harvestLogService,
    envMeasurementLogService,
    cleanRenovationLogService,
    dryRenovationLogService,
    incidentLogService,
    waterTreatmentLogService,
} from './work-log';

type Ref = IPondRecordReferenceData & Record<string, unknown>;

export interface NormalizedRecordRef {
    operationType: string;
    referenceData: Record<string, unknown>;
}

export function normalizeRecordToRef(
    record: RawPondRecordItem | IPondRecordItem
): NormalizedRecordRef {
    const r = record as unknown as Record<string, unknown>;
    if (r.operationType && r.referenceData && typeof r.referenceData === 'object') {
        return {
            operationType: String(r.operationType),
            referenceData: r.referenceData as Record<string, unknown>,
        };
    }
    if (r.sizeMeasurementDetail) {
        return {
            operationType: 'SizeMeasurement',
            referenceData: r.sizeMeasurementDetail as Record<string, unknown>,
        };
    }
    if (r.waterChangeDetail) {
        return {
            operationType: 'WaterChange',
            referenceData: r.waterChangeDetail as Record<string, unknown>,
        };
    }
    if (r.siphonDetail) {
        return {
            operationType: 'Siphon',
            referenceData: r.siphonDetail as Record<string, unknown>,
        };
    }
    if (r.healthCheck) {
        return {
            operationType: 'ShrimpHealthCheck',
            referenceData: r.healthCheck as Record<string, unknown>,
        };
    }
    if (r.feedingDetail) {
        return {
            operationType: 'Feeding',
            referenceData: r.feedingDetail as Record<string, unknown>,
        };
    }
    if (r.waterTreatmentDetail) {
        return {
            operationType: 'WaterTreatment',
            referenceData: r.waterTreatmentDetail as Record<string, unknown>,
        };
    }
    if (
        r.detail &&
        (r.operationType === 'CleanRenovation' || r.operationType === 'DryRenovation')
    ) {
        return {
            operationType: String(r.operationType),
            referenceData: r.detail as Record<string, unknown>,
        };
    }
    if (r.toPonds !== undefined || r.fromPondId !== undefined) {
        return {
            operationType: 'StockTransfer',
            referenceData: {
                toPonds: r.toPonds,
                totalStocking: r.totalStocking,
                shrimpSizePcsPerKg: r.shrimpSizePcsPerKg,
                notes: r.notes ?? r.note,
            } as Record<string, unknown>,
        };
    }
    const ref =
        r.referenceData && typeof r.referenceData === 'object'
            ? (r.referenceData as Record<string, unknown>)
            : {};
    return {
        operationType:
            r.operationType != null && r.operationType !== '' ? String(r.operationType) : '',
        referenceData: ref,
    };
}

export type RefToActivityDataContext = {
    metricTypes: EnvMetricType[];
    pondNameMap: Record<string, string>;
};

/** Convert ReleaseShrimp referenceData to ActivityData[] (giống metaConverters: 1 converter / 1 type). */
export function convertReleaseShrimpRefToActivityData(r: Ref): ActivityData[] {
    const data: ActivityData[] = [];
    if (r.quantity != null) data.push({ label: 'Số lượng (con)', value: `${r.quantity}` });
    if (r.density != null)
        data.push({ label: 'Mật độ (con/m²)', value: `${Math.round(Number(r.density))}` });
    if (r.ageDays != null) data.push({ label: 'Ngày tuổi (ngày)', value: `${r.ageDays}` });
    if (r.estimatedCost != null)
        data.push({
            label: 'Chi phí ước tính (VNĐ)',
            value: `${Number(r.estimatedCost).toLocaleString()}`,
        });
    return data;
}

function convertDefaultRefToActivityData(ref: Record<string, unknown>): ActivityData[] {
    const data: ActivityData[] = [];
    if (!ref || typeof ref !== 'object') return data;
    const skipKeys = new Set(['OperationType']);
    Object.entries(ref).forEach(([key, value]) => {
        if (value != null && !skipKeys.has(key) && typeof value !== 'object') {
            data.push({ label: key, value: `${value}` });
        }
    });
    return data;
}

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
    CleanRenovation: 'Rửa ao',
    DryRenovation: 'Phơi ao',
    Harvest: 'Thu hoạch',
};

/** Map API referenceData to ActivityData[] for timeline display */
export function convertReferenceDataToActivityData(
    operationType: string,
    ref: IPondRecordReferenceData | Record<string, unknown>,
    metricTypes: EnvMetricType[] = [],
    pondNameMap: Record<string, string> = {}
): ActivityData[] {
    const r = ref as Ref;
    const ctx: RefToActivityDataContext = { metricTypes, pondNameMap };

    switch (operationType) {
        case 'ReleaseShrimp':
            return convertReleaseShrimpRefToActivityData(r);
        case 'Feeding':
            return feedingLogService.convertReferenceDataToActivityData(r);
        case 'EnvMeasurement':
            return envMeasurementLogService.convertReferenceDataToActivityData(
                r,
                undefined,
                ctx.metricTypes
            );
        case 'ShrimpHealthCheck':
            return shrimpHealthLogService.convertReferenceDataToActivityData(r);
        case 'SizeMeasurement':
            return sizeMeasurementLogService.convertReferenceDataToActivityData(r);
        case 'Siphon':
            return siphonLogService.convertReferenceDataToActivityData(r);
        case 'WaterChange':
            return waterChangeLogService.convertReferenceDataToActivityData(r);
        case 'WaterTreatment':
            return waterTreatmentLogService.convertReferenceDataToActivityData(r);
        case 'Harvest':
            return harvestLogService.convertReferenceDataToActivityData(r);
        case 'StockTransfer':
            return stockTransferLogService.convertReferenceDataToActivityData(
                r,
                undefined,
                undefined,
                ctx.pondNameMap
            );
        case 'Incident':
            return incidentLogService.convertReferenceDataToActivityData(r);
        case 'CleanRenovation':
            return cleanRenovationLogService.convertReferenceDataToActivityData(r);
        case 'DryRenovation':
            return dryRenovationLogService.convertReferenceDataToActivityData(r);
        default:
            return convertDefaultRefToActivityData(ref as Record<string, unknown>);
    }
}

function getRecordTitle(
    record: IPondRecordItem | RawPondRecordItem,
    operationType?: string
): string {
    const opType = operationType ?? (record as IPondRecordItem).operationType;
    if (!opType) return 'Công việc';
    if (OPERATION_DISPLAY_NAME[opType]) return OPERATION_DISPLAY_NAME[opType];
    const jobType = mapOperationTypeToJobType(opType);
    if (jobType && JOB_CONFIG[jobType]) return JOB_CONFIG[jobType].defaultTitle;
    return opType;
}

function getRecordJobType(
    record: IPondRecordItem | RawPondRecordItem,
    operationType?: string
): JobType | undefined {
    const opType = operationType ?? (record as IPondRecordItem).operationType;
    if (opType) return mapOperationTypeToJobType(opType);
    return undefined;
}

export interface PondRecordGroup {
    id: string;
    date: string;
    activities: TimelineActivity[];
}

export interface BuildPondRecordGroupsOptions {
    metricTypes: EnvMetricType[];
    pondNameMap: Record<string, string>;
}

/** Build PondRecordGroup[] from raw items. Hỗ trợ cả record có referenceData và record có xxxDetail (api riêng). */
export function buildPondRecordGroups(
    rawItems: (IPondRecordItem | RawPondRecordItem)[],
    options: BuildPondRecordGroupsOptions
): PondRecordGroup[] {
    const sorted = [...rawItems].sort((a, b) => {
        const createdAtA = (a as IPondRecordItem).createdAt;
        const createdAtB = (b as IPondRecordItem).createdAt;
        const tA = createdAtA ? new Date(createdAtA).getTime() : 0;
        const tB = createdAtB ? new Date(createdAtB).getTime() : 0;
        return tB - tA;
    });
    const dateGroups: Record<string, TimelineActivity[]> = {};
    const dateOrder: string[] = [];
    const { metricTypes, pondNameMap } = options;

    sorted.forEach(item => {
        const normalized = normalizeRecordToRef(item);
        const { operationType, referenceData } = normalized;
        const itemCreatedAt = (item as IPondRecordItem).createdAt;
        const createdDate = itemCreatedAt ? new Date(itemCreatedAt) : new Date();
        const dateStr = formatDate(createdDate);
        if (!dateGroups[dateStr]) {
            dateGroups[dateStr] = [];
            dateOrder.push(dateStr);
        }
        const timeStr = createdDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const title = getRecordTitle(item, operationType);
        const activityData = convertReferenceDataToActivityData(
            operationType,
            referenceData as IPondRecordReferenceData,
            metricTypes,
            pondNameMap
        );
        const jobType = getRecordJobType(item, operationType);
        const note = (referenceData.notes as string) ?? (referenceData.note as string) ?? undefined;
        const activity: TimelineActivity = {
            id: (item as IPondRecordItem).id,
            time: timeStr,
            title,
            data: activityData,
            note,
            onEdit: undefined,
        };
        (activity as TimelineActivity & { _jobType?: JobType })._jobType = jobType;
        (activity as TimelineActivity & { _recordItem?: IPondRecordItem })._recordItem =
            item as IPondRecordItem;
        dateGroups[dateStr].push(activity);
    });
    return dateOrder.map(date => ({ id: date, date, activities: dateGroups[date] }));
}

/** Map API referenceData to meta shape expected by Work Tab / Edit screens */
export function mapRefDataToMeta(
    refData: IPondRecordReferenceData | Record<string, unknown>
): Record<string, unknown> {
    const mapped: Record<string, unknown> = { ...refData };

    // Measure Size
    if (refData.shrimpSizePcsPerKg != null) mapped.shrimpSize = refData.shrimpSizePcsPerKg;
    if (refData.estimatedRemainingStockKg != null)
        mapped.remainingWeight = refData.estimatedRemainingStockKg;

    // Harvest
    if (refData.totalWeightKg != null) mapped.yieldAmount = refData.totalWeightKg;
    if (refData.shrimpSizePcsPerKg != null) mapped.shrimpSize = refData.shrimpSizePcsPerKg;

    // Shrimp Inspection (images alias)
    const docs = (refData as Record<string, unknown>).documents;
    if (Array.isArray(docs)) {
        const urls = docs.map((d: { publicUrl?: string }) => d?.publicUrl).filter(Boolean);
        if (urls.length) mapped.images = urls;
    }

    return mapped;
}

/** Build JobExecution from pond record item for edit handler (Log -> Work sync). Dùng normalized ref để hỗ trợ cả record referenceData và xxxDetail. */
export function mapRecordItemToJobExecution(
    recordItem: IPondRecordItem | RawPondRecordItem,
    activityTitle: string,
    groupDate: string,
    pondId: string
): JobExecution {
    const item = recordItem as IPondRecordItem;
    const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
    const timeStr = createdDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const { referenceData: refData } = normalizeRecordToRef(recordItem);

    return {
        id: item.id,
        label: activityTitle,
        time: timeStr,
        date: groupDate,
        pondId,
        note: (refData.notes as string) ?? (refData.note as string) ?? undefined,
        materials: refData.materials as JobExecution['materials'],
        documentIds: refData.documentIds as string[] | undefined,
        images:
            (refData.images as string[] | undefined) ??
            (refData.documentIds as string[] | undefined),
        meta: mapRefDataToMeta(refData as IPondRecordReferenceData),
        createdAt: item.createdAt,
    };
}
