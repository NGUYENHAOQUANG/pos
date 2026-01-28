import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/features/material/api/inventoryApi';
import {
    CreateInventoryCheckRequest,
    AddInventoryCheckItemsRequest,
} from '@/features/material/types/inventory.types';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

export const useCreateInventoryCheck = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            header: CreateInventoryCheckRequest;
            items: AddInventoryCheckItemsRequest['items'];
            shouldSubmit?: boolean; // New parameter to control submission
        }) => {
            // 1. Create Header WITH Items (Required by Backend)
            // We cannot split Create and AddItems because backend returns "Items field is required".
            const createPayload: CreateInventoryCheckRequest = {
                warehouseId: payload.header.warehouseId,
                note: payload.header.note,
                items: payload.items.map(item => ({
                    materialId: item.materialId,
                    actualQty: item.actualQty,
                    expectedQty: item.expectedQty,
                })),
                autoSubmit: false, // Always create draft first
            };

            try {
                const createRes = await inventoryApi.create(createPayload);

                if (!createRes.success || !createRes.data?.id) {
                    throw new Error(createRes.message || 'Tạo phiếu thất bại');
                }
                const headerId = createRes.data.id;

                // 2. Submit (Only if shouldSubmit is true)
                if (payload.shouldSubmit) {
                    const submitRes = await inventoryApi.submit(headerId);

                    if (!submitRes.success) {
                        console.warn('Submit warning:', submitRes.message);
                    }
                }

                return headerId;
            } catch (error: any) {
                console.error(
                    'Create Flow Error:',
                    JSON.stringify(error?.response?.data || error, null, 2)
                );
                throw error;
            }
        },
        onSuccess: () => {
            showSuccessToast('Tạo phiếu kiểm kê thành công');
            // Invalidate all inventory-related queries
            queryClient.invalidateQueries({
                queryKey: materialKeys.all,
                refetchType: 'all',
            });
        },
        onError: (error: any) => {
            const validationErrors =
                error?.response?.data?.data?.validationErrors || error?.response?.data?.errors;
            let detailMsg = '';
            if (validationErrors) {
                detailMsg = '\n' + JSON.stringify(validationErrors, null, 2);
            }
            const errorMessage = getErrorMessage(error, 'Tạo phiếu kiểm kê thất bại') + detailMsg;
            showErrorToast(errorMessage);
        },
    });
};
