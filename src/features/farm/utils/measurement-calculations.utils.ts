import type { Measurement } from '@/features/farm/screens/pondwork/ai-measure-shrimp-size/MeasureShrimpSizeAIScreen';

/**
 * Trung bình kích thước tôm (cm) = Tổng kích thước <tất cả lần đo> / Tổng số lượng tôm được đo <tất cả lần đo>
 */
export function calcAverageSizeCm(measurements: Measurement[]): number | null {
    if (measurements.length === 0) return null;

    let totalSizeSum = 0;
    let totalCount = 0;

    measurements.forEach(m => {
        totalSizeSum += m.sizes.reduce((sum, s) => sum + s, 0);
        totalCount += m.count;
    });

    if (totalCount === 0) return 0;
    return parseFloat((totalSizeSum / totalCount).toFixed(2));
}

/**
 * Cỡ tôm (con/kg) = 1000 × Tổng số tôm được đo / Tổng khối lượng tôm được đo
 */
export function calcSizePcsPerKg(measurements: Measurement[]): number | null {
    if (measurements.length === 0) return null;

    let totalCount = 0;
    let totalWeight = 0;

    measurements.forEach(m => {
        totalCount += m.count;
        totalWeight += m.weight;
    });

    if (totalWeight === 0) return 0;
    return Math.round((1000 * totalCount) / totalWeight);
}
