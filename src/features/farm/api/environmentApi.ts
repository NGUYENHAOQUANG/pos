import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

// --- Interfaces ---

export interface ParameterSetting {
    id: number;
    parameterCode: string; // Corresponds to EnvMetricType.metricCode
    zoneId: number;
    minValue?: number;
    maxValue?: number;
    enabled?: boolean;
    alert?: string;
}

export interface CreateParameterSettingRequest {
    parameterCode: string;
    minValue?: number;
    maxValue?: number;
    enabled?: boolean;
    alert?: string;
}

export interface EnvMetricType {
    id: number;
    metricCode: string;
    metricName: string;
    unitName: string;
    description?: string;
    status: number;
}

export interface CreateEnvMetricTypeRequest {
    metricCode: string;
    metricName: string;
    unitName: string;
    description?: string;
    status?: number;
}

export interface EnvMeasurement {
    id: number;
    envMetricTypeId: number;
    value: number;
    metricName: string;
    unitName: string;
}

export interface EnvironmentalParameter {
    id: number;
    creatorId?: number;
    createdAt?: string; // ISO Date
    notes?: string;
    envMeasurements: EnvMeasurement[];
}

export interface PaginationParams {
    Page?: number;
    PageSize?: number;
}

// --- API Functions ---

export const environmentApi = {
    // --- Metric Types ---
    getEnvMetricTypes: async (): Promise<EnvMetricType[]> => {
        const response = await apiClient.get(API_ENDPOINTS.ENV_METRIC_TYPES.LIST);
        console.log('getEnvMetricTypes response:', JSON.stringify(response.data, null, 2));

        // Handle potential array wrapper variations
        if (Array.isArray(response.data)) return response.data;
        if (response.data?.items) return response.data.items;
        if (response.data?.data?.items) return response.data.data.items;
        // Check for 'data' being the array itself
        if (Array.isArray(response.data?.data)) return response.data.data;

        return response.data || [];
    },

    getEnvMetricType: async (id: number): Promise<EnvMetricType> => {
        const response = await apiClient.get(API_ENDPOINTS.ENV_METRIC_TYPES.DETAIL(id));
        return response.data;
    },

    createEnvMetricType: async (data: CreateEnvMetricTypeRequest): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.ENV_METRIC_TYPES.CREATE, data);
    },

    updateEnvMetricType: async (id: number, data: CreateEnvMetricTypeRequest): Promise<void> => {
        await apiClient.put(API_ENDPOINTS.ENV_METRIC_TYPES.UPDATE(id), data);
    },

    deleteEnvMetricType: async (id: number): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.ENV_METRIC_TYPES.DELETE(id));
    },

    // --- Parameter Settings ---
    getParameterSettings: async (zoneId: number | string): Promise<ParameterSetting[]> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PARAMETER_SETTING.LIST(zoneId));

            // Handle AppResponse failure or null data
            if (response.data?.result === false || !response.data) return [];

            // Check specific array paths
            if (Array.isArray(response.data)) return response.data;
            if (Array.isArray(response.data?.data)) return response.data.data;
            if (Array.isArray(response.data?.items)) return response.data.items;
            if (Array.isArray(response.data?.data?.items)) return response.data.data.items;

            return [];
        } catch (error: any) {
            // Check if error is 404/400 containing "not found" which implies empty settings
            if (error?.response?.status === 400 || error?.response?.status === 404) {
                return [];
            }
            throw error;
        }
    },

    createParameterSetting: async (
        zoneId: number | string,
        data: CreateParameterSettingRequest
    ): Promise<void> => {
        console.log(`Creating Parameter Setting for Zone ${zoneId}:`, JSON.stringify(data));
        const response = await apiClient.post(API_ENDPOINTS.PARAMETER_SETTING.CREATE(zoneId), data);
        console.log('Create Response:', response.status, response.data);
        if (response.data && response.data.result === false) {
            throw new Error(response.data.message || 'Create failed');
        }
    },

    updateParameterSetting: async (
        zoneId: number | string,
        id: number | string,
        data: CreateParameterSettingRequest
    ): Promise<void> => {
        console.log(`Updating Parameter Setting ${id} for Zone ${zoneId}:`, JSON.stringify(data));
        const response = await apiClient.put(
            API_ENDPOINTS.PARAMETER_SETTING.UPDATE(zoneId, id),
            data
        );
        console.log('Update Response:', response.status, response.data);
        if (response.data && response.data.result === false) {
            throw new Error(response.data.message || 'Update failed');
        }
    },

    deleteParameterSetting: async (zoneId: number | string, id: number | string): Promise<void> => {
        console.log(`Deleting Parameter Setting ${id} for Zone ${zoneId}`);
        const response = await apiClient.delete(API_ENDPOINTS.PARAMETER_SETTING.DELETE(zoneId, id));
        console.log('Delete Response:', response.status, response.data);
    },

    // --- Environmental Parameters ---
    getEnvParameters: async (
        pondId: number | string,
        params?: PaginationParams
    ): Promise<EnvironmentalParameter[]> => {
        const response = await apiClient.get(API_ENDPOINTS.ENVIRONMENTAL_PARAMETER.LIST(pondId), {
            params,
        });

        const responseData = response.data;

        if (responseData?.data?.items) {
            return responseData.data.items;
        }

        if (Array.isArray(responseData)) return responseData;
        if (responseData?.items) return responseData.items;

        return [];
    },
};
