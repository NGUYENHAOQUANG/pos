import {
    JobExecution,
    EnvironmentMeta,
    ShrimpInspectionMeta,
    SiphonMeta,
    TransferMeta,
    HarvestMeta,
    WaterSupplyMeta,
    MeasureSizeMeta,
} from '@/features/farm/types/farm.types';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { formatNumber } from '@/features/farm/utils/numberUtils';

/**
 * Convert EnvironmentMeta to ActivityData array
 */
export const convertEnvironmentMetaToActivityData = (meta: EnvironmentMeta): ActivityData[] => {
    const data: ActivityData[] = [];

    if (meta.pH) {
        data.push({ label: 'pH:', value: meta.pH, isWarning: meta.pHWarning ?? false });
    }
    if (meta.do) {
        data.push({ label: 'DO (mg/L)', value: meta.do });
    }
    if (meta.temperature) {
        data.push({ label: 'Nhiệt độ (°C)', value: meta.temperature });
    }
    if (meta.salinity) {
        data.push({ label: 'Độ mặn (ppt)', value: meta.salinity });
    }
    if (meta.alkalinity) {
        data.push({ label: 'Độ kiềm (mg/L)', value: meta.alkalinity });
    }
    if (meta.transparency) {
        data.push({ label: 'Độ trong (cm)', value: meta.transparency });
    }
    if (meta.kali) {
        data.push({ label: 'Kali (mg/L)', value: meta.kali });
    }
    if (meta.tan) {
        data.push({ label: 'TAN (mg/L)', value: meta.tan });
    }
    if (meta.magie) {
        data.push({ label: 'Magie (mg/L)', value: meta.magie });
    }
    if (meta.no3) {
        data.push({ label: 'NO3 (mg/L)', value: meta.no3 });
    }

    return data;
};

/**
 * Convert ShrimpInspectionMeta to ActivityData array
 */
export const convertShrimpInspectionMetaToActivityData = (
    meta: ShrimpInspectionMeta
): ActivityData[] => {
    const data: ActivityData[] = [
        {
            label: 'Lượng thức ăn cho vào nhá:',
            value: meta.foodAmount ? `${meta.foodAmount}g` : '--',
        },
        { label: 'Thức ăn thừa:', value: meta.leftoverFood || '--' },
        { label: 'Đường ruột', value: meta.intestine || '--' },
        { label: 'Màu đường ruột', value: meta.intestineColor || '--' },
        { label: 'Màu phân', value: meta.stoolColor || '--' },
    ];

    if (meta.liver) {
        data.push({ label: 'Gan', value: meta.liver });
    }
    if (meta.images && meta.images.length > 0) {
        data.push({ label: 'Hình ảnh:', value: `${meta.images.length} ảnh` });
    }

    return data;
};

/**
 * Convert SiphonMeta to ActivityData array
 */
export const convertSiphonMetaToActivityData = (
    item: JobExecution,
    meta: SiphonMeta
): ActivityData[] => {
    const data: ActivityData[] = [];

    if (meta.lossAmount) {
        data.push({
            label: 'Hao hụt trong ao',
            value: meta.lossAmount,
        });
    }

    if (item.materials && item.materials.length > 0) {
        item.materials.forEach(materialItem => {
            data.push({
                label: materialItem.material.name,
                value: `${materialItem.quantity} ${materialItem.unit}`,
            });
        });
    }

    if (meta.images && meta.images.length > 0) {
        data.push({
            label: 'Hình ảnh',
            value: `${meta.images.length} ảnh`,
        });
    }

    return data;
};

/**
 * Convert TransferMeta to ActivityData array
 */
export const convertTransferMetaToActivityData = (meta: TransferMeta): ActivityData[] => {
    const data: ActivityData[] = [];

    if (meta.shrimpSize) {
        data.push({
            label: 'Cỡ tôm (con/kg)',
            value: meta.shrimpSize,
        });
    }

    if (meta.transferMethod) {
        data.push({
            label: 'Hình thức chuyển',
            value: meta.transferMethod,
        });
    }

    if (meta.receivingPonds && meta.receivingPonds.length > 0) {
        meta.receivingPonds.forEach((pond, index) => {
            const pondLabel = pond.receivingPond ? `Ao nhận ${index + 1}` : `Ao nhận ${index + 1}`;
            const quantity = pond.quantity ? formatNumber(pond.quantity) : '';
            if (quantity) {
                data.push({
                    label: pondLabel,
                    value: `${quantity} con`,
                });
            }
        });
    }

    return data;
};

