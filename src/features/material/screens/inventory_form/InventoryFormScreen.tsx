import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { AppStackParamList } from '@/app/navigation/AppStack';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useUserProfile } from '@/features/menu/hooks/useUserProfile';
import {
    useWarehouses,
    useInventoryDetail,
    useInventoryItems,
    useCreateInventoryCheck,
    useUpdateInventoryCheck,
    useDeleteInventoryTicket,
    materialKeys,
} from '@/features/material/hooks';
import {
    CreateInventoryCheckRequest,
    UpdateInventoryCheckRequest,
} from '@/features/material/types/inventoryCheck.types';
import { SubmitType } from '@/features/material/types/form-submit.types';
import { inventoryService } from '@/features/material/services/inventoryService';
import { InventoryFormValues } from '@/features/material/schemas/inventoryFormSchema';
import { InventoryForm } from '@/features/material/screens/inventory_form/InventoryFormContent';

export const AddInventoryScreen: React.FC = () => {
    // ─── Navigation & Route ────────────────────────────────
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const route = useRoute<RouteProp<AppStackParamList, 'AddInventory'>>();
    const queryClient = useQueryClient();

    const params = route.params;
    const inventoryId = params?.inventoryId;
    const isEditMode = !!inventoryId;

    // ─── Tab Bar ───────────────────────────────────────────
    const { setTabBarVisible } = useTabBarVisibility();

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // ─── Store ─────────────────────────────────────────────
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const { userData } = useUserProfile();

    // ─── Queries ───────────────────────────────────────────
    const { data: warehouses = [] } = useWarehouses({ ZoneId: selectedZoneId || undefined });
    const { data: inventoryDetail, isLoading: isLoadingDetailData } =
        useInventoryDetail(inventoryId);
    const { data: inventoryItems, isLoading: isLoadingItemsData } = useInventoryItems(
        inventoryId,
        undefined
    );

    // ─── Mutations ─────────────────────────────────────────
    const { mutate: createInventoryCheck, isPending: isCreating } = useCreateInventoryCheck();
    const { mutate: updateInventoryCheck, isPending: isUpdating } = useUpdateInventoryCheck();
    const { mutate: deleteInventoryTicket, isPending: isDeleting } = useDeleteInventoryTicket();

    // ─── Submit Type Tracking ──────────────────────────────
    const submitTypeRef = useRef<SubmitType | null>(null);
    const isPending = isCreating || isUpdating || isDeleting;
    const submitType = isPending ? submitTypeRef.current : null;

    // ─── Derived ───────────────────────────────────────────
    const warehouseId = inventoryDetail?.warehouseId ?? warehouses?.[0]?.id;
    const warehouseName = inventoryDetail?.warehouseName ?? warehouses?.[0]?.name ?? '---';
    const isLoadingDetail = isEditMode && (isLoadingDetailData || isLoadingItemsData);

    const initialData = useMemo(() => {
        if (isEditMode && inventoryDetail && inventoryItems) {
            return inventoryService.mapDetailToForm(inventoryDetail, inventoryItems);
        }
        if (!isEditMode && params?.initialMaterial) {
            return inventoryService.createFormFromWarehouseItem(params.initialMaterial);
        }
        return undefined;
    }, [isEditMode, inventoryDetail, inventoryItems, params?.initialMaterial]);

    // ─── Handlers ──────────────────────────────────────────
    const handleSuccess = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: materialKeys.inventory() });
        queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        navigation.goBack();
    }, [queryClient, navigation]);

    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const onSubmit = useCallback(
        (data: InventoryFormValues, isDraft: boolean) => {
            if (!warehouseId) return;

            submitTypeRef.current = isDraft ? SubmitType.Draft : SubmitType.Submit;

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
        deleteInventoryTicket(inventoryId, { onSuccess: handleSuccess });
    }, [inventoryId, deleteInventoryTicket, handleSuccess]);

    // ─── Render ────────────────────────────────────────────
    return (
        <InventoryForm
            isEditMode={isEditMode}
            isLoadingDetail={isLoadingDetail}
            submitType={submitType}
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
