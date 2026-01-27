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
        }) => {
            // 1. Create Header
            const createRes = await inventoryApi.create(payload.header);
            if (!createRes.success || !createRes.data?.id) {
                throw new Error(createRes.message || 'Tạo phiếu thất bại');
            }

            const headerId = createRes.data.id;

            // 2. Add Items
            if (payload.items.length > 0) {
                const itemsPayload: AddInventoryCheckItemsRequest = {
                    inventoryCheckId: headerId,
                    items: payload.items,
                };

                const addItemsRes = await inventoryApi.addItems(headerId, itemsPayload);
                if (!addItemsRes.success) {
                    throw new Error(addItemsRes.message || 'Thêm vật tư vào phiếu thất bại');
                }
            }

            // 3. Submit (Optional but recommended for visibility)
            const submitRes = await inventoryApi.submit(headerId);
            if (!submitRes.success) {
                // Warning only, as data is saved
                console.warn('Submit warning:', submitRes.message);
            }

            return headerId;
        },
        onSuccess: () => {
            showSuccessToast('Tạo phiếu kiểm kê thành công');
            queryClient.invalidateQueries({ queryKey: [...materialKeys.all, 'inventory'] });
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error, 'Tạo phiếu kiểm kê thất bại');
            showErrorToast(errorMessage);
        },
    });
};
