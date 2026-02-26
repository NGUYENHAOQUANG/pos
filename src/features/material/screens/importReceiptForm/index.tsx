import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useMaterials } from '@/features/material/hooks/useMaterials';
import { useSuppliers } from '@/features/material/hooks/useSuppliers';
import { useMaterialOptions } from '@/features/material/hooks/inventory';
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
import { MaterialItem } from '@/features/material/components/warehouse/AddWarehouseMaterial';
import ImportReceiptForm from '@/features/material/screens/importReceiptForm/ImportReceiptForm';
import { ImportReceiptStatus } from '@/features/material/types/importReceipt.types';

export const ImportReceiptFormScreen: React.FC = () => {
    // Navigation
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
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
    const { data: materialsData = [] } = useMaterials({
        PageSize: 1000,
        OrderBy: 'CreatedAt desc',
    });
    const { data: suppliers = [] } = useSuppliers();

    // Derived Data
    const availableMaterials = useMemo(
        () => importReceiptService.mapMaterialsToOptions(materialsData),
        [materialsData]
    );

    const supplierOptions = useMemo(
        () => importReceiptService.mapSuppliersToOptions(suppliers),
        [suppliers]
    );

    const materialOptions = useMaterialOptions(availableMaterials);

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
        if (isEditMode && importReceiptDetail && importReceiptItems && suppliers.length > 0) {
            const formState = importReceiptService.mapDetailToForm(importReceiptDetail, suppliers);
            const itemsData = importReceiptItems.items || [];
            const mappedItems = importReceiptService.mapItemsToForm(itemsData);

            return {
                date: formState.date,
                supplier: formState.supplier,
                warehouseItems: mappedItems,
            };
        }
        return undefined;
    }, [isEditMode, importReceiptDetail, importReceiptItems, suppliers]);

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
            const selectedSupplier = suppliers.find(s => s.name === data.supplier);

            if (!selectedSupplier) {
                showValidationError('Vui lòng chọn nhà cung cấp hợp lệ');
                return;
            }

            const processSubmit = async (documentIds: string[]) => {
                const payload = importReceiptService.mapFormToPayload(
                    selectedSupplier.id,
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
            suppliers,
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
            supplierOptions={supplierOptions}
            materialOptions={materialOptions}
            availableMaterials={availableMaterials}
            onBackPress={handleBackPress}
            onSubmit={onSubmit}
            onDelete={onDelete}
        />
    );
};
