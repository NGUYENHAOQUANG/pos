import { formatDate } from '@/features/farm/utils/dateUtils';
import { mapOperationTypeToJobType } from '@/features/farm/utils/operationTypeMapping';
import { mapFromApiResponse as mapShrimpHealthAndEnv } from '@/features/farm/utils/shrimpHealthCheckMapper';
import { JOB_CONFIG, JobType } from '@/features/farm/components/pondwork/JobItem';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { TimelineActivity } from '@/features/farm/components/TrackingList';
import { EnvMetricType } from '@/features/farm/types/environment.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { HarvestType } from '@/features/farm/types/harvestRecord.types';
import type {
    IPondRecordItem,
    IPondRecordReferenceData,
    RawPondRecordItem,
} from '@/features/farm/types/pondRecord.types';

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
    materialMap: Record<string, { name?: string; unitName?: string }>;
    metricTypes: EnvMetricType[];
    pondNameMap: Record<string, string>;
};

function pushMaterialRows(
    data: ActivityData[],
    materials: { warehouseItemId: string; quantity: number }[],
    materialMap: Record<string, { name?: string; unitName?: string }>
): void {
    materials.forEach(m => {
        const mat = materialMap[m.warehouseItemId];
        const label = mat?.unitName
            ? `${mat?.name || 'Vật tư'} (${mat.unitName})`
            : mat?.name || 'Vật tư';
        data.push({ label, value: m.quantity });
    });
}

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

export function convertFeedingRefToActivityData(
    r: Ref,
    ctx: RefToActivityDataContext
): ActivityData[] {
    const data: ActivityData[] = [];
    if (r.materials?.length) pushMaterialRows(data, r.materials, ctx.materialMap);
    return data;
}

