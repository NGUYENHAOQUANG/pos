import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { IApiResponse } from '@/shared/types/common.types';
import {
    GetInventoryChecksParams,
    GetInventoryChecksResponse,
    GetInventoryCheckDetailResponse,
    CreateInventoryCheckRequest,
    AddInventoryCheckItemsRequest,
    UpdateInventoryCheckItemsRequest,
} from '@/features/material/types/inventory.types';

export const inventoryApi = {
    getList: async (params?: GetInventoryChecksParams): Promise<GetInventoryChecksResponse> => {
        const { data } = await apiClient.get<GetInventoryChecksResponse>(
            API_ENDPOINTS.INVENTORY_CHECK.LIST,
            { params }
        );
        return data;
    },
    getDetail: async (id: string): Promise<GetInventoryCheckDetailResponse> => {
        const { data } = await apiClient.get<GetInventoryCheckDetailResponse>(
            `${API_ENDPOINTS.INVENTORY_CHECK.LIST}/${id}`
        );
        return data;
    },
    update: async (id: string, body: { note?: string }): Promise<IApiResponse<any>> => {
        const { data } = await apiClient.patch<IApiResponse<any>>(
            `${API_ENDPOINTS.INVENTORY_CHECK.LIST}/${id}`,
            body
        );
        return data;
    },
    getItems: async (checkId: string, params?: any): Promise<IApiResponse<any>> => {
        const { data } = await apiClient.get<IApiResponse<any>>(
            API_ENDPOINTS.INVENTORY_CHECK.ITEMS(checkId),
            {
                params: {
                    ...params,
                    InventoryCheckId: checkId, // Add explicit query param as per Swagger
                    PageSize: 100, // Ensure we get all items
                },
            }
        );
        return data;
    },
    create: async (body: CreateInventoryCheckRequest): Promise<IApiResponse<{ id: string }>> => {
        const { data } = await apiClient.post<IApiResponse<{ id: string }>>(
            API_ENDPOINTS.INVENTORY_CHECK.CREATE,
            body
        );
        return data;
    },
    addItems: async (
        id: string,
        body: AddInventoryCheckItemsRequest
    ): Promise<IApiResponse<any>> => {
        const { data } = await apiClient.post<IApiResponse<any>>(
            API_ENDPOINTS.INVENTORY_CHECK.ITEMS(id),
            body
        );
        return data;
    },
    updateItems: async (
        id: string,
        body: UpdateInventoryCheckItemsRequest
    ): Promise<IApiResponse<any>> => {
        const { data } = await apiClient.patch<IApiResponse<any>>(
            API_ENDPOINTS.INVENTORY_CHECK.UPDATE_ITEMS(id),
            body
        );
        return data;
    },
    delete: async (id: string): Promise<IApiResponse<any>> => {
        const { data } = await apiClient.delete<IApiResponse<any>>(
            API_ENDPOINTS.INVENTORY_CHECK.DELETE(id)
        );
        return data;
    },
    submit: async (id: string): Promise<IApiResponse<any>> => {
        const { data } = await apiClient.post<IApiResponse<any>>(
            API_ENDPOINTS.INVENTORY_CHECK.SUBMISSION(id)
        );
        return data;
    },
    approve: async (id: string): Promise<IApiResponse<any>> => {
        const { data } = await apiClient.post<IApiResponse<any>>(
            API_ENDPOINTS.INVENTORY_CHECK.APPROVAL(id)
        );
        return data;
    },
    reject: async (id: string): Promise<IApiResponse<any>> => {
        const { data } = await apiClient.post<IApiResponse<any>>(
            API_ENDPOINTS.INVENTORY_CHECK.REJECTION(id)
        );
        return data;
    },
    deleteItem: async (checkId: string, itemId: string): Promise<IApiResponse<any>> => {
        const { data } = await apiClient.delete<IApiResponse<any>>(
            API_ENDPOINTS.INVENTORY_CHECK.DELETE_ITEM(checkId, itemId)
        );
        return data;
    },
};
