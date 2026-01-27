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
};