/**
 * Convert HarvestMeta to ActivityData array
 */
export const convertHarvestMetaToActivityData = (
    item: JobExecution,
    meta: HarvestMeta
): ActivityData[] => {
    const data: ActivityData[] = [];

    if (meta.harvestType) {
        data.push({ label: 'Loại thu hoạch:', value: meta.harvestType });
    }

    if (meta.yieldAmount) {
        data.push({ label: 'Sản lượng (kg):', value: meta.yieldAmount });
    }

    if (meta.shrimpSize) {
        data.push({ label: 'Cỡ tôm (con/kg):', value: meta.shrimpSize });
    }

    if (meta.referencePrice) {
        data.push({ label: 'Giá tôm tham khảo (VNĐ/kg):', value: meta.referencePrice });
    }

    if (meta.revenue) {
        data.push({ label: 'Doanh thu (VNĐ):', value: formatNumber(meta.revenue) });
    }

    return data;
};

/**
 * Convert FEED job materials to ActivityData array
 */
export const convertFeedJobToActivityData = (item: JobExecution): ActivityData[] => {
    if (!item.materials || item.materials.length === 0) {
        return [];
    }

    return item.materials.map(m => ({
        label: m.material.name,
        value: `${m.quantity} ${m.unit}`,
    }));
};

/**
 * Convert WaterSupplyMeta to ActivityData array
 */
export const convertWaterSupplyMetaToActivityData = (
    item: JobExecution,
    meta: WaterSupplyMeta
): ActivityData[] => {
    const data: ActivityData[] = [];

    if (meta.targetLevel !== undefined) {
        data.push({ label: 'Mực nước mục tiêu (cm)', value: meta.targetLevel || '-', unit: 'cm' });
    }
    if (meta.supplyLevel !== undefined) {
        data.push({ label: 'Số cm cấp', value: meta.supplyLevel || '-', unit: 'cm' });
    }
    if (meta.drainLevel !== undefined) {
        data.push({ label: 'Mực nước xả xuống (cm)', value: meta.drainLevel || '-', unit: 'cm' });
    }
    if (meta.volumeAfterDrain !== undefined) {
        data.push({
            label: 'Thể tích sau xả (m³)',
            value: meta.volumeAfterDrain || '-',
            unit: 'm³',
        });
    }
    if (meta.volumeSupply !== undefined) {
        data.push({
            label: 'Thể tích nước cấp vào (m³)',
            value: meta.volumeSupply || '-',
            unit: 'm³',
        });
    }
    if (meta.volumeAfterSupply !== undefined) {
        data.push({
            label: 'Thể tích nước sau cấp (m³)',
            value: meta.volumeAfterSupply || '-',
            unit: 'm³',
        });
    }

    if (item.materials && item.materials.length > 0) {
        item.materials.forEach(m => {
            data.push({
                label: m.material.name,
                value: m.quantity,
                unit: m.unit,
            });
        });
    }

    return data;
};

/**
 * Convert WATER_TREATMENT job to ActivityData array
 */
export const convertWaterTreatmentJobToActivityData = (item: JobExecution): ActivityData[] => {
    const data: ActivityData[] = [];

    if (item.waterTreatmentType) {
        data.push({
            label: 'Loại hoạt động',
            value: item.waterTreatmentType,
        });
    }

    if (item.materials && item.materials.length > 0) {
        item.materials.forEach(m => {
            data.push({
                label: m.material.name,
                value: `${m.quantity} ${m.unit}`,
            });
        });
    }

    return data;
};

/**
 * Convert MeasureSizeMeta to ActivityData array
 */
export const convertMeasureSizeMetaToActivityData = (
    item: JobExecution,
    meta: MeasureSizeMeta
): ActivityData[] => {
    const data: ActivityData[] = [];

    if (meta.shrimpSize) {
        data.push({ label: 'Cỡ tôm (con/kg)', value: meta.shrimpSize });
    }
    if (meta.remainingWeight) {
        data.push({ label: 'Sản lượng còn lại (kg)', value: meta.remainingWeight });
    }
    if (meta.totalShrimpCount !== null && meta.totalShrimpCount !== undefined) {
        data.push({
            label: 'Tổng số tôm hiện tại (con)',
            value: meta.totalShrimpCount,
        });
    }
    if (meta.survivalRate !== null && meta.survivalRate !== undefined) {
        data.push({
            label: 'Tỉ lệ sống dự kiến (%)',
            value: formatNumber(Math.round(meta.survivalRate)),
        });
    }

    return data;
};
