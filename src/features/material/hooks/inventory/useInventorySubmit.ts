import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query'; // Add useQueryClient
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { showValidationError, showSuccessToast } from '@/features/material/utils/validationToast'; // Add showSuccessToast
import { materialKeys } from '@/features/material/hooks/materialKeys'; // Add materialKeys

import { inventoryApi } from '@/features/material/api/inventoryApi';

type MainTabParams = {
    screen: 'Material';
    params: { selectedTab: 'inventory' };
};

type LocalNavigationProp = NativeStackNavigationProp<
    Omit<MaterialStackParamList, 'MainTabs'> & {
        MainTabs: MainTabParams;
    }
>;

interface UseInventorySubmitProps {
    isEditMode: boolean;
    inventoryId?: string;
    warehouseId?: string;
    note: string;
    items: any[];
    createInventoryCheck: any;
}

export const useInventorySubmit = ({
    isEditMode,
    inventoryId,
    warehouseId,
    note,
    items,
    createInventoryCheck,
}: UseInventorySubmitProps) => {
    const navigation = useNavigation<LocalNavigationProp>();
    const queryClient = useQueryClient();

    const validateForm = useCallback(() => {
        if (!note.trim()) {
            showValidationError('Vui lòng nhập ghi chú lý do điều chỉnh');
            return false;
        }
        if (!warehouseId) {
            showValidationError('Không tìm thấy kho cho trang trại hiện tại');
            return false;
        }
        if (items.length === 0) {
            showValidationError('Vui lòng thêm ít nhất một vật tư');
            return false;
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.materialId) {
                showValidationError(`Vui lòng chọn vật tư (Dòng ${i + 1})`);
                return false;
            }
            if (!String(item.newStock).trim()) {
                showValidationError(`Vui lòng nhập tồn kho mới (Dòng ${i + 1})`);
                return false;
            }
        }
        return true;
    }, [note, items, warehouseId]);

    const navigateToInventoryList = useCallback(() => {
        setTimeout(() => {
            navigation.navigate('MainTabs', {
                screen: 'Material',
                params: { selectedTab: 'inventory' },
            });
        }, 500);
    }, [navigation]);

    const processEditMode = useCallback(
        async (shouldSubmit: boolean) => {
            if (!inventoryId) return;

            try {
                // 0. Update Header (Note)
                await inventoryApi.update(inventoryId, { note });

                // 1. Fetch current items to diff
                const remoteParams = { InventoryCheckId: inventoryId, PageSize: 100 };
                const remoteRes = await inventoryApi.getItems(inventoryId, remoteParams);
                const remoteItems = remoteRes.data?.items || remoteRes.data || [];

                // A. Identify deletions (In Remote but NOT in Form)
                const formItemIds = new Set(items.map(i => i.inventoryCheckItemId).filter(Boolean));
                const itemsToDelete = remoteItems.filter((r: any) => {
                    const rId = r.inventoryCheckItemId || r.InventoryCheckItemId || r.id || r.Id;
                    return rId && !formItemIds.has(rId);
                });

                for (const item of itemsToDelete) {
                    const rId =
                        item.inventoryCheckItemId ||
                        item.InventoryCheckItemId ||
                        item.id ||
                        item.Id;
                    await inventoryApi.deleteItem(inventoryId, rId);
                }

                // B. Identify Updates (In both) & Creates (In Form but NO ID)
                const itemsToUpdate = items.filter(i => i.inventoryCheckItemId);
                const itemsToAdd = items.filter(i => !i.inventoryCheckItemId);

                if (itemsToUpdate.length > 0) {
                    const payload = {
                        inventoryCheckId: inventoryId,
                        items: itemsToUpdate.map(i => ({
                            inventoryCheckItemId: i.inventoryCheckItemId,
                            actualQty: Number(i.newStock),
                        })),
                    };
                    await inventoryApi.updateItems(inventoryId, { items: payload.items });
                }

                if (itemsToAdd.length > 0) {
                    const payload = {
                        inventoryCheckId: inventoryId,
                        items: itemsToAdd.map(i => ({
                            materialId: i.materialId,
                            actualQty: Number(i.newStock),
                            expectedQty: i.oldStock,
                            reason: 'Added via Edit',
                        })),
                    };
                    await inventoryApi.addItems(inventoryId, payload);
                }

                // C. Submit if needed
                if (shouldSubmit) {
                    await inventoryApi.submit(inventoryId);
                }

                showSuccessToast('Cập nhật phiếu kiểm kê thành công');
                await queryClient.invalidateQueries({
                    queryKey: materialKeys.all,
                    refetchType: 'all',
                });

                navigateToInventoryList();
            } catch (error) {
                console.error('Edit Process Failed', error);
                showValidationError('Có lỗi xảy ra khi cập nhật phiếu');
            }
        },
        [inventoryId, items, navigateToInventoryList, note, queryClient]
    );

    const handleSaveProcess = useCallback(
        async (shouldSubmit: boolean) => {
            if (!validateForm()) return;

            if (isEditMode && inventoryId) {
                await processEditMode(shouldSubmit);
            } else {
                // CREATE MODE
                const payload = {
                    header: {
                        warehouseId: warehouseId!,
                        note: note || 'Phiếu mới',
                    },
                    items: items.map(item => {
                        // Find info in warehouseItems if needed, but item state should have it
                        return {
                            materialId: item.materialId,
                            expectedQty: item.oldStock || 0,
                            actualQty: Number(item.newStock),
                        };
                    }),
                    shouldSubmit: shouldSubmit,
                };

                createInventoryCheck(payload, {
                    onSuccess: navigateToInventoryList,
                });
            }
        },
        [
            isEditMode,
            inventoryId,
            items,
            validateForm,
            warehouseId,
            note,
            createInventoryCheck,
            navigateToInventoryList,
            processEditMode,
        ]
    );

    return {
        handleSaveDraft: () => handleSaveProcess(false),
        handleSubmit: () => handleSaveProcess(true),
    };
};
