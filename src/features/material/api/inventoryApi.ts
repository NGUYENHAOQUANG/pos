import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { IApiResponse } from '@/shared/types/common.types';
import {
    GetInventoryChecksParams,
    GetInventoryChecksResponse,
    GetInventoryCheckDetailResponse,
    CreateInventoryCheckRequest,
    AddInventoryCheckItemsRequest,
} from '../types/inventory.types';

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
};
