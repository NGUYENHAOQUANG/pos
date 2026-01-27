import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    GetImportReceiptsParams,
    GetImportReceiptsResponse,
} from '@/features/material/types/importReceipt.types';

export const importReceiptApi = {
    getAll: async (params?: GetImportReceiptsParams): Promise<GetImportReceiptsResponse> => {
        const { data } = await apiClient.get<GetImportReceiptsResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.LIST,
            {
                params,
            }
        );
        return data;
    },
};
