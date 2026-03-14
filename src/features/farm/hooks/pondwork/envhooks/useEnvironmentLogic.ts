import { useMemo } from 'react';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { EnvMetricType, ParameterSetting } from '@/features/farm/api/environmentApi';
import { EnvironmentParameter } from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { ENVIRONMENT_METRIC_IDS, PondData, Zone } from '@/features/farm/types/farm.types';
import {
    useEnvironmentMetricTypes,
    useEnvironmentSettings,
} from '@/features/farm/hooks/pondwork/envhooks/useSettingEnvironment';

/**
 * Hook to initialize environment data (Metric Types, Parameter Settings)
 * Uses TanStack Query for data fetching instead of store actions.
 */
export const useEnvironmentInit = (currentZoneId?: string) => {
    const zones = useFarmStore(state => state.zones);

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

    return { isLoading, metricTypes, zones, parameterSettings };
};

/**
 * Hook to resolve the correct Zone based on Pond Data or Global Selection
 */
export const useZoneResolution = (pond: PondData, zones: Zone[]) => {
    const getSelectedZone = useFarmStore(state => state.getSelectedZone);

    const currentZone = useMemo(() => {
        if (!pond || !zones) return null;

        // Try direct ID match
        const pondZoneId = pond.zoneId;
        if (pondZoneId) {
            const byId = zones.find(z => z.id === pondZoneId);
            if (byId) return byId;
        }

        // Try name match
        if (pond.zone) {
            const byName = zones.find(z => z.name === pond.zone);
            if (byName) return byName;
        }

        // Fallback to currently selected global zone
        const globalZone = getSelectedZone();
        if (globalZone) return globalZone;

        return null;
    }, [pond, zones, getSelectedZone]);

    return currentZone;
};

/**
 * Hook to compute parameter configurations (Limits, Visible IDs, UI Lists)
 */
export const useParameterConfiguration = (
    currentZoneId: string | undefined,
    metricTypes: EnvMetricType[],
    rawParameterSettings: Record<string, ParameterSetting[]>
) => {
    const currentSettings = currentZoneId ? rawParameterSettings[currentZoneId] : undefined;

    // 1. Compute Limits Map (ID -> "min - max")
    // Show limits for all parameters with valid min/max, regardless of enabled status
    const parameterLimits = useMemo(() => {
        const limits: Record<string, string> = {};
        if (!currentSettings || !Array.isArray(currentSettings)) return limits;

        currentSettings.forEach(setting => {
            let metric: EnvMetricType | undefined;

            if (setting.metricId) {
                metric = metricTypes.find(m => String(m.id) === setting.metricId);
            } else if (setting.parameterCode) {
                metric = metricTypes.find(m => m.code === setting.parameterCode);
            }

            if (
                metric &&
                setting.minValue !== undefined &&
                setting.maxValue !== undefined &&
                setting.minValue < setting.maxValue
            ) {
                limits[String(metric.id)] = `${setting.minValue} - ${setting.maxValue}`;
            }
        });
        return limits;
    }, [currentSettings, metricTypes]);

    // 2. Compute Visible Metric IDs
    // - Basic metrics: Always visible
    // - Advanced metrics: Only visible when enabled in settings
    const visibleMetricIds = useMemo(() => {
        // Basic metric codes (always visible)
        const basicMetricCodes: string[] = [
            ENVIRONMENT_METRIC_IDS.PH,
            ENVIRONMENT_METRIC_IDS.DO,
            ENVIRONMENT_METRIC_IDS.TEMPERATURE,
            ENVIRONMENT_METRIC_IDS.TRANSPARENCY,
            ENVIRONMENT_METRIC_IDS.SALINITY,
            ENVIRONMENT_METRIC_IDS.ALKALINITY,
        ];

        const ids: Set<string> = new Set();

        // 1. Add ALL Basic Metrics IDs (always visible)
        metricTypes.forEach(m => {
            if (basicMetricCodes.includes(m.code)) {
                ids.add(String(m.id));
            }
        });

        // 2. Add ONLY Enabled Advanced Metrics from Settings
        if (currentSettings && Array.isArray(currentSettings)) {
            currentSettings.forEach(setting => {
                if (setting.enabled) {
                    let metric: EnvMetricType | undefined;

                    if (setting.metricId) {
                        metric = metricTypes.find(m => String(m.id) === setting.metricId);
                    } else if (setting.parameterCode) {
                        metric = metricTypes.find(m => m.code === setting.parameterCode);
                    }

                    // Only add if it's NOT a basic metric (basic metrics already added)
                    if (metric && !basicMetricCodes.includes(metric.code)) {
                        ids.add(String(metric.id));
                    }
                }
            });
        }
        return Array.from(ids);
    }, [currentSettings, metricTypes]);

    // 3. Compute UI Parameters List (for Edit Settings Screen)
    const uiParameters = useMemo(() => {
        if (metricTypes.length === 0) return { parameters: [], advancedParameters: [] };

        const settingsMap = new Map<string, ParameterSetting>();
        if (Array.isArray(currentSettings)) {
            currentSettings.forEach(s => {
                // Map by metricId
                if (s.metricId) settingsMap.set(s.metricId, s);
                // Fallback to parameterCode if metricId is missing (legacy support)
                else if (s.parameterCode) {
                    const metric = metricTypes.find(m => m.code === s.parameterCode);
                    if (metric) settingsMap.set(String(metric.id), s);
                }
            });
        }

        const params: EnvironmentParameter[] = [];
        const advancedParams: EnvironmentParameter[] = [];

        const basicMetricCodes: string[] = [
            ENVIRONMENT_METRIC_IDS.PH,
            ENVIRONMENT_METRIC_IDS.DO,
            ENVIRONMENT_METRIC_IDS.TEMPERATURE,
            ENVIRONMENT_METRIC_IDS.TRANSPARENCY,
            ENVIRONMENT_METRIC_IDS.SALINITY,
            ENVIRONMENT_METRIC_IDS.ALKALINITY,
        ];

        metricTypes.forEach(metric => {
            // Find setting by metric ID (UUID)
            const setting = settingsMap.get(String(metric.id));
            // Default Group Checking by Code
            const isDefault = basicMetricCodes.includes(metric.code);

            const minValue = setting?.minValue?.toString() ?? '';
            const maxValue = setting?.maxValue?.toString() ?? '';
            const limitStr = minValue && maxValue ? `${minValue} - ${maxValue}` : '';

            const param: EnvironmentParameter = {
                id: String(metric.id),
                name: metric.name,
                min: minValue,
                max: maxValue,
                limit: limitStr,
                isChecked: !!setting,
                unit: metric.unitMetric,
                alertEnabled: setting?.alert === true || setting?.alert === 'true',
            };

            if (setting) {
                if (setting.enabled !== undefined) {
                    param.isChecked = setting.enabled;
                } else if (setting.isActive !== undefined) {
                    param.isChecked = setting.isActive;
                }
            }

            if (isDefault) {
                params.push(param);
            } else {
                advancedParams.push(param);
            }
        });

        return { parameters: params, advancedParameters: advancedParams };
    }, [metricTypes, currentSettings]);

    return { parameterLimits, visibleMetricIds, uiParameters };
};
