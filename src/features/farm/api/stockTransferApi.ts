import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    CreateStockTransferRequest,
    CreateStockTransferResponse,
    GetStockTransferDetailResponse,
    GetStockTransfersParams,
    GetStockTransfersResponse,
} from '@/features/farm/types/stockTransfer.types';

export const stockTransferApi = {
    getList: async (pondId: string, params?: GetStockTransfersParams) => {
        const response = await apiClient.get<GetStockTransfersResponse>(
            API_ENDPOINTS.POND.STOCK_TRANSFER.LIST(pondId),
            { params }
        );
        return response.data;
    },
    getDetail: async (pondId: string, id: string) => {
        const response = await apiClient.get<GetStockTransferDetailResponse>(
            API_ENDPOINTS.POND.STOCK_TRANSFER.DETAIL(pondId, id)
        );
        return response.data;
    },
    create: async (pondId: string, data: CreateStockTransferRequest) => {
        const response = await apiClient.post<CreateStockTransferResponse>(
            API_ENDPOINTS.POND.STOCK_TRANSFER.CREATE(pondId),
            { stockTransfer: data }
        );
        return response.data;
    },
};
