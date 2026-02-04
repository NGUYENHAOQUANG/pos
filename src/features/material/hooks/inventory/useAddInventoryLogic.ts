import { useState, useMemo, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { useUserProfile } from '@/features/menu/hooks/useUserProfile';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useWarehouses, useWarehouseItems } from '@/features/material/hooks/useWarehouses';
import {
    useInventoryDetail,
    useInventoryItems,
    useCreateInventoryCheck,
    useUpdateInventoryCheck,
    useDeleteInventoryTicket,
} from '@/features/material/hooks/inventory/useInventory';
import { useMaterialOptions } from '@/features/material/hooks/inventory/useMaterialOptions';
import { showErrorToast } from '@/features/material/utils/validationToast';

export const useAddInventoryLogic = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<MaterialStackParamList, 'AddInventory'>>();
    const params = route.params;
    const inventoryId = params?.inventoryId;
    const isEditMode = !!inventoryId;

    const { userData } = useUserProfile();
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const { data: warehouses } = useWarehouses({ ZoneId: selectedZoneId || undefined });

    // Inventory Data
    const { data: inventoryDetail } = useInventoryDetail(inventoryId);
    const { data: inventoryItems } = useInventoryItems(inventoryId, undefined);

    // Derived State
    const warehouseId = inventoryDetail?.warehouseId || warehouses?.[0]?.id;
    const warehouseName = inventoryDetail?.warehouseName || warehouses?.[0]?.name || '---';

    // Warehouse Items & Options
    const { data: warehouseItemsResponse } = useWarehouseItems(warehouseId, undefined, {
        enabled: !!warehouseId,
    });
    const warehouseItems = useMemo(
        () => warehouseItemsResponse?.items || [],
        [warehouseItemsResponse]
    );
    const materialOptions = useMaterialOptions(warehouseItems);

    // Local Form State
    const [date, setDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [note, setNote] = useState('');
    const [items, setItems] = useState<any[]>([]);

    // Mutations
    const createMutation = useCreateInventoryCheck();
    const updateHeaderMutation = useUpdateInventoryCheck();
    const deleteMutation = useDeleteInventoryTicket();

    // Initialize Form Data
    useEffect(() => {
        if (inventoryDetail) {
            if (inventoryDetail.createdAt) {
                setDate(new Date(inventoryDetail.createdAt));
            }
            if (inventoryDetail.note) {
                setNote(inventoryDetail.note);
            }
        }
    }, [inventoryDetail]);

    useEffect(() => {
        if (inventoryItems && inventoryItems.length > 0) {
            const mappedItems = inventoryItems.map(item => ({
                id: item.id || Date.now().toString() + Math.random(),
                materialId: item.materialId,
                materialName: item.materialName,
                oldStock: item.expectedQty,
                newStock: item.actualQty?.toString() || '',
                difference: item.difference,
                unit: item.unitName,
                materialCode: item.materialCode,
            }));
            setItems(mappedItems);
        } else if (!isEditMode && items.length === 0) {
            setItems([
                {
                    id: Date.now().toString(),
                    materialId: '',
                    materialName: '',
                    oldStock: 0,
                    newStock: '',
                    difference: 0,
                    unit: '',
                },
            ]);
        }
    }, [inventoryItems, isEditMode, items.length]);

    // Handlers
    const handleDateConfirm = (selectedDate: Date) => {
        setDate(selectedDate);
        setDatePickerVisible(false);
    };

    const handleDeletePress = () => setDeleteModalVisible(true);

    const handleConfirmDelete = async () => {
        if (!inventoryId) return;

        try {
            await deleteMutation.mutateAsync(inventoryId);
            setDeleteModalVisible(false);
            navigation.goBack();
        } catch (_error) {
            setDeleteModalVisible(false);
        }
    };

    const handleCancelDelete = () => setDeleteModalVisible(false);

    const handleAddItem = () => {
        setItems(prev => [
            ...prev,
            {
                id: Date.now().toString() + Math.random(),
                materialId: '',
                materialName: '',
                oldStock: 0,
                newStock: '',
                difference: 0,
                unit: '',
            },
        ]);
    };

    const handleRemoveItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleUpdateItem = (id: string, field: string, value: any) => {
        setItems(prev =>
            prev.map(item => {
                if (item.id !== id) return item;

                const updatedItem = { ...item, [field]: value };

                if (field === 'materialId') {
                    const selectedMaterial = warehouseItems.find(w => w.materialId === value);
                    if (selectedMaterial) {
                        updatedItem.materialName = selectedMaterial.materialName || '';
                        updatedItem.oldStock = selectedMaterial.quantity || 0;
                        updatedItem.unit = selectedMaterial.unitName || '';
                        updatedItem.materialCode = selectedMaterial.materialCode || '';

                        const currentNewStock = parseFloat(updatedItem.newStock) || 0;
                        updatedItem.difference = currentNewStock - (selectedMaterial.quantity || 0);
                    }
                } else if (field === 'newStock') {
                    const newStockVal = value === '' ? 0 : parseFloat(value);
                    updatedItem.difference = newStockVal - (item.oldStock || 0);
                }

                return updatedItem;
            })
        );
    };

    const validateForm = () => {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.materialId) {
                showErrorToast(`Vui lòng chọn vật tư (Vật tư ${i + 1})`);
                return false;
            }
            if (!String(item.newStock).trim()) {
                showErrorToast(`Vui lòng nhập tồn kho mới (Vật tư ${i + 1})`);
                return false;
            }
        }
        return true;
    };

    const processSubmit = async (isDraft: boolean) => {
        if (!warehouseId) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        const validItems = items.filter(i => i.materialId);

        try {
            if (!isEditMode) {
                // CREATE
                const payload = {
                    warehouseId,
                    note,
                    items: validItems.map(i => ({
                        materialId: i.materialId,
                        actualQty: i.newStock === '' ? 0 : parseFloat(i.newStock),
                        expectedQty: i.oldStock,
                    })),
                    autoSubmit: !isDraft,
                };
                await createMutation.mutateAsync(payload);
                navigation.goBack();
            } else {
                // EDIT
                const updatePayload = {
                    id: inventoryId,
                    warehouseId,
                    note,
                    items: validItems.map(i => ({
                        materialId: i.materialId,
                        actualQty: i.newStock === '' ? 0 : parseFloat(i.newStock),
                    })),
                    autoSubmit: !isDraft,
                };
                console.log('Edit Payload:', JSON.stringify(updatePayload, null, 2));
                await updateHeaderMutation.mutateAsync(updatePayload);

                navigation.goBack();
            }
        } catch (error) {
            console.error('Submit failed', error);
        }
    };

    const handleSaveDraft = () => processSubmit(true);
    const handleSubmit = () => processSubmit(false);

    return {
        // State
        isEditMode,
        date,
        isDatePickerVisible,
        deleteModalVisible,
        note,
        items,
        warehouseName,
        creatorName: userData.name,
        materialOptions,

        // Setters
        setDate,
        setDatePickerVisible,
        setDeleteModalVisible,
        setNote,

        // Handlers
        handleDateConfirm,
        handleDeletePress,
        handleConfirmDelete,
        handleCancelDelete,
        handleAddItem,
        handleRemoveItem,
        handleUpdateItem,
        handleSaveDraft,
        handleSubmit,
        goBack: navigation.goBack,
    };
};
