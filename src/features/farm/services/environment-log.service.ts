import { ENVIRONMENT_METRIC_IDS } from '@/features/farm/types/farm.types';
import type { EnvMetricType } from '@/features/farm/types/environment.types';
import type {
    IEnvMeasurement,
    IEnvMeasurementDetail,
} from '@/features/farm/types/envMeasurement.types';
import type { ActivityData } from '@/features/farm/components/ActivityCard';
import { TrackingGroup, TimelineActivity } from '@/features/farm/components/TrackingList';

const METRIC_DISPLAY: Record<string, { label: string; unit: string }> = {
    [ENVIRONMENT_METRIC_IDS.PH]: { label: 'pH', unit: '' },
    [ENVIRONMENT_METRIC_IDS.DO]: { label: 'Oxy hòa tan', unit: 'mg/L' },
    [ENVIRONMENT_METRIC_IDS.TEMPERATURE]: { label: 'Nhiệt độ', unit: '°C' },
    [ENVIRONMENT_METRIC_IDS.SALINITY]: { label: 'Độ mặn', unit: 'ppt' },
    [ENVIRONMENT_METRIC_IDS.ALKALINITY]: { label: 'Độ kiềm', unit: 'mg/L' },
    [ENVIRONMENT_METRIC_IDS.TRANSPARENCY]: { label: 'Độ trong', unit: 'cm' },
    [ENVIRONMENT_METRIC_IDS.KALI]: { label: 'Kali', unit: 'mg/L' },
    [ENVIRONMENT_METRIC_IDS.TAN]: { label: 'TAN', unit: 'mg/L' },
    [ENVIRONMENT_METRIC_IDS.MAGIE]: { label: 'Magie', unit: 'mg/L' },
    [ENVIRONMENT_METRIC_IDS.NO3]: { label: 'NO3', unit: 'mg/L' },
};

/**
 * Convert a single measurement detail to ActivityData
 */
const mapDetailToActivityData = (
    detail: IEnvMeasurementDetail,
    metricTypes: EnvMetricType[]
): ActivityData | null => {
    const metric = metricTypes.find(mt => mt.id === detail.metricId);
    if (!metric) return null;

    const display = METRIC_DISPLAY[metric.code] ?? { label: metric.name, unit: '' };
    const { label, unit } = display;

    return {
        label: unit ? `${label} (${unit})` : label,
        value: detail.value.toString(),
        isWarning: detail.isAlerted || false,
    };
};

/**
 * Convert a single IEnvMeasurement to TimelineActivity (without onEdit callback)
 */
const mapMeasurementToActivity = (
    measurement: IEnvMeasurement,
    entryNumber: number,
    metricTypes: EnvMetricType[]
): Omit<TimelineActivity, 'onEdit'> => {
    const date = new Date(measurement.createdAt);
    const details = measurement.envMeasurementDetail?.envMeasurementDetails ?? [];

    const data: ActivityData[] = details
        .map(d => mapDetailToActivityData(d, metricTypes))
        .filter((d): d is ActivityData => d !== null);

    return {
        id: measurement.id,
        time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        title: `Lần ${entryNumber}`,
        data,
        note: measurement.envMeasurementDetail?.notes,
    };
};

export const groupMeasurements = (
    items: IEnvMeasurement[],
    metricTypes: EnvMetricType[],
    onEdit?: (measurement: IEnvMeasurement) => void
): TrackingGroup[] => {
    // 1. Group by date
    const byDate = new Map<string, IEnvMeasurement[]>();
    items.forEach(m => {
        const dateKey = new Date(m.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
        if (!byDate.has(dateKey)) {
            byDate.set(dateKey, []);
        }
        byDate.get(dateKey)!.push(m);
    });

    const groups: TrackingGroup[] = [];

    // 2. Process each day
    byDate.forEach((dayItems, dateKey) => {
        // Sort ASC for sequential numbering
        dayItems.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const activities: TimelineActivity[] = dayItems.map((measurement, index) => ({
            ...mapMeasurementToActivity(measurement, index + 1, metricTypes),
            onEdit: onEdit ? () => onEdit(measurement) : undefined,
        }));

        // Sort activities DESC by time for display
        activities.sort((a, b) => {
            const [hA, mA] = a.time.split(':').map(Number);
            const [hB, mB] = b.time.split(':').map(Number);
            return hB * 60 + mB - (hA * 60 + mA);
        });

        groups.push({ id: dateKey, date: dateKey, activities });
    });

    // 3. Sort groups DESC by date
    return groups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
