import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import {
    useCreateImportReceipt,
    useUpdateImportReceipt,
    useImportReceiptDetail,
    useImportReceiptItems,
    useDeleteImportReceipt,
    importReceiptKeys,
} from '@/features/material/hooks/useImportReceipts';
import { useFileSubmit } from '@/shared/hooks/useFileSubmit';
import { showValidationError } from '@/features/material/utils/validationToast';
import { importReceiptService } from '@/features/material/services/importReceiptService';
import { WarehouseFormValues } from '@/features/material/schemas/warehouseFormSchema';
import { MaterialItem } from '@/features/material/components/AddWarehouseMaterial';
import ImportReceiptForm from '@/features/material/screens/import_receipt_form/ImportReceiptForm';
import { ImportReceiptStatus } from '@/features/material/types/importReceipt.types';

export const ImportReceiptFormScreen: React.FC = () => {
    // Navigation
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const route = useRoute<RouteProp<AppStackParamList, 'ImportReceiptFormScreen'>>();

    const importReceiptId = route.params?.importReceiptId;
    const isEditMode = !!importReceiptId;

    // Stores & Hook Context
    const { setTabBarVisible } = useTabBarVisibility();
    const queryClient = useQueryClient();
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    // Effects
    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // Data Fetching
    const { data: warehouses = [] } = useWarehouses({
        ZoneId: selectedZoneId || undefined,
    });

    // Fetch Details for Edit Mode
    const { data: importReceiptDetail, isLoading: isLoadingDetailData } = useImportReceiptDetail(
        importReceiptId || ''
    );
    const { data: importReceiptItems, isLoading: isLoadingItems } = useImportReceiptItems(
        importReceiptId || '',
        { PageSize: 1000 }
    );
    const isLoadingDetail = isEditMode && (isLoadingDetailData || isLoadingItems);

    // Initial Data for Edit
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

    // Mutations
    const { submitWithFiles, isUploading } = useFileSubmit();
    const { mutate: createImportReceipt, isPending: isCreating } = useCreateImportReceipt();
    const { mutate: updateImportReceipt, isPending: isUpdating } = useUpdateImportReceipt();
    const { mutate: deleteImportReceipt, isPending: isDeleting } = useDeleteImportReceipt();

    const handleSuccess = useCallback(
        (onSuccessUpload: () => void) => {
            onSuccessUpload();
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
        },
        [queryClient, isEditMode, importReceiptId, navigation]
    );

    const onSubmit = useCallback(
        async (
            data: WarehouseFormValues,
            status: ImportReceiptStatus,
            onSuccessUpload: () => void
        ) => {
            // data.supplier is now the supplier ID directly
            const supplierId = data.supplier;

            if (!supplierId) {
                showValidationError('Vui lòng chọn nhà cung cấp hợp lệ');
                return;
            }

            const processSubmit = async (documentIds: string[]) => {
                const payload = importReceiptService.mapFormToPayload(
                    supplierId,
                    warehouses[0]?.id || '',
                    data.warehouseItems as MaterialItem[],
                    status,
                    documentIds
                );

                if (isEditMode && importReceiptId) {
                    updateImportReceipt(
                        { id: importReceiptId, data: payload },
                        { onSuccess: () => handleSuccess(onSuccessUpload) }
                    );
                } else {
                    createImportReceipt(payload, {
                        onSuccess: () => handleSuccess(onSuccessUpload),
                    });
                }
            };

            await submitWithFiles(data.files || [], processSubmit);
        },
        [
            warehouses,
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

        deleteImportReceipt(importReceiptId, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: importReceiptKeys.lists() });
                queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
                navigation.goBack();
            },
        });
    }, [importReceiptId, deleteImportReceipt, queryClient, navigation]);

    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const isSubmitting = isCreating || isUpdating || isUploading || isDeleting;

    return (
        <ImportReceiptForm
            isEditMode={isEditMode}
            isLoadingDetail={isLoadingDetail}
            isSubmitting={isSubmitting}
            initialData={initialData}
            onBackPress={handleBackPress}
            onSubmit={onSubmit}
            onDelete={onDelete}
        />
    );
};
