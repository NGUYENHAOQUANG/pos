import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IWarehouseReceipt } from '@/features/material/types/material.types';
import { mockWarehouseList } from '@/features/material/data/materialData';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

// Constants for staleTime
const STALE_TIME_SHORT = 2 * 60 * 1000; // 2 minutes

import { GetWarehouseParams } from '@/features/material/types/material.types';

/**
 * Hook to fetch warehouse receipts (Mock Data)
 */
export const useWarehouseReceipts = (params?: GetWarehouseParams) => {
    return useQuery({
        queryKey: materialKeys.warehouse(params),
        queryFn: async () => {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

            let data = [...mockWarehouseList];

            if (params) {
                if (params.Search) {
                    const searchLower = params.Search.toLowerCase();
                    data = data.filter(
                        item =>
                            item.supplier?.toLowerCase().includes(searchLower) ||
                            item.materials.some(m =>
                                m.materialName.toLowerCase().includes(searchLower)
                            )
                    );
                }

                if (params.MaterialName) {
                    data = data.filter(item =>
                        item.materials.some(m => m.materialName === params.MaterialName)
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
 * Hook to add a new warehouse receipt (Mock Data)
 */
export const useAddWarehouseReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (receipt: Omit<IWarehouseReceipt, 'id'>) => {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
            const newReceipt: IWarehouseReceipt = {
                ...receipt,
                id: Date.now().toString(),
            };
            return newReceipt;
        },
        onSuccess: newReceipt => {
            showSuccessToast('Tạo phiếu nhập kho thành công');
            queryClient.setQueryData(
                materialKeys.warehouse(),
                (oldData: IWarehouseReceipt[] | undefined) => {
                    return oldData ? [newReceipt, ...oldData] : [newReceipt];
                }
            );
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error, 'Tạo phiếu nhập kho thất bại');
            showErrorToast(errorMessage);
        },
    });
};
