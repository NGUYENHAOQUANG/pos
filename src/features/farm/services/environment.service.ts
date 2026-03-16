import { ENVIRONMENT_METRIC_IDS } from '@/features/farm/types/farm.types';
import { EnvMetricType, ParameterSetting } from '@/features/farm/api/environmentApi';
import {
    IEnvMeasurementDetail,
    IEnvMeasurement,
    IParameterLimits,
} from '@/features/farm/types/envMeasurement.types';
import { EnvironmentFormValues } from '@/features/farm/schemas/environmentFormSchema';

// --- Internal helpers ---

const getMetricValue = (
    detail: IEnvMeasurement,
    metricTypes: EnvMetricType[],
    metricCode: string
): string => {
    const details = detail.envMeasurementDetail?.envMeasurementDetails;
    if (!details) return '';
    const metric = metricTypes.find(m => m.code === metricCode);
    if (!metric) return '';
    const measurement = details.find(m => m.metricId === metric.id);
    return measurement ? measurement.value.toString() : '';
};

// --- Service ---

export const environmentService = {
    /**
     * Maps API detail response → EnvironmentFormValues for react-hook-form
     */
    mapDetailToForm: (
        detail: IEnvMeasurement,
        metricTypes: EnvMetricType[]
    ): EnvironmentFormValues => {
        return {
            selectedDate: detail.createdAt ? new Date(detail.createdAt) : new Date(),
            notes: detail.envMeasurementDetail?.notes || '',
            documentIds: detail.documentIds || [],
            pH: getMetricValue(detail, metricTypes, ENVIRONMENT_METRIC_IDS.PH),
            dissolvedOxygen: getMetricValue(detail, metricTypes, ENVIRONMENT_METRIC_IDS.DO),
            temperature: getMetricValue(detail, metricTypes, ENVIRONMENT_METRIC_IDS.TEMPERATURE),
            salinity: getMetricValue(detail, metricTypes, ENVIRONMENT_METRIC_IDS.SALINITY),
            alkalinity: getMetricValue(detail, metricTypes, ENVIRONMENT_METRIC_IDS.ALKALINITY),
            transparency: getMetricValue(detail, metricTypes, ENVIRONMENT_METRIC_IDS.TRANSPARENCY),
            kali: getMetricValue(detail, metricTypes, ENVIRONMENT_METRIC_IDS.KALI),
            tan: getMetricValue(detail, metricTypes, ENVIRONMENT_METRIC_IDS.TAN),
            magie: getMetricValue(detail, metricTypes, ENVIRONMENT_METRIC_IDS.MAGIE),
            no3: getMetricValue(detail, metricTypes, ENVIRONMENT_METRIC_IDS.NO3),
        };
    },

    /**
     * Maps meta from JobExecution → EnvironmentFormValues (fallback for legacy data)
     */
    mapMetaToForm: (meta: Record<string, unknown>, note?: string): EnvironmentFormValues => {
        const getVal = (...keys: string[]) => {
            for (const k of keys) {
                if (meta[k] != null && meta[k] !== '') return String(meta[k]);
            }
            return '';
        };

        const dateStr = getVal('date', 'createdAt');

        return {
            selectedDate: dateStr ? new Date(dateStr) : new Date(),
            notes: getVal('notes', 'Notes', 'Note', 'note') || note || '',
            documentIds: [],
            pH: getVal('pH', 'PH', 'Ph'),
            dissolvedOxygen: getVal('dissolvedOxygen', 'DissolvedOxygen', 'DO', 'Do', 'do'),
            temperature: getVal('temperature', 'Temperature', 'Temp'),
            salinity: getVal('salinity', 'Salinity'),
            alkalinity: getVal('alkalinity', 'Alkalinity'),
            transparency: getVal('transparency', 'Transparency'),
            kali: getVal('kali', 'Kali', 'K'),
            tan: getVal('tan', 'Tan', 'TAN'),
            magie: getVal('magie', 'Magie', 'Mg'),
            no3: getVal('no3', 'NO3', 'No3'),
        };
    },

    /**
     * Maps EnvironmentFormValues → API payload measurements array
     */
    mapFormToPayload: (
        metricTypes: EnvMetricType[],
        values: EnvironmentFormValues,
        advancedParameters: Array<{ id: string; name: string }>
    ): IEnvMeasurementDetail[] => {
        const measurements: IEnvMeasurementDetail[] = [];

        const add = (code: string, value: string) => {
            if (!value?.trim()) return;
            const metric = metricTypes.find(m => m.code === code);
            if (metric) {
                measurements.push({ metricId: metric.id, value: parseFloat(value) });
            }
        };

        // Basic
        add(ENVIRONMENT_METRIC_IDS.PH, values.pH);
        add(ENVIRONMENT_METRIC_IDS.DO, values.dissolvedOxygen);
        add(ENVIRONMENT_METRIC_IDS.TEMPERATURE, values.temperature);
        add(ENVIRONMENT_METRIC_IDS.SALINITY, values.salinity);
        add(ENVIRONMENT_METRIC_IDS.ALKALINITY, values.alkalinity);
        add(ENVIRONMENT_METRIC_IDS.TRANSPARENCY, values.transparency);

        // Advanced (only if enabled)
        if (advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.KALI)) {
            add(ENVIRONMENT_METRIC_IDS.KALI, values.kali);
        }
        if (advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.TAN)) {
            add(ENVIRONMENT_METRIC_IDS.TAN, values.tan);
        }
        if (advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.MAGIE)) {
            add(ENVIRONMENT_METRIC_IDS.MAGIE, values.magie);
        }
        if (advancedParameters.some(p => p.id === ENVIRONMENT_METRIC_IDS.NO3)) {
            add(ENVIRONMENT_METRIC_IDS.NO3, values.no3);
        }

        return measurements;
    },

    /**
     * Computes which advanced parameter IDs should be visible based on zone settings
     */
    computeAdvancedParams: (
        currentZoneId: string | undefined,
        parameterSettings: Record<string, ParameterSetting[]>,
        metricTypes: EnvMetricType[]
    ): Array<{ id: string; name: string }> => {
        if (!currentZoneId) return [];
        const settings = parameterSettings[currentZoneId];
        if (!settings || !Array.isArray(settings) || !metricTypes.length) return [];

        const advancedCodesSequence = [
            ENVIRONMENT_METRIC_IDS.NO3,
            ENVIRONMENT_METRIC_IDS.MAGIE,
            ENVIRONMENT_METRIC_IDS.KALI,
            ENVIRONMENT_METRIC_IDS.TAN,
        ];

        const validAdvanced: Array<{ id: string; name: string }> = [];

        advancedCodesSequence.forEach(code => {
            const metric = metricTypes.find(m => m.code === code);
            if (!metric) return;

            const setting = settings.find(
                s => String(s.metricId) === String(metric.id) || s.parameterCode === code
            );

            if (setting) {
                const isEnabled =
                    setting.enabled !== undefined
                        ? setting.enabled
                        : setting.isActive !== undefined
                        ? setting.isActive
                        : false;

                if (isEnabled) {
                    validAdvanced.push({ id: metric.code, name: metric.name });
                }
            }
        });

        return validAdvanced;
    },

    /**
     * Maps parameterLimits (UUID keys) → code keys for UI display
     */
    mapLimitsToCodes: (
        parameterLimits: IParameterLimits,
        metricTypes: EnvMetricType[]
    ): IParameterLimits => {
        const limits: IParameterLimits = {};
        Object.entries(parameterLimits).forEach(([uuid, limitStr]) => {
            const metric = metricTypes.find(m => String(m.id) === uuid);
            if (metric) limits[metric.code] = limitStr;
        });
        return limits;
    },

    /**
     * Computes limits map (metric ID → "min - max") from parameter settings
     */
    computeParameterLimits: (
        currentSettings: ParameterSetting[] | undefined,
        metricTypes: EnvMetricType[]
    ): IParameterLimits => {
        const limits: IParameterLimits = {};
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
    },
};
