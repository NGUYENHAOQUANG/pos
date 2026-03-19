import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useUserProfile } from '@/features/menu/hooks/useUserProfile';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import {
    useInventoryDetail,
    useInventoryItems,
    useCreateInventoryCheck,
    useUpdateInventoryCheck,
    useDeleteInventoryTicket,
} from '@/features/material/hooks/inventory/useInventory';
import {
    CreateInventoryCheckRequest,
    UpdateInventoryCheckRequest,
} from '@/features/material/types/inventoryCheck.types';
import { inventoryService } from '@/features/material/services/inventoryService';
import { InventoryFormValues } from '@/features/material/schemas/inventoryFormSchema';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import InventoryForm from '@/features/material/screens/inventory_form/InventoryForm';

export const AddInventoryScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const route = useRoute<RouteProp<AppStackParamList, 'AddInventory'>>();

    const params = route.params;
    const inventoryId = params?.inventoryId;
    const isEditMode = !!inventoryId;

    const { setTabBarVisible } = useTabBarVisibility();
    const queryClient = useQueryClient();

    const { userData } = useUserProfile();
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const { data: warehouses = [] } = useWarehouses({ ZoneId: selectedZoneId || undefined });

    const { data: inventoryDetail, isLoading: isLoadingDetailData } =
        useInventoryDetail(inventoryId);
    const { data: inventoryItems, isLoading: isLoadingItemsData } = useInventoryItems(
        inventoryId,
        undefined
    );

    const warehouseId = inventoryDetail?.warehouseId ?? warehouses?.[0]?.id;
    const warehouseName = inventoryDetail?.warehouseName ?? warehouses?.[0]?.name ?? '---';

    const isLoadingDetail = isEditMode && (isLoadingDetailData || isLoadingItemsData);

    const initialData = useMemo(() => {
        if (isEditMode && inventoryDetail && inventoryItems) {
            return inventoryService.mapDetailToForm(inventoryDetail, inventoryItems);
        } else if (!isEditMode && params?.initialMaterial) {
            const initMat = params.initialMaterial;
            return {
                date: new Date(),
                note: '',
                inventoryItems: [
                    {
                        id: Date.now().toString(),
                        materialId: initMat.materialId,
                        materialName: initMat.materialName ?? '',
                        oldStock: initMat.quantity ?? 0,
                        newStock: '',
                        difference: 0,
                        unit: initMat.unitName ?? '',
                        materialCode: initMat.materialCode ?? '',
                    },
                ],
            };
        }
        return undefined;
    }, [isEditMode, inventoryDetail, inventoryItems, params?.initialMaterial]);

    const { mutate: createInventoryCheck, isPending: isCreating } = useCreateInventoryCheck();
    const { mutate: updateInventoryCheck, isPending: isUpdating } = useUpdateInventoryCheck();
    const { mutate: deleteInventoryTicket, isPending: isDeleting } = useDeleteInventoryTicket();

    const handleSuccess = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: materialKeys.inventory() });
        queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        navigation.goBack();
    }, [queryClient, navigation]);

    const onSubmit = useCallback(
        (data: InventoryFormValues, isDraft: boolean) => {
            if (!warehouseId) return;

            const payload = inventoryService.mapFormToPayload(
                isEditMode ? inventoryId : undefined,
                warehouseId,
                data,
                isDraft
            );

            if (isEditMode && inventoryId) {
                updateInventoryCheck(payload as UpdateInventoryCheckRequest & { id: string }, {
                    onSuccess: handleSuccess,
                });
            } else {
                createInventoryCheck(payload as CreateInventoryCheckRequest, {
                    onSuccess: handleSuccess,
                });
            }
        },
        [
            isEditMode,
            warehouseId,
            inventoryId,
            createInventoryCheck,
            updateInventoryCheck,
            handleSuccess,
        ]
    );

    const onDelete = useCallback(() => {
        if (!inventoryId) return;

        deleteInventoryTicket(inventoryId, {
            onSuccess: handleSuccess,
        });
    }, [inventoryId, deleteInventoryTicket, handleSuccess]);

    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const isSubmitting = isCreating || isUpdating || isDeleting;

    return (
        <InventoryForm
            isEditMode={isEditMode}
            isLoadingDetail={isLoadingDetail}
            isSubmitting={isSubmitting}
            initialData={initialData}
            warehouseName={warehouseName}
            creatorName={userData?.name || '---'}
            warehouseId={warehouseId}
            onBackPress={handleBackPress}
            onSubmit={onSubmit}
            onDelete={onDelete}
        />
    );
};
