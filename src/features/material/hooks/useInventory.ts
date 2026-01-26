import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

// Constants for staleTime
const STALE_TIME_SHORT = 2 * 60 * 1000; // 2 minutes

import { GetInventoryParams, IInventoryTicket } from '@/features/material/types/material.types';
import { inventoryApi } from '@/features/material/api/inventoryApi';

/**
 * Hook to fetch inventory tickets (Mock Data)
 */
export const useInventoryTickets = (params?: GetInventoryParams) => {
    return useQuery({
        queryKey: materialKeys.inventory(params),
        queryFn: async () => {
            const apiParams = {
                Page: params?.Page || 1,
                PageSize: params?.PageSize || 100,
                CheckCode: params?.Search, // Map Search to CheckCode
            };

            const response = await inventoryApi.getList(apiParams);

            if (response.success && response.data?.items) {
                // Map API response to IInventoryTicket for UI compatibility
                return response.data.items.map(item => ({
                    id: item.id,
                    checkerName: item.creator?.fullName || item.creator?.userName || 'N/A',
                    date: item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('vi-VN')
                        : '',
                    note: item.note || '',
                    totalDifference: 0, // Not available in list API
                    items: [], // Details not available in list API
                })) as IInventoryTicket[];
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
