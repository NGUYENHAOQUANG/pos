import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { ParameterSetting } from '@/features/farm/api/environmentApi';
import { EnvironmentParameter } from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { ENVIRONMENT_METRIC_IDS } from '@/features/farm/types/farm.types';

/**
 * Hook to initialize environment data (Metric Types, Zones)
 * Handles loading state and data fetching on focus.
 */
export const useEnvironmentInit = (currentZoneId?: string | number) => {
    const zones = useFarmStore(state => state.zones);
    const fetchZones = useFarmStore(state => state.fetchZones);
    const metricTypes = useFarmStore(state => state.metricTypes);
    const fetchMetricTypes = useFarmStore(state => state.fetchMetricTypes);
    const fetchParameterSettings = useFarmStore(state => state.fetchParameterSettings);

    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                await fetchMetricTypes();
                if (zones.length === 0) await fetchZones();

                if (currentZoneId) {
                    await fetchParameterSettings(currentZoneId);
                }
                setIsLoading(false);
            };
            loadData();
        }, [currentZoneId, fetchMetricTypes, fetchZones, fetchParameterSettings, zones.length])
    );

    return { isLoading, metricTypes, zones };
};

/**
 * Hook to resolve the correct Zone based on Pond Data or Global Selection
 */
export const useZoneResolution = (pond: any, zones: any[]) => {
    const getSelectedZone = useFarmStore(state => state.getSelectedZone);

    const currentZone = useMemo(() => {
        if (!pond || !zones) return null;

        // Try direct ID match
        const pondZoneId = pond.zoneId || pond.zone_id;
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
    currentZoneId: string | number | undefined,
    metricTypes: any[],
    rawParameterSettings: Record<string, ParameterSetting[]>
) => {
    const currentSettings = currentZoneId ? rawParameterSettings[currentZoneId] : undefined;

    // 1. Compute Limits Map (ID -> "min - max")
    const parameterLimits = useMemo(() => {
        const limits: Record<string, string> = {};
        if (!currentSettings || !Array.isArray(currentSettings)) return limits;

        currentSettings.forEach(setting => {
            const metric = metricTypes.find(m => m.metricCode === setting.parameterCode);
            if (
                metric &&
                setting.enabled &&
                setting.minValue !== undefined &&
                setting.maxValue !== undefined &&
                setting.minValue < setting.maxValue
            ) {
                limits[String(metric.id)] = `${setting.minValue} - ${setting.maxValue}`;
            }
        });
        return limits;
    }, [currentSettings, metricTypes]);

    // 2. Compute Visible Metric IDs (Defaults + Enabled in Settings)
    const visibleMetricIds = useMemo(() => {
        // Default IDs: pH, Salinity, Alkalinity, Temp, DO, Transparency
        const ids: string[] = [
            ENVIRONMENT_METRIC_IDS.PH,
            ENVIRONMENT_METRIC_IDS.SALINITY,
            ENVIRONMENT_METRIC_IDS.ALKALINITY,
            ENVIRONMENT_METRIC_IDS.TEMPERATURE,
            ENVIRONMENT_METRIC_IDS.DO,
            ENVIRONMENT_METRIC_IDS.TRANSPARENCY,
        ];

        if (currentSettings && Array.isArray(currentSettings)) {
            currentSettings.forEach(setting => {
                if (setting.enabled) {
                    const metric = metricTypes.find(m => m.metricCode === setting.parameterCode);
                    if (metric) {
                        const id = String(metric.id);
                        if (!ids.includes(id)) ids.push(id);
                    }
                }
            });
        }
        return ids;
    }, [currentSettings, metricTypes]);

    // 3. Compute UI Parameters List (for Edit Settings Screen)
    const uiParameters = useMemo(() => {
        if (metricTypes.length === 0) return { parameters: [], advancedParameters: [] };

        const settingsMap = new Map<string, ParameterSetting>();
        if (Array.isArray(currentSettings)) {
            currentSettings.forEach(s => {
                if (s.parameterCode) settingsMap.set(s.parameterCode, s);
            });
        }

        const params: EnvironmentParameter[] = [];
        const advancedParams: EnvironmentParameter[] = [];

        metricTypes.forEach(metric => {
            const setting = settingsMap.get(metric.metricCode);
            // Default Group IDs
            const isDefault = (
                [
                    ENVIRONMENT_METRIC_IDS.PH,
                    ENVIRONMENT_METRIC_IDS.SALINITY,
                    ENVIRONMENT_METRIC_IDS.ALKALINITY,
                    ENVIRONMENT_METRIC_IDS.TEMPERATURE,
                    ENVIRONMENT_METRIC_IDS.DO,
                    ENVIRONMENT_METRIC_IDS.TRANSPARENCY,
                ] as string[]
            ).includes(String(metric.id));

            const minValue = setting?.minValue?.toString() ?? '';
            const maxValue = setting?.maxValue?.toString() ?? '';
            const limitStr = minValue && maxValue ? `${minValue} - ${maxValue}` : '';

            const param: EnvironmentParameter = {
                id: String(metric.id),
                name: metric.metricName,
                min: minValue,
                max: maxValue,
                limit: limitStr,
                isChecked: !!setting,
                unit: metric.unitName,
            };

            if (setting && setting.enabled !== undefined) {
                param.isChecked = setting.enabled;
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
