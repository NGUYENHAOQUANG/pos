import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';
import {
    environmentApi,
    EnvMetricType,
    EnvironmentalParameter,
    CreateEnvMetricTypeRequest,
    ParameterSetting,
    CreateParameterSettingRequest,
} from '@/features/farm/api/environmentApi';

export interface EnvironmentSlice {
    // Existing
    environmentJobs: Record<string, JobExecution[]>;
    updateEnvironmentJob: (pondId: string, items: JobExecution[]) => void;

    // Metric Types
    metricTypes: EnvMetricType[];
    fetchMetricTypes: () => Promise<void>;
    createEnvMetricType: (data: CreateEnvMetricTypeRequest) => Promise<void>;
    updateEnvMetricType: (id: number, data: CreateEnvMetricTypeRequest) => Promise<void>;
    deleteEnvMetricType: (id: number) => Promise<void>;

    // Parameter Settings (Per Zone)
    parameterSettings: Record<string, ParameterSetting[]>;
    fetchParameterSettings: (zoneId: string | number) => Promise<void>;
    createParameterSetting: (
        zoneId: string | number,
        data: CreateParameterSettingRequest
    ) => Promise<void>;
    updateParameterSetting: (
        zoneId: string | number,
        id: number | string,
        data: CreateParameterSettingRequest
    ) => Promise<void>;
    deleteParameterSetting: (zoneId: string | number, id: number | string) => Promise<void>;

    // Environment Parameters
    envParameters: Record<string, EnvironmentalParameter[]>; // Cache by pondId
    fetchEnvParameters: (pondId: string | number) => Promise<void>;
}

export const createEnvironmentSlice: StateCreator<
    EnvironmentSlice,
    [['zustand/immer', never]],
    [],
    EnvironmentSlice
> = set => ({
    environmentJobs: {},
    updateEnvironmentJob: (pondId, items) =>
        set(state => {
            state.environmentJobs[pondId] = items;
        }),

    // Metric Types
    metricTypes: [],
    fetchMetricTypes: async () => {
        try {
            const types = await environmentApi.getEnvMetricTypes();
            set(state => {
                state.metricTypes = types;
            });
        } catch (error) {
            console.error('Failed to fetch metric types:', error);
        }
    },
    createEnvMetricType: async data => {
        await environmentApi.createEnvMetricType(data);
        const types = await environmentApi.getEnvMetricTypes();
        set(state => {
            state.metricTypes = types;
        });
    },
    updateEnvMetricType: async (id, data) => {
        await environmentApi.updateEnvMetricType(id, data);
        const types = await environmentApi.getEnvMetricTypes();
        set(state => {
            state.metricTypes = types;
        });
    },
    deleteEnvMetricType: async id => {
        await environmentApi.deleteEnvMetricType(id);
        const types = await environmentApi.getEnvMetricTypes();
        set(state => {
            state.metricTypes = types;
        });
    },

    // Parameter Settings
    parameterSettings: {},
    fetchParameterSettings: async zoneId => {
        try {
            const settings = await environmentApi.getParameterSettings(zoneId);
            set(state => {
                state.parameterSettings[String(zoneId)] = settings;
            });
        } catch (error) {
            console.error('Failed to fetch parameter settings:', error);
        }
    },
    createParameterSetting: async (zoneId, data) => {
        await environmentApi.createParameterSetting(zoneId, data);
        const settings = await environmentApi.getParameterSettings(zoneId);
        set(state => {
            state.parameterSettings[String(zoneId)] = settings;
        });
    },
    updateParameterSetting: async (zoneId, id, data) => {
        await environmentApi.updateParameterSetting(zoneId, id, data);
        const settings = await environmentApi.getParameterSettings(zoneId);
        set(state => {
            state.parameterSettings[String(zoneId)] = settings;
        });
    },
    deleteParameterSetting: async (zoneId, id) => {
        await environmentApi.deleteParameterSetting(zoneId, id);
        const settings = await environmentApi.getParameterSettings(zoneId);
        set(state => {
            state.parameterSettings[String(zoneId)] = settings;
        });
    },

    // Environment Parameters
    envParameters: {},
    fetchEnvParameters: async pondId => {
        try {
            const params = await environmentApi.getEnvParameters(pondId);
            set(state => {
                state.envParameters[String(pondId)] = params;
            });
        } catch (error) {
            console.error('Failed to fetch environment parameters:', error);
        }
    },
});
