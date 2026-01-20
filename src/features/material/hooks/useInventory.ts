import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IInventoryTicket } from '@/features/material/types/material.types';
import { mockInventoryList } from '@/features/material/data/materialData';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

// Constants for staleTime
const STALE_TIME_SHORT = 2 * 60 * 1000; // 2 minutes

import { GetInventoryParams } from '@/features/material/types/material.types';

/**
 * Hook to fetch inventory tickets (Mock Data)
 */
export const useInventoryTickets = (params?: GetInventoryParams) => {
    return useQuery({
        queryKey: materialKeys.inventory(params),
        queryFn: async () => {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

            let data = [...mockInventoryList];

            if (params) {
                if (params.Search) {
                    const searchLower = params.Search.toLowerCase();
                    data = data.filter(item =>
                        item.checkerName.toLowerCase().includes(searchLower)
                    );
                }

                if (params.Page && params.PageSize) {
                    const start = (params.Page - 1) * params.PageSize;
                    const end = start + params.PageSize;
                    data = data.slice(start, end);
                }
            }

            return data;
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
