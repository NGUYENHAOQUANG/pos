import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { Loading } from '@/shared/components/ui/Loading';
import { colors } from '@/styles';
import { AppStackParamList } from '@/app/navigation/AppStack';

import { exportReceiptService } from '@/features/material/services/exportReceiptService';
import { ExportWarehouseForm } from '@/features/material/screens/export_warehouse_form/ExportWarehouseForm';
import { ExportWarehouseFormValues } from '@/features/material/schemas/exportWarehouseFormSchema';
import { showValidationError } from '@/features/material/utils/validationToast';
import { DocumentPickerResponse } from '@react-native-documents/picker';
import { FileUploaderRef } from '@/shared/components/forms/FileUploader';
import { useFileSubmit } from '@/shared/hooks/useFileSubmit';

import {
    useExportReceipt,
    useCreateExportReceipt,
    useUpdateExportReceipt,
    useDeleteExportReceipt,
} from '@/features/material/hooks/useExportReceipt';
import { useExportReceiptItems } from '@/features/material/hooks/useExportReceiptItems';
import { useCurrentWarehouse } from '@/features/material/hooks/useWarehouses';
import { useFarmStore } from '@/features/farm/store/farmStore';

export const ExportWarehouseFormScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<AppStackParamList, 'ExportWarehouseForm'>>();

    const { exportReceiptId } = route.params ?? {};
    const isEditMode = !!exportReceiptId;

    const { setTabBarVisible } = useTabBarVisibility();
    const queryClient = useQueryClient();

    // Refs
    const fileUploaderRef = useRef<FileUploaderRef>(null);

    // Context & Farm Store
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // Query Detail Data
    const { data: detailData, isLoading: isLoadingDetailData } = useExportReceipt(
        exportReceiptId || ''
    );
    const { data: detailItems, isLoading: isLoadingItemsData } = useExportReceiptItems(
        exportReceiptId || ''
    );

    const [activeZoneId, setActiveZoneId] = useState<string>(selectedZoneId || '');

    useEffect(() => {
        if (isEditMode && detailData?.zoneId) {
            setActiveZoneId(detailData.zoneId.toString());
        }
    }, [isEditMode, detailData?.zoneId]);

    // Derive warehouseId from the zone currently selected in the form
    const { warehouseId: zoneWarehouseId } = useCurrentWarehouse(activeZoneId || undefined);
    const warehouseId = detailData?.warehouseId || zoneWarehouseId;

    const isLoadingDetail = isEditMode && (isLoadingDetailData || isLoadingItemsData);

    const initialData = useMemo(() => {
        if (isEditMode && detailData && detailItems) {
            return exportReceiptService.mapDetailToForm(detailData, detailItems);
        } else if (!isEditMode) {
            return {
                date: new Date(),
                selectedZone: selectedZoneId || '',
                selectedPond: '',
                note: '',
                files: [],
                exportItems: [
                    {
                        id: Date.now().toString(),
                        materialId: '',
                        materialName: '',
                        quantity: '',
                        price: '',
                        unit: '',
                    },
                ],
            };
        }
        return undefined;
    }, [isEditMode, detailData, detailItems, selectedZoneId]);

    // Mutations
    const { submitWithFiles, isUploading } = useFileSubmit();
    const { mutate: createExport, isPending: isCreating } = useCreateExportReceipt();
    const { mutate: updateExport, isPending: isUpdating } = useUpdateExportReceipt();
    const { mutate: deleteExport, isPending: isDeleting } = useDeleteExportReceipt();

    const handleSuccess = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['export-receipts'] });
        queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        fileUploaderRef.current?.markAsSaved();
        navigation.goBack();
    }, [queryClient, navigation]);

    const onSubmit = useCallback(
        (data: ExportWarehouseFormValues, isDraft: boolean) => {
            if (!warehouseId) {
                showValidationError('Không tìm thấy thông tin Kho Của Trại để xuất vật tư.');
                return;
            }

            // Optional: If files were passed directly in initialData that haven't been mapped cleanly, they are tracked here.
            submitWithFiles((data.files as DocumentPickerResponse[]) || [], async documentIds => {
                const payload = exportReceiptService.mapFormToPayload(
                    warehouseId!,
                    data,
                    documentIds,
                    !isDraft
                );

                if (isEditMode && exportReceiptId) {
                    updateExport(
                        {
                            receiptId: exportReceiptId,
                            ...payload,
                        },
                        { onSuccess: handleSuccess }
                    );
                } else {
                    createExport(payload, { onSuccess: handleSuccess });
                }
            });
        },
        [
            isEditMode,
            exportReceiptId,
            warehouseId,
            submitWithFiles,
            createExport,
            updateExport,
            handleSuccess,
        ]
    );

    const onDelete = useCallback(() => {
        if (exportReceiptId) {
            deleteExport(exportReceiptId, {
                onSuccess: handleSuccess,
            });
        }
    }, [exportReceiptId, deleteExport, handleSuccess]);

    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const isSubmitting = isCreating || isUpdating || isDeleting || isUploading;
    const isLoading = isSubmitting || isLoadingDetail;

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <Loading isLoading={isLoading}>
                <ExportWarehouseForm
                    isEditMode={isEditMode}
                    initialData={initialData}
                    creatorName={detailData?.creator?.fullname}
                    fileUploaderRef={fileUploaderRef}
                    onSubmit={onSubmit}
                    onDelete={onDelete}
                    onBackPress={handleBackPress}
                    warehouseId={warehouseId}
                    onZoneChange={zoneId => setActiveZoneId(zoneId)}
                />
            </Loading>
        </>
    );
};
