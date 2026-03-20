import { useMemo } from 'react';
import type { ParameterSetting } from '@/features/farm/types/environment.types';
import { useMetrics } from '@/features/farm/hooks/metric/useMetric';
import { useEnvironmentSettings } from '@/features/farm/hooks/pondwork/envhooks/useSettingEnvironment';

/**
 * Hook to initialize environment data (Metric Types, Parameter Settings)
 * Uses TanStack Query for data fetching instead of store actions.
 */
export const useEnvironmentInit = (currentZoneId?: string) => {
    const { data: metricsResponse, isLoading: isLoadingMetrics } = useMetrics();
    const { data: settingsResponse, isLoading: isLoadingSettings } = useEnvironmentSettings(
        currentZoneId || ''
    );

    const metricTypes = useMemo(() => metricsResponse?.data || [], [metricsResponse]);

    const parameterSettings = useMemo(() => {
        if (!currentZoneId || !settingsResponse?.items) return {};
        return { [currentZoneId]: settingsResponse.items } as Record<string, ParameterSetting[]>;
    }, [currentZoneId, settingsResponse]);

    const isLoading = isLoadingMetrics || (!!currentZoneId && isLoadingSettings);

    return { isLoading, metricTypes, parameterSettings };
};
