import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    GetImportReceiptsParams,
    GetImportReceiptsResponse,
    CreateImportReceiptRequest,
    CreateImportReceiptResponse,
    GetImportReceiptItemsParams,
    GetImportReceiptItemsResponse,
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

    create: async (data: CreateImportReceiptRequest): Promise<CreateImportReceiptResponse> => {
        const response = await apiClient.post<CreateImportReceiptResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.CREATE,
            data
        );
        console.log(data.documentIds);
        return response.data;
    },

    getItems: async (
        id: string,
        params?: GetImportReceiptItemsParams
    ): Promise<GetImportReceiptItemsResponse> => {
        const { data } = await apiClient.get<GetImportReceiptItemsResponse>(
            `${API_ENDPOINTS.IMPORT_RECEIPT.LIST}/${id}/items`,
            {
                params,
            }
        );
        return data;
    },

    getDetail: async (id: string): Promise<any> => {
        const { data } = await apiClient.get(`${API_ENDPOINTS.IMPORT_RECEIPT.LIST}/${id}`);
        return data;
    },

    update: async (
        id: string,
        data: Partial<CreateImportReceiptRequest>
    ): Promise<CreateImportReceiptResponse> => {
        const response = await apiClient.patch<CreateImportReceiptResponse>(
            `${API_ENDPOINTS.IMPORT_RECEIPT.LIST}/${id}`,
            data
        );
        return response.data;
    },
};
