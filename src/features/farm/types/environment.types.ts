export interface ParameterSetting {
    id: string;
    metricId: string;
    zoneId: string;
    minValue?: number;
    maxValue?: number;
    enabled?: boolean;
    alert?: string | boolean;
    isActive?: boolean;
    parameterCode?: string;
}

export type { Metric as EnvMetricType } from '@/features/farm/types/metric.types';
