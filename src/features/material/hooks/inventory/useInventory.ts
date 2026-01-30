import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';
// import { useUserProfile } from '@/features/menu/hooks/useUserProfile';

// Constants for staleTime
const STALE_TIME_SHORT = 2 * 60 * 1000; // 2 minutes

import { GetInventoryParams, IInventoryTicket } from '@/features/material/types/material.types';
import { inventoryApi } from '@/features/material/api/inventoryApi';
import { GetInventoryChecksParams } from '@/features/material/types/inventory.types';

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
                // Fetch details for all items in parallel to get totalDifference
                const itemsWithDetails = await Promise.all(
                    response.data.items.map(async item => {
                        let totalDifference = 0;
                        let detailItems: any[] = [];
                        let creatorInfo: any = null;

                        try {
                            const detailRes = await inventoryApi.getDetail(item.id);

                            // Extract creator info first
                            if (detailRes.success && detailRes.data?.creator) {
                                creatorInfo = detailRes.data.creator;
                            }

                            // Handle items (array or paginated object)
                            // @ts-ignore
                            const rawItems = detailRes.data?.items?.items || detailRes.data?.items;

                            if (detailRes.success && Array.isArray(rawItems)) {
                                detailItems = rawItems.map((d: any) => ({
                                    id: d.inventoryCheckItemId,
                                    materialName: d.materialName || d.materialCode || 'N/A',
                                    beforeQuantity: d.expectedQty,
                                    afterQuantity: d.actualQty,
                                }));
                                totalDifference = rawItems.reduce(
                                    (sum: number, i: any) => sum + (i.actualQty - i.expectedQty),
                                    0
                                );
                            }
                        } catch (err) {
                            console.warn(`Failed to fetch detail for ${item.id}`, err);
                        }

                        return {
                            id: item.id,
                            // Use creator info from API only (prefer detail response as it might be more complete)
                            checkerName: creatorInfo?.fullname || item.creator?.fullname || '---',
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
