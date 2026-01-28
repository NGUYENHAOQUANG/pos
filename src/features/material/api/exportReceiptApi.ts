import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    GetExportReceiptsResponse,
    GetExportReceiptsParams,
} from '@/features/material/types/exportReceipt.types';

export const exportReceiptApi = {
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
