import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { IApiResponse } from '@/shared/types/common.types';
import {
    GetExportReceiptsResponse,
    GetExportReceiptsParams,
    CreateExportReceiptRequest,
    GetExportReceiptByIdResponse,
    UpdateExportReceiptRequest,
    DeleteExportReceiptResponse,
    GetExportReceiptItemsResponse,
    UpdateExportReceiptItemCommand,
    UpdateExportReceiptItemResponse,
    DeleteExportReceiptItemResponse,
} from '@/features/material/types/exportReceipt.types';

export const exportReceiptApi = {
    // ============ Receipt CRUD ============
    create: async (payload: CreateExportReceiptRequest): Promise<IApiResponse<boolean>> => {
        const { data } = await apiClient.post<IApiResponse<boolean>>(
            API_ENDPOINTS.EXPORT_RECEIPT.CREATE,
            payload
        );
        return data;
    },

    getAll: async (params?: GetExportReceiptsParams): Promise<GetExportReceiptsResponse> => {
        const { data } = await apiClient.get<GetExportReceiptsResponse>(
            API_ENDPOINTS.EXPORT_RECEIPT.LIST,
            { params }
        );
        return data;
    },

    getDetail: async (id: string): Promise<GetExportReceiptByIdResponse> => {
        const { data } = await apiClient.get<GetExportReceiptByIdResponse>(
            API_ENDPOINTS.EXPORT_RECEIPT.DETAIL(id)
        );
        return data;
    },

    update: async (
        id: string,
        payload: Omit<UpdateExportReceiptRequest, 'receiptId'>
    ): Promise<IApiResponse<boolean>> => {
        const { data } = await apiClient.patch<IApiResponse<boolean>>(
            API_ENDPOINTS.EXPORT_RECEIPT.UPDATE(id),
            payload
        );
        return data;
    },

    delete: async (id: string): Promise<DeleteExportReceiptResponse> => {
        const { data } = await apiClient.delete<DeleteExportReceiptResponse>(
            API_ENDPOINTS.EXPORT_RECEIPT.DELETE(id)
        );
        return data;
    },

    // ============ Receipt Items ============
    getItems: async (id: string): Promise<GetExportReceiptItemsResponse> => {
        const { data } = await apiClient.get<GetExportReceiptItemsResponse>(
            API_ENDPOINTS.EXPORT_RECEIPT.ITEMS(id)
        );
        return data;
    },

    updateItems: async (
        id: string,
        payload: UpdateExportReceiptItemCommand
    ): Promise<UpdateExportReceiptItemResponse> => {
        const { data } = await apiClient.patch<UpdateExportReceiptItemResponse>(
            API_ENDPOINTS.EXPORT_RECEIPT.UPDATE_ITEMS(id),
            payload
        );
        return data;
    },

    deleteItem: async (
        receiptId: string,
        itemId: string
    ): Promise<DeleteExportReceiptItemResponse> => {
        const { data } = await apiClient.delete<DeleteExportReceiptItemResponse>(
            API_ENDPOINTS.EXPORT_RECEIPT.DELETE_ITEM(receiptId, itemId)
        );
        return data;
    },
};
