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
        data.push({ label: 'DO (mg/L)', value: meta.do, isWarning: meta.doWarning ?? false });
    }
    if (meta.temperature) {
        data.push({
            label: 'Nhiệt độ (°C)',
            value: meta.temperature,
            isWarning: meta.temperatureWarning ?? false,
        });
    }
    if (meta.salinity) {
        data.push({
            label: 'Độ mặn (ppt)',
            value: meta.salinity,
            isWarning: meta.salinityWarning ?? false,
        });
    }
    if (meta.alkalinity) {
        data.push({
            label: 'Độ kiềm (mg/L)',
            value: meta.alkalinity,
            isWarning: meta.alkalinityWarning ?? false,
        });
    }
    if (meta.transparency) {
        data.push({
            label: 'Độ trong (cm)',
            value: meta.transparency,
            isWarning: meta.transparencyWarning ?? false,
        });
    }
    if (meta.kali) {
        data.push({ label: 'Kali (mg/L)', value: meta.kali, isWarning: meta.kaliWarning ?? false });
    }
    if (meta.tan) {
        data.push({ label: 'TAN (mg/L)', value: meta.tan, isWarning: meta.tanWarning ?? false });
    }
    if (meta.magie) {
        data.push({
            label: 'Magie (mg/L)',
            value: meta.magie,
            isWarning: meta.magieWarning ?? false,
        });
    }
    if (meta.no3) {
        data.push({ label: 'NO3 (mg/L)', value: meta.no3, isWarning: meta.no3Warning ?? false });
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

    // Add AI Health Check info based on isHealthy status
    if (meta.isHealthy !== undefined) {
        // 1. Average Infection Rate (Trung bình tỉ lệ nhiễm bệnh)
        if (meta.averageInfectionRate !== undefined && meta.averageInfectionRate > 0) {
            data.push({
                label: 'Trung bình tỉ lệ nhiễm bệnh:',
                value: `${meta.averageInfectionRate}%`,
            });
        }

        // 2. Shrimp Status (Tình trạng tôm) - Based purely on isHealthy flag
        const statusText = meta.isHealthy ? 'Khỏe mạnh' : 'Nhiễm bệnh';
        data.push({
            label: 'Tình trạng tôm:',
            value: statusText,
            // Highlight as warning if not healthy
            isWarning: !meta.isHealthy,
        });

        // 3. List of Diseases (Các loại bệnh) only if details exist and show actual diseases
        if (meta.diagnosisDetails && meta.diagnosisDetails.length > 0) {
            const diseaseMap: Record<string, string> = {
                Healthy: 'Khỏe mạnh',
                WSSV: 'Đốm trắng',
                BlackGill: 'Mang đen',
                Yellowhead: 'Đầu vàng',
            };

            const diseases = meta.diagnosisDetails
                .filter(d => d.diseaseType !== 'Healthy')
                .map(d => diseaseMap[d.diseaseType] || d.diseaseType)
                .join(', ');

            if (diseases) {
                // Display inline and left-aligned as requested: "Các loại bệnh: A, B, C"
                // Putting everything in label ensures it aligns left and wraps if needed
                data.push({ label: `Các loại bệnh: ${diseases}`, value: '' });
            }
        }
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
        data.push({ label: 'Mực nước mục tiêu (cm)', value: meta.targetLevel || '0' });
    }
    if (meta.supplyLevel !== undefined) {
        data.push({ label: 'Số cm cấp', value: meta.supplyLevel || '0' });
    }
    if (meta.drainLevel !== undefined) {
        data.push({ label: 'Mực nước xả xuống (cm)', value: meta.drainLevel || '-' });
    }
    if (meta.volumeAfterDrain !== undefined) {
        data.push({
            label: 'Thể tích sau xả (m³)',
            value: meta.volumeAfterDrain || '-',
        });
    }
    if (meta.volumeSupply !== undefined) {
        data.push({
            label: 'Thể tích nước cấp vào (m³)',
            value: meta.volumeSupply || '-',
        });
    }
    if (meta.volumeAfterSupply !== undefined) {
        data.push({
            label: 'Thể tích nước sau cấp (m³)',
            value: meta.volumeAfterSupply || '-',
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

    // 1. Cỡ tôm
    data.push({
        label: 'Cỡ tôm (con/kg)',
        value: meta.shrimpSize || '0',
    });

    // 2. Sản lượng còn lại
    data.push({
        label: 'Sản lượng còn lại (kg)',
        value: meta.remainingWeight || '0',
    });

    data.push({ label: 'Trung bình kích thước tôm (cm):', value: meta.averageShrimpSize ?? '--' });

    // 3. Tổng số tôm hiện tại
    data.push({
        label: 'Tổng số tôm hiện tại (con)',
        value:
            meta.totalShrimpCount !== null && meta.totalShrimpCount !== undefined
                ? Math.round(meta.totalShrimpCount).toString()
                : '0',
    });

    // 4. Tỉ lệ sống dự kiến
    data.push({
        label: 'Tỉ lệ sống dự kiến (%)',
        value:
            meta.survivalRate !== null && meta.survivalRate !== undefined
                ? Number(meta.survivalRate).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                  })
                : '0',
    });

    // 5. Trọng lượng tôm
    let weightDisplay = '0';
    if (meta.shrimpSize) {
        const size = parseFloat(meta.shrimpSize);
        if (!isNaN(size) && size > 0) {
            weightDisplay = `${Math.round(1000 / size)}`;
        }
    }
    data.push({
        label: 'Trọng lượng tôm (g/con)',
        value: weightDisplay,
    });

    return data;
};
