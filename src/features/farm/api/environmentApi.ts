import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    ICreateEnvMeasurementReq,
    IUpdateEnvMeasurementReq,
    IEnvMeasurementParams,
    EnvMeasurementResponse,
    GetEnvMeasurementsResponse,
    EnvCreateUpdateResponse,
} from '@/features/farm/types/envMeasurement.types';

// --- Interfaces ---

export interface ParameterSetting {
    id: string;
    metricId: string; // Updated from parameterCode
    zoneId: string;
    minValue?: number;
    maxValue?: number;
    enabled?: boolean;
    alert?: string | boolean;
    isActive?: boolean;
    parameterCode?: string; // Keep optional for backward compatibility if needed, or remove. Response shows metricId.
}

export interface CreateParameterSettingRequest {
    metricId: string; // Changed from parameterCode to match backend requirements
    minValue?: number;
    maxValue?: number;
    enabled?: boolean;
    alert?: string | boolean;
    isActive?: boolean;
}

export interface EnvMetricType {
    id: string;
    code: string;
    name: string;
    unitMetric: string;
    description?: string;
    status: number;
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
        const response = await apiClient.get(API_ENDPOINTS.METRIC.LIST);

        // Handle potential array wrapper variations
        if (Array.isArray(response.data)) return response.data;
        if (response.data?.items) return response.data.items;
        if (response.data?.data?.items) return response.data.data.items;
        // Check for 'data' being the array itself
        if (Array.isArray(response.data?.data)) return response.data.data;

        return response.data || [];
    },

    // --- Environment Measurements ---
    getEnvMeasurements: async (
        pondId: string,
        params?: IEnvMeasurementParams
    ): Promise<GetEnvMeasurementsResponse> => {
        const response = await apiClient.get<GetEnvMeasurementsResponse>(
            API_ENDPOINTS.POND.ENV_MEASUREMENT.LIST(pondId),
            { params }
        );
        return response.data;
    },

    getEnvMeasurementDetail: async (
        pondId: string,
        id: string
    ): Promise<EnvMeasurementResponse> => {
        const response = await apiClient.get<EnvMeasurementResponse>(
            API_ENDPOINTS.POND.ENV_MEASUREMENT.DETAIL(pondId, id)
        );
        return response.data;
    },

    createEnvMeasurement: async (
        pondId: string,
        data: ICreateEnvMeasurementReq
    ): Promise<EnvCreateUpdateResponse> => {
        const response = await apiClient.post<EnvCreateUpdateResponse>(
            API_ENDPOINTS.POND.ENV_MEASUREMENT.CREATE(pondId),
            data
        );
        return response.data;
    },

    updateEnvMeasurement: async (
        pondId: string,
        id: string,
        data: IUpdateEnvMeasurementReq
    ): Promise<EnvCreateUpdateResponse> => {
        const response = await apiClient.patch<EnvCreateUpdateResponse>(
            API_ENDPOINTS.POND.ENV_MEASUREMENT.UPDATE(pondId, id),
            data
        );
        return response.data;
    },

    deleteEnvMeasurement: async (pondId: string, id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.POND.ENV_MEASUREMENT.DELETE(pondId, id));
    },
};
