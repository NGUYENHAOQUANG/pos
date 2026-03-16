import { useMemo } from 'react';
import { ParameterSetting } from '@/features/farm/api/environmentApi';
import {
    useEnvironmentMetricTypes,
    useEnvironmentSettings,
} from '@/features/farm/hooks/pondwork/envhooks/useSettingEnvironment';

/**
 * Hook to initialize environment data (Metric Types, Parameter Settings)
 * Uses TanStack Query for data fetching instead of store actions.
 */
export const useEnvironmentInit = (currentZoneId?: string) => {
    const { data: metricTypesData, isLoading: isLoadingMetrics } = useEnvironmentMetricTypes();
    const { data: settingsResponse, isLoading: isLoadingSettings } = useEnvironmentSettings(
        currentZoneId || ''
    );

    const metricTypes = useMemo(() => metricTypesData || [], [metricTypesData]);

    const parameterSettings = useMemo(() => {
        if (!currentZoneId || !settingsResponse?.items) return {};
        return { [currentZoneId]: settingsResponse.items } as Record<string, ParameterSetting[]>;
    }, [currentZoneId, settingsResponse]);

    const isLoading = isLoadingMetrics || (!!currentZoneId && isLoadingSettings);

    return { isLoading, metricTypes, parameterSettings };
};
