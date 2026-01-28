import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { showValidationError } from '@/features/material/utils/validationToast';
import { IWarehouseItem } from '@/features/material/types/material.types';

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
    itemId?: string; // Existing item ID for updates
    warehouseId?: string;
    note: string;
    selectedMaterialId: string;
    newStock: string;
    warehouseItems: IWarehouseItem[];
    createInventoryCheck: any;
    updateInventoryCheck: any;
}

export const useInventorySubmit = ({
    isEditMode,
    inventoryId,
    itemId,
    warehouseId,
    note,
    selectedMaterialId,
    newStock,
    warehouseItems,
    createInventoryCheck,
    updateInventoryCheck,
}: UseInventorySubmitProps) => {
    const navigation = useNavigation<LocalNavigationProp>();

    const validateForm = useCallback(() => {
        if (!note.trim()) {
            showValidationError('Vui lòng nhập ghi chú lý do điều chỉnh');
            return false;
        }
        if (!selectedMaterialId) {
            showValidationError('Vui lòng chọn vật tư');
            return false;
        }
        if (!newStock.trim()) {
            showValidationError('Vui lòng nhập tồn kho mới');
            return false;
        }
        if (!warehouseId) {
            showValidationError('Không tìm thấy kho cho trang trại hiện tại');
            return false;
        }

        const selectedItem = warehouseItems.find(
            (m: IWarehouseItem) => m.materialId === selectedMaterialId
        );
        if (!selectedItem) {
            showValidationError('Vật tư không hợp lệ hoặc không tìm thấy');
            return false;
        }
        return true;
    }, [note, selectedMaterialId, newStock, warehouseId, warehouseItems]);

    const navigateToInventoryList = useCallback(() => {
        setTimeout(() => {
            navigation.navigate('MainTabs', {
                screen: 'Material',
                params: { selectedTab: 'inventory' },
            });
        }, 500);
    }, [navigation]);

    const handleSaveDraft = useCallback(() => {
        if (!validateForm()) return;

        const selectedItem = warehouseItems.find(
            (m: IWarehouseItem) => m.materialId === selectedMaterialId
        )!;

        // EDIT MODE: Update existing draft
        if (isEditMode && inventoryId && itemId) {
            const payload = {
                inventoryCheckId: inventoryId,
                items: [
                    {
                        itemId: itemId,
                        actualQty: Number(newStock),
                    },
                ],
                shouldSubmit: false, // Keep as draft
            };

            updateInventoryCheck(payload, {
                onSuccess: navigateToInventoryList,
            });
            return;
        }

        // CREATE MODE: Create new draft
        const payload = {
            header: {
                warehouseId: warehouseId!,
                note: note || 'Phiếu mới',
            },
            items: [
                {
                    materialId: selectedItem.materialId,
                    expectedQty: selectedItem.quantity || 0,
                    actualQty: Number(newStock),
                },
            ],
            shouldSubmit: false,
        };

        createInventoryCheck(payload, {
            onSuccess: navigateToInventoryList,
        });
    }, [
        isEditMode,
        inventoryId,
        itemId,
        validateForm,
        warehouseItems,
        selectedMaterialId,
        warehouseId,
        note,
        newStock,
        createInventoryCheck,
        updateInventoryCheck,
        navigateToInventoryList,
    ]);

    const handleSubmit = useCallback(() => {
        if (!validateForm()) return;

        const selectedItem = warehouseItems.find(
            (m: IWarehouseItem) => m.materialId === selectedMaterialId
        )!;

        if (isEditMode && inventoryId && itemId) {
            // Update existing draft using PATCH with itemId
            const payload = {
                inventoryCheckId: inventoryId,
                items: [
                    {
                        itemId: itemId, // Use existing item ID
                        actualQty: Number(newStock),
                    },
                ],
                shouldSubmit: true,
            };

            updateInventoryCheck(payload, {
                onSuccess: navigateToInventoryList,
            });
        } else {
            const payload = {
                header: {
                    warehouseId: warehouseId!,
                    note: note || 'Phiếu mới',
                },
                items: [
                    {
                        materialId: selectedItem.materialId,
                        expectedQty: selectedItem.quantity || 0,
                        actualQty: Number(newStock),
                    },
                ],
                shouldSubmit: true,
            };

            createInventoryCheck(payload, {
                onSuccess: navigateToInventoryList,
            });
        }
    }, [
        validateForm,
        warehouseItems,
        selectedMaterialId,
        isEditMode,
        inventoryId,
        itemId,
        warehouseId,
        note,
        newStock,
        updateInventoryCheck,
        createInventoryCheck,
        navigateToInventoryList,
    ]);

    return {
        handleSaveDraft,
        handleSubmit,
    };
};
