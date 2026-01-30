import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';
import {
    environmentApi,
    EnvMetricType,
    EnvironmentalParameter,
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

    // Parameter Settings (Per Zone)
    parameterSettings: Record<string, ParameterSetting[]>;
    fetchParameterSettings: (zoneId: string) => Promise<void>;
    createParameterSetting: (zoneId: string, data: CreateParameterSettingRequest) => Promise<void>;
    updateParameterSetting: (
        zoneId: string,
        id: string,
        data: CreateParameterSettingRequest
    ) => Promise<void>;
    deleteParameterSetting: (zoneId: string, id: string) => Promise<void>;

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
            // Set empty array to indicate fetch completed (but no data available)
            set(state => {
                state.parameterSettings[String(zoneId)] = [];
            });
        }
    },
    createParameterSetting: async (zoneId: string, data: any) => {
        await environmentApi.createParameterSetting(zoneId, data);
    },
    updateParameterSetting: async (zoneId: string, id: string, data: any) => {
        await environmentApi.updateParameterSetting(zoneId, id, data);
    },
    deleteParameterSetting: async (zoneId: string, id: string) => {
        await environmentApi.deleteParameterSetting(zoneId, id);
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
