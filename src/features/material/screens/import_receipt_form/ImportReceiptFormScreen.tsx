import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useFarmStore } from '@/features/farm/store/farmStore';

import {
    useCurrentWarehouse,
    useCreateImportReceipt,
    useUpdateImportReceipt,
    useImportReceiptDetail,
    useImportReceiptItems,
    useDeleteImportReceipt,
    importReceiptKeys,
} from '@/features/material/hooks';
import { importReceiptService } from '@/features/material/services/importReceiptService';
import { WarehouseFormValues } from '@/features/material/schemas/warehouseFormSchema';
import { ImportReceiptStatus } from '@/features/material/types/importReceipt.types';
import { MaterialItem } from '@/features/material/components/AddWarehouseMaterial';
import { ImportReceiptFormContent } from '@/features/material/screens/import_receipt_form/ImportReceiptFormContent';
import { showValidationError } from '@/features/material/utils/validationToast';

import { useFileSubmit } from '@/shared/hooks/useFileSubmit';

export const ImportReceiptFormScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const route = useRoute<RouteProp<AppStackParamList, 'ImportReceiptFormScreen'>>();

    const importReceiptId = route.params?.importReceiptId;
    const isEditMode = !!importReceiptId;

    const { setTabBarVisible } = useTabBarVisibility();
    const queryClient = useQueryClient();
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // ─── Data Fetching ──────────────────────────────────────
    const { warehouseId } = useCurrentWarehouse(selectedZoneId || undefined);

    const { data: importReceiptDetail, isLoading: isLoadingDetailData } = useImportReceiptDetail(
        importReceiptId || ''
    );
    const { data: importReceiptItems, isLoading: isLoadingItems } = useImportReceiptItems(
        importReceiptId || '',
        { PageSize: 1000 }
    );
    const isLoadingDetail = isEditMode && (isLoadingDetailData || isLoadingItems);

    // ─── Initial Data ───────────────────────────────────────
    const initialData = useMemo(() => {
        if (isEditMode && importReceiptDetail && importReceiptItems) {
            const formState = importReceiptService.mapDetailToForm(importReceiptDetail);
            const itemsData = importReceiptItems.items || [];
            const mappedItems = importReceiptService.mapItemsToForm(itemsData);

            return {
                date: formState.date,
                supplier: formState.supplier,
                supplierName: formState.supplierName,
                warehouseItems: mappedItems,
            };
        }
        return undefined;
    }, [isEditMode, importReceiptDetail, importReceiptItems]);

    // ─── Mutations ──────────────────────────────────────────
    const { submitWithFiles, isUploading } = useFileSubmit();
    const { mutate: createImportReceipt, isPending: isCreating } = useCreateImportReceipt();
    const { mutate: updateImportReceipt, isPending: isUpdating } = useUpdateImportReceipt();
    const { mutate: deleteImportReceipt, isPending: isDeleting } = useDeleteImportReceipt();

    // ─── Handlers ───────────────────────────────────────────
    const handleSuccess = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        queryClient.invalidateQueries({ queryKey: importReceiptKeys.lists() });

        if (isEditMode && importReceiptId) {
            queryClient.invalidateQueries({
                queryKey: ['importReceipts', 'items', importReceiptId],
            });
            queryClient.invalidateQueries({
                queryKey: importReceiptKeys.detail(importReceiptId),
            });
        }
        navigation.goBack();
    }, [queryClient, isEditMode, importReceiptId, navigation]);

    const onSubmit = useCallback(
        (data: WarehouseFormValues, status: ImportReceiptStatus) => {
            const supplierId = data.supplier;

            if (!supplierId) {
                showValidationError('Vui lòng chọn nhà cung cấp hợp lệ');
                return;
            }

            if (!warehouseId) {
                showValidationError('Không tìm thấy thông tin Kho Của Trại để nhập vật tư.');
                return;
            }

            submitWithFiles(data.files || [], async documentIds => {
                const payload = importReceiptService.mapFormToPayload(
                    supplierId,
                    warehouseId,
                    data.warehouseItems as MaterialItem[],
                    status,
                    documentIds
                );

                if (isEditMode && importReceiptId) {
                    updateImportReceipt(
                        { id: importReceiptId, data: payload },
                        { onSuccess: handleSuccess }
                    );
                } else {
                    createImportReceipt(payload, { onSuccess: handleSuccess });
                }
            });
        },
        [
            warehouseId,
            isEditMode,
            importReceiptId,
            submitWithFiles,
            updateImportReceipt,
            createImportReceipt,
            handleSuccess,
        ]
    );

    const onDelete = useCallback(() => {
        if (!importReceiptId) return;
        deleteImportReceipt(importReceiptId, { onSuccess: handleSuccess });
    }, [importReceiptId, deleteImportReceipt, handleSuccess]);

    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    // ─── Derived State ──────────────────────────────────────
    const isSubmitting = isCreating || isUpdating || isUploading || isDeleting;

    // ─── Render ─────────────────────────────────────────────
    return (
        <ImportReceiptFormContent
            isEditMode={isEditMode}
            isLoadingDetail={isLoadingDetail}
            isSubmitting={isSubmitting}
            warehouseId={warehouseId}
            selectedZoneId={selectedZoneId}
            initialData={initialData}
            onBackPress={handleBackPress}
            onSubmit={onSubmit}
            onDelete={onDelete}
        />
    );
};
