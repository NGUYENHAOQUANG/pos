import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stockTransferApi } from '../api/stockTransferApi';
import { CreateStockTransferRequest, GetStockTransfersParams } from '../types/stockTransfer.types';
import { APP_CONFIG } from '@/shared/constants';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

const KEYS = {
    list: (pondId: string, params?: GetStockTransfersParams) => ['stock-transfers', pondId, params],
    detail: (pondId: string, id: string) => ['stock-transfer', pondId, id],
};

export const useStockTransfers = (pondId: string, params?: GetStockTransfersParams) => {
    return useInfiniteQuery({
        queryKey: KEYS.list(pondId, params),
        queryFn: async ({ pageParam = 1 }) => {
            const response = await stockTransferApi.getList(pondId, {
                ...params,
                Page: pageParam,
                PageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
            });
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Không thể tải danh sách sang ao');
        },
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            if (lastPage.hasNextPage) return lastPage.pageNumber + 1;
            return undefined;
        },
        enabled: !!pondId,
    });
};

export const useStockTransferDetail = (pondId: string, id: string) => {
    return useQuery({
        queryKey: KEYS.detail(pondId, id),
        queryFn: async () => {
            const response = await stockTransferApi.getDetail(pondId, id);
            if (response.success && response.data) {
                return response.data;
            }
            throw new Error(response.message || 'Không thể tải chi tiết sang ao');
        },
        enabled: !!pondId && !!id,
    });
};

export const useCreateStockTransfer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, data }: { pondId: string; data: CreateStockTransferRequest }) =>
            stockTransferApi.create(pondId, data),
        onSuccess: (_, variables) => {
            showSuccessToast('Tạo phiếu sang ao thành công');
            queryClient.invalidateQueries({ queryKey: KEYS.list(variables.pondId) });
        },
        onError: error => {
            const message = getErrorMessage(error, 'Tạo phiếu sang ao thất bại');
            showErrorToast(message);
        },
    });
};
