import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    GetImportReceiptsParams,
    GetImportReceiptsResponse,
    CreateImportReceiptRequest,
    CreateImportReceiptResponse,
    GetImportReceiptItemsParams,
    GetImportReceiptItemsResponse,
    CreateImportReceiptItemCommand,
    AddImportReceiptItemResponse,
    UpdateImportReceiptItemCommand,
    UpdateImportReceiptItemResponse,
    SubmitImportReceiptResponse,
    ApproveImportReceiptResponse,
    RejectImportReceiptCommand,
    RejectImportReceiptResponse,
    DeleteImportReceiptResponse,
    DeleteImportReceiptItemResponse,
} from '@/features/material/types/importReceipt.types';

export const importReceiptApi = {
    // ============ Receipt CRUD ============
    getAll: async (params?: GetImportReceiptsParams): Promise<GetImportReceiptsResponse> => {
        const { data } = await apiClient.get<GetImportReceiptsResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.LIST,
            { params }
        );
        return data;
    },

    create: async (data: CreateImportReceiptRequest): Promise<CreateImportReceiptResponse> => {
        const response = await apiClient.post<CreateImportReceiptResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.CREATE,
            data
        );
        return response.data;
    },

    getDetail: async (id: string): Promise<GetImportReceiptsResponse> => {
        const { data } = await apiClient.get<GetImportReceiptsResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.DETAIL(id)
        );
        return data;
    },

    update: async (
        id: string,
        data: Partial<CreateImportReceiptRequest>
    ): Promise<CreateImportReceiptResponse> => {
        const response = await apiClient.patch<CreateImportReceiptResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.UPDATE(id),
            data
        );
        return response.data;
    },

    delete: async (id: string): Promise<DeleteImportReceiptResponse> => {
        const { data } = await apiClient.delete<DeleteImportReceiptResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.DELETE(id)
        );
        return data;
    },

    // ============ Receipt Items ============
    getItems: async (
        id: string,
        params?: GetImportReceiptItemsParams
    ): Promise<GetImportReceiptItemsResponse> => {
        const { data } = await apiClient.get<GetImportReceiptItemsResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.ITEMS(id),
            { params }
        );
        return data;
    },

    addItems: async (
        id: string,
        command: CreateImportReceiptItemCommand
    ): Promise<AddImportReceiptItemResponse> => {
        const { data } = await apiClient.post<AddImportReceiptItemResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.ITEMS(id),
            command
        );
        return data;
    },

    updateItems: async (
        id: string,
        command: UpdateImportReceiptItemCommand
    ): Promise<UpdateImportReceiptItemResponse> => {
        const { data } = await apiClient.put<UpdateImportReceiptItemResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.ITEMS(id),
            command
        );
        return data;
    },

    deleteItem: async (
        receiptId: string,
        itemId: string
    ): Promise<DeleteImportReceiptItemResponse> => {
        const { data } = await apiClient.delete<DeleteImportReceiptItemResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.ITEM_DETAIL(receiptId, itemId)
        );
        return data;
    },

    // ============ Workflow Actions ============
    submit: async (id: string): Promise<SubmitImportReceiptResponse> => {
        const { data } = await apiClient.post<SubmitImportReceiptResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.SUBMISSION(id)
        );
        return data;
    },

    approve: async (id: string): Promise<ApproveImportReceiptResponse> => {
        const { data } = await apiClient.post<ApproveImportReceiptResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.APPROVAL(id)
        );
        return data;
    },

    reject: async (
        id: string,
        command?: RejectImportReceiptCommand
    ): Promise<RejectImportReceiptResponse> => {
        const { data } = await apiClient.post<RejectImportReceiptResponse>(
            API_ENDPOINTS.IMPORT_RECEIPT.REJECTION(id),
            command
        );
        return data;
    },
};
