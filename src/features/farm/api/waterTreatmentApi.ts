/**
 * @file waterTreatmentApi.ts
 * @description API functions for Water Treatment (Xử lý nước)
 * Follows same pattern as waterChangeApi.ts
 */
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    CreateWaterTreatmentCommand,
    UpdateWaterTreatmentCommand,
    IWaterTreatmentParams,
} from '@/features/farm/types/waterTreatment.types';

export const waterTreatmentApi = {
    /** Create a new water treatment record */
    create: async (pondId: string, data: CreateWaterTreatmentCommand): Promise<boolean> => {
        try {
            const url = API_ENDPOINTS.POND.WATER_TREATMENT.CREATE(pondId);
            const response = await apiClient.post(url, data);
            return !!response.data;
        } catch (error) {
            throw error;
        }
    },

    /** Update an existing water treatment record */
    update: async (
        pondId: string,
        id: string,
        data: UpdateWaterTreatmentCommand
    ): Promise<boolean> => {
        try {
            const url = API_ENDPOINTS.POND.WATER_TREATMENT.UPDATE(pondId, id);
            const response = await apiClient.patch(url, data);
            return !!response.data;
        } catch (error) {
            throw error;
        }
    },

    /** Delete a water treatment record */
    delete: async (pondId: string, id: string): Promise<boolean> => {
        try {
            const url = API_ENDPOINTS.POND.WATER_TREATMENT.DELETE(pondId, id);
            const response = await apiClient.delete(url);
            return !!response.data;
        } catch (error) {
            console.error('Delete water treatment error:', error);
            throw error;
        }
    },

    /** Get all water treatment records for a pond (paginated) */
    getAll: async (pondId: string, params?: IWaterTreatmentParams) => {
        try {
            const url = API_ENDPOINTS.POND.WATER_TREATMENT.LIST(pondId);
            const response = await apiClient.get(url, { params });
            return response.data;
        } catch (error) {
            console.error('Get all water treatment error:', error);
            throw error;
        }
    },

    /** Get detail of a single water treatment record */
    getDetail: async (pondId: string, id: string) => {
        try {
            const url = API_ENDPOINTS.POND.WATER_TREATMENT.DETAIL(pondId, id);
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Get detail water treatment error:', error);
            throw error;
        }
    },
};
