import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';
import { useUserProfile } from '@/features/menu/hooks/useUserProfile';

// Constants for staleTime
const STALE_TIME_SHORT = 2 * 60 * 1000; // 2 minutes

import { GetInventoryParams, IInventoryTicket } from '@/features/material/types/material.types';
import { inventoryApi } from '@/features/material/api/inventoryApi';
import { GetInventoryChecksParams } from '@/features/material/types/inventory.types';

/**
 * Hook to fetch inventory tickets (Mock Data)
 */
export const useInventoryTickets = (params?: GetInventoryParams) => {
    const { userData } = useUserProfile();
    const currentUserName = userData.name || 'N/A';

    return useQuery({
        queryKey: materialKeys.inventory(params),
        queryFn: async () => {
            const apiParams: GetInventoryChecksParams = {
                Page: params?.Page || 1,
                PageSize: params?.PageSize || 100,
                CheckCode: params?.Search, // Map Search to CheckCode
                OrderBy: 'CreatedAt desc',
            };

            const response = await inventoryApi.getList(apiParams);

            if (response.success && response.data?.items) {
                // Fetch details for all items in parallel to get totalDifference
                const itemsWithDetails = await Promise.all(
                    response.data.items.map(async item => {
                        let totalDifference = 0;
                        let detailItems: any[] = [];

                        try {
                            const detailRes = await inventoryApi.getDetail(item.id);
                            if (detailRes.success && detailRes.data?.items) {
                                detailItems = detailRes.data.items.map(d => ({
                                    id: d.inventoryCheckItemId,
                                    materialName: d.materialName || d.materialCode || 'N/A',
                                    beforeQuantity: d.expectedQty,
                                    afterQuantity: d.actualQty,
                                }));
                                totalDifference = detailRes.data.items.reduce(
                                    (sum, i) => sum + (i.actualQty - i.expectedQty),
                                    0
                                );
                            }
                        } catch (err) {
                            console.warn(`Failed to fetch detail for ${item.id}`, err);
                        }

                        return {
                            id: item.id,
                            // Use creator info from API if available, otherwise use current user
                            checkerName:
                                item.creator?.fullName || item.creator?.userName || currentUserName,
                            date: item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString('vi-VN')
                                : '',
                            note: item.note || '',
                            totalDifference: totalDifference,
                            items: detailItems,
                            status: item.status || 'Draft',
                        } as IInventoryTicket;
                    })
                );

                return itemsWithDetails;
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
