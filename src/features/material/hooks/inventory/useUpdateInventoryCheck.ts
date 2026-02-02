import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/features/material/api/inventoryApi';
import { UpdateInventoryCheckItemsRequest } from '@/features/material/types/inventory.types';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast } from '@/features/material/utils/validationToast';
import { normalizeApiError } from '@/core/api/errorHandler';
import { handleError } from '@/shared/utils/errorHandler';

export const useUpdateInventoryCheck = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            payload: UpdateInventoryCheckItemsRequest & {
                inventoryCheckId: string;
                shouldSubmit?: boolean;
            }
        ) => {
            try {
                // 1. Update items using PATCH to avoid creating duplicates
                const updatePayload: UpdateInventoryCheckItemsRequest = {
                    items: payload.items,
                };

                const updateRes = await inventoryApi.updateItems(
                    payload.inventoryCheckId,
                    updatePayload
                );

                if (!updateRes.success) {
                    throw new Error(updateRes.message || 'Cập nhật phiếu thất bại');
                }

                // 2. Submit (Only if shouldSubmit is true)
                if (payload.shouldSubmit) {
                    const submitRes = await inventoryApi.submit(payload.inventoryCheckId);

                    if (!submitRes.success) {
                        console.warn('Submit warning:', submitRes.message);
                    }
                }

                return payload.inventoryCheckId;
            } catch (error: any) {
                console.error(
                    'Update Flow Error:',
                    JSON.stringify(error?.response?.data || error, null, 2)
                );
                throw error;
            }
        },
        onSuccess: async () => {
            showSuccessToast('Cập nhật phiếu kiểm kê thành công');

            // Wait for backend to fully commit changes
            await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

            // Invalidate all inventory-related queries (list, detail, warehouse items, etc.)
            await queryClient.invalidateQueries({
                queryKey: materialKeys.all,
                refetchType: 'all',
            });

            // Force immediate refetch
            await queryClient.refetchQueries({
                queryKey: materialKeys.all,
                type: 'active',
            });
        },
        onError: (error: any) => {
            handleError(normalizeApiError(error));
        },
    });
};