export function convertEnvMeasurementRefToActivityData(
    r: Ref,
    ctx: RefToActivityDataContext
): ActivityData[] {
    const data: ActivityData[] = [];
    const { metricTypes } = ctx;
    const detailsList =
        r.envMeasurements ||
        (r as any).EnvMeasurements ||
        (r as any).envMeasurementDetails ||
        (r as any).envMeasurementDetail?.envMeasurementDetails;
    if (detailsList && Array.isArray(detailsList) && detailsList.length > 0) {
        detailsList.forEach((detail: any) => {
            const metricId = detail.metricId || detail.MetricId;
            const value = detail.value ?? detail.Value;
            if (metricId != null && value != null) {
                const strMetricId = String(metricId).toLowerCase();
                const metric = metricTypes.find(m => String(m.id).toLowerCase() === strMetricId);
                const isAlerted = detail.isAlerted === true || detail.IsAlerted === true;
                let finalLabel = metric ? metric.name : `Thông số (${strMetricId.substring(0, 4)})`;
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
            if (['operationtype', 'operationid', 'pondid', 'notes'].includes(strKey)) return;
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
}

export function convertShrimpHealthCheckRefToActivityData(r: Ref): ActivityData[] {
    const data: ActivityData[] = [];
    const uiState = mapShrimpHealthAndEnv({
        value: (r as any).feedInTrapG ?? 0,
        healthCheck: r as any,
        images: (r as any).documents?.map((d: any) => d.publicUrl) || [],
    });
    if (uiState.foodAmount != null)
        data.push({ label: 'Thức ăn cho vào nhá (g)', value: `${uiState.foodAmount}` });
    if (uiState.leftoverFood) data.push({ label: 'Thức ăn thừa', value: uiState.leftoverFood });
    if (uiState.intestine) data.push({ label: 'Đường ruột', value: uiState.intestine });
    if (uiState.intestineColor)
        data.push({ label: 'Màu đường ruột', value: uiState.intestineColor });
    if (uiState.stoolColor) data.push({ label: 'Màu phân', value: uiState.stoolColor });
    if (uiState.liver) data.push({ label: 'Gan', value: uiState.liver });
    return data;
}

export function convertSizeMeasurementRefToActivityData(r: Ref): ActivityData[] {
    const data: ActivityData[] = [];
    if (r.shrimpSizePcsPerKg != null)
        data.push({ label: 'Cỡ tôm (con/kg)', value: `${r.shrimpSizePcsPerKg}` });
    if ((r as any).averageShrimpSize != null && Number((r as any).averageShrimpSize) > 0)
        data.push({
            label: 'Trọng lượng tôm TB (g/con)',
            value: `${(r as any).averageShrimpSize}`,
        });
    if (r.estimatedRemainingStockKg != null)
        data.push({ label: 'Sản lượng còn lại (kg)', value: `${r.estimatedRemainingStockKg}` });
    if ((r as any).totalShrimpCount != null)
        data.push({
            label: 'Tổng số tôm hiện tại (con)',
            value: `${Math.round(Number((r as any).totalShrimpCount))}`,
        });
    if ((r as any).releaseQuantity != null)
        data.push({ label: 'Số lượng thả (con)', value: `${(r as any).releaseQuantity}` });
    if ((r as any).survivalRatePercentage != null)
        data.push({
            label: 'Tỉ lệ sống (%)',
            value: `${Math.round(Number((r as any).survivalRatePercentage))}`,
        });
    return data;
}

export function convertSiphonRefToActivityData(
    r: Ref,
    ctx: RefToActivityDataContext
): ActivityData[] {
    const data: ActivityData[] = [];
    if ((r as any).shrimpLossKg != null)
        data.push({ label: 'Hao hụt tôm (kg)', value: `${(r as any).shrimpLossKg}` });
    if (r.materials?.length) pushMaterialRows(data, r.materials, ctx.materialMap);
    return data;
}

export function convertWaterChangeRefToActivityData(
    r: Ref,
    ctx: RefToActivityDataContext
): ActivityData[] {
    const data: ActivityData[] = [];
    const ra = r as any;
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
    if (r.materials?.length) pushMaterialRows(data, r.materials, ctx.materialMap);
    return data;
}

export function convertWaterTreatmentRefToActivityData(
    r: Ref,
    ctx: RefToActivityDataContext
): ActivityData[] {
    const data: ActivityData[] = [];
    if (r.materials?.length) pushMaterialRows(data, r.materials, ctx.materialMap);
    return data;
}

const HARVEST_TYPE_LABEL: Record<HarvestType | 'CloseCycle', string> = {
    FullHarvest: 'Thu hết',
    PartialHarvest: 'Thu tỉa',
    CloseCycle: 'Đóng chu kỳ',
};

export function convertHarvestRefToActivityData(r: Ref): ActivityData[] {
    const data: ActivityData[] = [];
    const displayType = r.harvestType
        ? HARVEST_TYPE_LABEL[r.harvestType as keyof typeof HARVEST_TYPE_LABEL] ||
          String(r.harvestType)
        : undefined;
    if (displayType) data.push({ label: 'Loại thu hoạch', value: displayType });
    if (r.totalWeightKg != null)
        data.push({ label: 'Sản lượng (kg)', value: `${r.totalWeightKg}` });
    if (r.shrimpSizePcsPerKg != null)
        data.push({ label: 'Cỡ tôm (con/kg)', value: `${r.shrimpSizePcsPerKg}` });
    if (r.referencePrice != null)
        data.push({ label: 'Giá tham khảo (VNĐ/kg)', value: `${r.referencePrice}` });
    if ((r as any).revenue != null)
        data.push({ label: 'Doanh thu (VNĐ)', value: `${(r as any).revenue}` });
    return data;
}

export function convertStockTransferRefToActivityData(
    r: Ref,
    ctx: RefToActivityDataContext
): ActivityData[] {
    const data: ActivityData[] = [];
    if (r.shrimpSizePcsPerKg != null)
        data.push({ label: 'Cỡ tôm (con/kg)', value: `${r.shrimpSizePcsPerKg}` });
    if (r.totalStocking != null)
        data.push({
            label: 'Tổng số lượng sang (con)',
            value: `${Number(r.totalStocking).toLocaleString()}`,
        });
    if (r.toPonds?.length) {
        r.toPonds.forEach((pond, index) => {
            const pondLabel =
                ctx.pondNameMap[pond.toPondId] ||
                pond.toPondName ||
                `Ao đích ${r.toPonds!.length > 1 ? index + 1 : ''}`.trim();
            data.push({
                label: `${pondLabel} (con)`,
                value: Number(pond.quantity).toLocaleString(),
            });
        });
    }
    return data;
}

export function convertMaterialsOnlyRefToActivityData(
    r: Ref,
    ctx: RefToActivityDataContext
): ActivityData[] {
    const data: ActivityData[] = [];
    if (r.materials?.length) pushMaterialRows(data, r.materials, ctx.materialMap);
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
    materialMap: Record<string, { name?: string; unitName?: string }>,
    metricTypes: EnvMetricType[] = [],
    pondNameMap: Record<string, string> = {}
): ActivityData[] {
    const r = ref as Ref;
    const ctx: RefToActivityDataContext = { materialMap, metricTypes, pondNameMap };

    switch (operationType) {
        case 'ReleaseShrimp':
            return convertReleaseShrimpRefToActivityData(r);
        case 'Feeding':
            return convertFeedingRefToActivityData(r, ctx);
        case 'EnvMeasurement':
            return convertEnvMeasurementRefToActivityData(r, ctx);
        case 'ShrimpHealthCheck':
            return convertShrimpHealthCheckRefToActivityData(r);
        case 'SizeMeasurement':
            return convertSizeMeasurementRefToActivityData(r);
        case 'Siphon':
            return convertSiphonRefToActivityData(r, ctx);
        case 'WaterChange':
            return convertWaterChangeRefToActivityData(r, ctx);
        case 'WaterTreatment':
            return convertWaterTreatmentRefToActivityData(r, ctx);
        case 'Harvest':
            return convertHarvestRefToActivityData(r);
        case 'StockTransfer':
            return convertStockTransferRefToActivityData(r, ctx);
        case 'Incident':
        case 'CleanRenovation':
        case 'DryRenovation':
            return convertMaterialsOnlyRefToActivityData(r, ctx);
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
    materialMap: Record<string, { name?: string; unitName?: string }>;
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
    const { materialMap, metricTypes, pondNameMap } = options;

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
            materialMap,
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
