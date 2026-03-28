import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { colors } from '@/styles';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useZones } from '@/features/farm/hooks/useZones';
import { useAllPondsByZone } from '@/features/farm/hooks/usePonds';
import { Zone } from '@/features/farm/types/farm.types';
import {
    useCurrentWarehouse,
    useExportReceipt,
    useCreateExportReceipt,
    useUpdateExportReceipt,
    useDeleteExportReceipt,
    useExportReceiptItems,
} from '@/features/material/hooks';
import { useFileSubmit } from '@/shared/hooks/useFileSubmit';
import { FileUploaderRef } from '@/shared/components/forms/FileUploader';
import { DocumentPickerResponse } from '@react-native-documents/picker';

import { exportReceiptService } from '@/features/material/services/exportReceiptService';
import { ExportWarehouseForm } from '@/features/material/screens/export_warehouse_form/ExportWarehouseFormContent';
import { ExportWarehouseFormValues } from '@/features/material/schemas/exportWarehouseFormSchema';
import { showValidationError } from '@/features/material/utils/validationToast';

export const ExportWarehouseFormScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<AppStackParamList, 'ExportWarehouseForm'>>();

    const { exportReceiptId } = route.params ?? {};
    const isEditMode = !!exportReceiptId;

    const { setTabBarVisible } = useTabBarVisibility();
    const queryClient = useQueryClient();
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    const fileUploaderRef = useRef<FileUploaderRef>(null);

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // ─── Data Fetching ──────────────────────────────────────
    const { data: detailData, isLoading: isLoadingDetailData } = useExportReceipt(
        exportReceiptId || ''
    );
    const { data: detailItems, isLoading: isLoadingItemsData } = useExportReceiptItems(
        exportReceiptId || ''
    );
    const isLoadingDetail = isEditMode && (isLoadingDetailData || isLoadingItemsData);

    // ─── Zone / Pond / Warehouse ────────────────────────────
    const [activeZoneId, setActiveZoneId] = useState<string>(selectedZoneId || '');

    const { data: zones = [] } = useZones();
    const { data: ponds = [] } = useAllPondsByZone(activeZoneId);
    const { warehouseId: zoneWarehouseId } = useCurrentWarehouse(activeZoneId || undefined);
    const warehouseId = isEditMode ? detailData?.warehouseId || zoneWarehouseId : zoneWarehouseId;

    useEffect(() => {
        if (isEditMode && detailData?.zoneId) {
            setActiveZoneId(detailData.zoneId.toString());
        }
    }, [isEditMode, detailData?.zoneId]);

    useEffect(() => {
        if (!activeZoneId && zones.length > 0) {
            const defaultZone =
                zones.find((z: Zone) => z.name.toLowerCase().includes('kiên giang')) || zones[0];
            setActiveZoneId(defaultZone.id.toString());
        }
    }, [zones, activeZoneId]);

    const handleZoneChange = useCallback((zoneId: string) => {
        setActiveZoneId(zoneId);
    }, []);

    // ─── Initial Data ───────────────────────────────────────
    const initialData = useMemo(() => {
        if (isEditMode && detailData && detailItems) {
            return exportReceiptService.mapDetailToForm(detailData, detailItems);
        } else if (!isEditMode) {
            return exportReceiptService.createDefaultFormValues(selectedZoneId || '');
        }
        return undefined;
    }, [isEditMode, detailData, detailItems, selectedZoneId]);

    // ─── Mutations ──────────────────────────────────────────
    const { submitWithFiles, isUploading } = useFileSubmit();
    const { mutate: createExport, isPending: isCreating } = useCreateExportReceipt();
    const { mutate: updateExport, isPending: isUpdating } = useUpdateExportReceipt();
    const { mutate: deleteExport, isPending: isDeleting } = useDeleteExportReceipt();

    // ─── Handlers ───────────────────────────────────────────
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

    // ─── Derived State ──────────────────────────────────────
    const isSubmitting = isCreating || isUpdating || isDeleting || isUploading;

    // ─── Render ─────────────────────────────────────────────
    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <ExportWarehouseForm
                isEditMode={isEditMode}
                isLoadingDetail={isLoadingDetail}
                initialData={initialData}
                creatorName={detailData?.creator?.fullname}
                fileUploaderRef={fileUploaderRef}
                onSubmit={onSubmit}
                onDelete={onDelete}
                onBackPress={handleBackPress}
                zones={zones}
                ponds={ponds}
                warehouseId={warehouseId}
                onZoneChange={handleZoneChange}
                isSubmitting={isSubmitting}
            />
        </>
    );
};
