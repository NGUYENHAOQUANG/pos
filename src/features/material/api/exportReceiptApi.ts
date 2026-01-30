import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    GetExportReceiptsResponse,
    GetExportReceiptsParams,
    CreateExportReceiptRequest,
} from '@/features/material/types/exportReceipt.types';

export const exportReceiptApi = {
    /**
     * Create a new export receipt
     * @param payload - CreateExportReceiptRequest
     */
    create: async (payload: CreateExportReceiptRequest): Promise<any> => {
        const { data } = await apiClient.post(API_ENDPOINTS.EXPORT_RECEIPT.CREATE, payload);
        return data;
    },
    /**
     * Get all export receipts with pagination
     * @param params - Query params (Page, PageSize, Search, etc.)
     */
    getAll: async (params?: GetExportReceiptsParams): Promise<GetExportReceiptsResponse> => {
        const { data } = await apiClient.get<GetExportReceiptsResponse>(
            API_ENDPOINTS.EXPORT_RECEIPT.LIST,
            { params }
        );
        return data;
    },

    /**
     * Get export receipt detail
     * @param id - Receipt ID
     */
    getDetail: async (id: string): Promise<any> => {
        const { data } = await apiClient.get(API_ENDPOINTS.EXPORT_RECEIPT.DETAIL(id));
        return data;
    },

    /**
     * Update export receipt
     * @param id - Receipt ID
     * @param payload - Update payload
     */
    update: async (id: string, payload: any): Promise<any> => {
        const { data } = await apiClient.patch(API_ENDPOINTS.EXPORT_RECEIPT.UPDATE(id), payload);
        return data;
    },

    /**
     * Delete export receipt
     * @param id - Receipt ID
     */
    delete: async (id: string): Promise<any> => {
        const { data } = await apiClient.delete(API_ENDPOINTS.EXPORT_RECEIPT.DELETE(id));
        return data;
    },

    /**
     * Update export receipt items
     * @param id - Receipt ID
     * @param payload - Items payload
     */
    updateItems: async (id: string, payload: any): Promise<any> => {
        const { data } = await apiClient.patch(
            API_ENDPOINTS.EXPORT_RECEIPT.UPDATE_ITEMS(id),
            payload
        );
        return data;
    },
};
