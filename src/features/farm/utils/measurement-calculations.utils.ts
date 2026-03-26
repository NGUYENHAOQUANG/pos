import type { Measurement } from '@/features/farm/screens/pondwork/ai-measure-shrimp-size/MeasureShrimpSizeAIScreen';
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

export function calcSizePcsPerKg(measurements: Measurement[]): number | null {
    if (measurements.length === 0) return null;

    const totalPcsPerKg = measurements.reduce((sum, m) => sum + m.pcsPerKg, 0);

    return Math.round(totalPcsPerKg / measurements.length);
}
