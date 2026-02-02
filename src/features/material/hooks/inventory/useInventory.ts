import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

import {
    GetInventoryParams,
    IInventoryTicket,
} from '@/features/material/types/inventoryTicket.types';
import { inventoryApi } from '@/features/material/api/inventoryApi';
import { GetInventoryChecksParams } from '@/features/material/types/inventory.types';

const STALE_TIME_SHORT = 2 * 60 * 1000;
/**
 * Hook to fetch inventory tickets (Mock Data)
 */
export const useInventoryTickets = (params?: GetInventoryParams) => {
    // const { userData } = useUserProfile();

    return useQuery({
        queryKey: materialKeys.inventory(params),
        queryFn: async () => {
            const apiParams: GetInventoryChecksParams = {
                Page: params?.Page || 1,
                PageSize: params?.PageSize || 100,
                CheckCode: params?.Search, // Map Search to CheckCode
                OrderBy: 'CreatedAt desc',
                WarehouseId: params?.WarehouseId,
            };

            const response = await inventoryApi.getList(apiParams);

            if (response.success && response.data?.items) {
                return response.data.items.map(
                    item =>
                        ({
                            id: item.id,
                            checkerName: item.creator?.fullname || '---',
                            date: item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString('vi-VN')
                                : '',
                            note: item.note || '',
                            totalDifference: item.varianceTotalItems || 0,
                            items: [], // Details fetched on demand by InventoryCard
                            status: item.status || 'Draft',
                        } as IInventoryTicket)
                );
            }

            return [];
        },
        staleTime: STALE_TIME_SHORT,
    });
};

/**
 * Hook to add a new inventory ticket (Mock Data)
 */
export const useAddInventoryTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ticket: IInventoryTicket) => {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
            return ticket;
        },
        onSuccess: newTicket => {
            showSuccessToast('Tạo phiếu điều chỉnh tồn kho thành công');
            queryClient.setQueryData(
                materialKeys.inventory(),
                (oldData: IInventoryTicket[] | undefined) => {
                    return oldData ? [newTicket, ...oldData] : [newTicket];
                }
            );
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error, 'Tạo phiếu điều chỉnh tồn kho thất bại');
            showErrorToast(errorMessage);
        },
    });
};

/**
 * Hook to delete an inventory ticket
 */
export const useDeleteInventoryTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await inventoryApi.delete(id);
            if (!response.success) {
                throw new Error(response.message || 'Xóa phiếu thất bại');
            }
            return response.data;
        },
        onSuccess: () => {
            showSuccessToast('Xóa phiếu điều chỉnh tồn kho thành công');
            queryClient.invalidateQueries({
                queryKey: [...materialKeys.all, 'inventory'],
            });
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error, 'Xóa phiếu điều chỉnh tồn kho thất bại');
            showErrorToast(errorMessage);
        },
    });
};
