import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Keyboard, InteractionManager } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DocumentPickerResponse } from '@react-native-documents/picker';
import Animated from 'react-native-reanimated';

import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing } from '@/styles';

import { warehouseFormUtils } from '@/features/material/utils/warehouseFormUtils';
import { showValidationError } from '@/features/material/utils/validationToast';
import { importReceiptService } from '@/features/material/services/importReceiptService';
import {
    warehouseFormSchema,
    WarehouseFormValues,
} from '@/features/material/schemas/warehouseFormSchema';
import { ImportReceiptStatus } from '@/features/material/types/importReceipt.types';
import { SubmitType } from '@/features/material/types/form-submit.types';
import { useWarehouseMaterialActions } from '@/features/material/hooks';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { WarehouseInformation } from '@/features/material/components/import_receipt_form/WarehouseInformation';
import { WarehouseFooter } from '@/features/material/components/import_receipt_form/WarehouseFooter';
import {
    AddWarehouseMaterial,
    MaterialItem,
} from '@/features/material/components/AddWarehouseMaterial';
import { ConfirmSubmiss } from '@/features/material/components/ConfirmSubmiss';
import { AddMaterialSkeleton } from '@/features/material/components/AddMaterialSkeleton';

import { SafeInputLayoutMaterial } from '@/shared/components/layout/SafeInputLayoutMaterial';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { FileUploaderRef } from '@/shared/components/forms/FileUploader';

interface ImportReceiptFormContentProps {
    isEditMode: boolean;
    isLoadingDetail: boolean;
    isSubmitting: boolean;
    warehouseId?: string;
    selectedZoneId?: string | null;
    initialData?: {
        date: Date;
        supplier: string;
        supplierName?: string;
        warehouseItems: MaterialItem[];
    };
    onBackPress: () => void;
    onSubmit: (data: WarehouseFormValues, status: ImportReceiptStatus) => void;
    onDelete?: () => void;
}

const ImportReceiptForm: React.FC<ImportReceiptFormContentProps> = ({
    isEditMode,
    isLoadingDetail,
    isSubmitting,
    warehouseId,
    selectedZoneId,
    initialData,
    onBackPress,
    onSubmit,
    onDelete,
}) => {
    // ─── State ──────────────────────────────────────────────
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const submitTypeRef = useRef<SubmitType | null>(null);
    const fileUploaderRef = useRef<FileUploaderRef>(null);
    const initializedRef = useRef(false);
    const initialSnapshotRef = useRef<string | null>(null);
    const theme = useAppTheme();
    const styles = getStyles(theme);

    // ─── Form ───────────────────────────────────────────────
    const { control, handleSubmit, setValue, getValues, reset } = useForm<WarehouseFormValues>({
        resolver: zodResolver(warehouseFormSchema),
        defaultValues: importReceiptService.createDefaultFormValues(),
    });

    const formValues = useWatch({
        control,
        name: ['date', 'supplier', 'files', 'warehouseItems'],
    });

    const [date, supplier, files, warehouseItems] = formValues as [
        Date,
        string,
        DocumentPickerResponse[],
        MaterialItem[]
    ];

    // ─── Material Actions ───────────────────────────────────
    const materialActions = useWarehouseMaterialActions(control, getValues, setValue, []);

    // ─── Effects ────────────────────────────────────────────
    useEffect(() => {
        if (isEditMode && initialData && !initializedRef.current) {
            reset({
                date: initialData.date,
                supplier: initialData.supplier,
                files: [],
                warehouseItems: initialData.warehouseItems,
            });
            initializedRef.current = true;
            initialSnapshotRef.current = importReceiptService.createFormSnapshot({
                date: initialData.date,
                supplier: initialData.supplier,
                warehouseItems: initialData.warehouseItems,
            });
        }
    }, [isEditMode, initialData, reset]);

    // ─── Derived State ──────────────────────────────────────
    const totalAmount = useMemo(
        () => warehouseFormUtils.calculateTotal(warehouseItems || []),
        [warehouseItems]
    );

    const hasChanges = useMemo(
        () =>
            importReceiptService.hasFormChanges({
                isEditMode,
                initialSnapshot: initialSnapshotRef.current,
                date,
                supplier,
                warehouseItems,
                files,
            }),
        [isEditMode, date, supplier, warehouseItems, files]
    );

    // ─── Handlers ───────────────────────────────────────────
    const onError = useCallback(
        (errors: unknown) => warehouseFormUtils.handleFormError(errors, showValidationError),
        []
    );

    const handleDateChange = useCallback((newDate: Date) => setValue('date', newDate), [setValue]);

    const handleSupplierChange = useCallback(
        (newSupplier: string) => setValue('supplier', newSupplier),
        [setValue]
    );

    const handleFilesSelected = useCallback(
        (newFiles: DocumentPickerResponse[]) => setValue('files', newFiles),
        [setValue]
    );

    const handleSaveDraft = useCallback(() => {
        submitTypeRef.current = SubmitType.Draft;
        handleSubmit(data => {
            onSubmit(data, ImportReceiptStatus.Draft);
            fileUploaderRef.current?.markAsSaved();
        }, onError)();
    }, [handleSubmit, onSubmit, onError]);

    const triggerSubmitValidation = useMemo(
        () => handleSubmit(() => setIsConfirmModalVisible(true), onError),
        [handleSubmit, onError]
    );

    const handleConfirmSubmit = useCallback(() => {
        setIsConfirmModalVisible(false);
        submitTypeRef.current = SubmitType.Submit;
        InteractionManager.runAfterInteractions(() => {
            handleSubmit(data => {
                onSubmit(data, ImportReceiptStatus.Pending);
                fileUploaderRef.current?.markAsSaved();
            }, onError)();
        });
    }, [handleSubmit, onSubmit, onError]);

    const handleDeletePress = useCallback(() => {
        Keyboard.dismiss();
        setDeleteModalVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        setDeleteModalVisible(false);
        onDelete?.();
    }, [onDelete]);

    const handleCloseConfirmModal = useCallback(() => setIsConfirmModalVisible(false), []);
    const handleCancelDeleteModal = useCallback(() => setDeleteModalVisible(false), []);

    // ─── Loading State ──────────────────────────────────────
    if (isLoadingDetail) {
        return (
            <>
                <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
                <View style={styles.container}>
                    <HeaderMeterial title="Chỉnh Sửa Phiếu Nhập Kho" onBackPress={onBackPress} />
                    <AddMaterialSkeleton />
                </View>
            </>
        );
    }

    // ─── Render ─────────────────────────────────────────────
    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
            <View style={styles.container}>
                <HeaderMeterial
                    title={isEditMode ? 'Chỉnh Sửa Phiếu Nhập Kho' : 'Tạo Phiếu Nhập Kho'}
                    onBackPress={onBackPress}
                    rightComponent={
                        isEditMode ? <DeleteButton onPress={handleDeletePress} /> : undefined
                    }
                />

                <SafeInputLayoutMaterial>
                    <Animated.ScrollView
                        scrollEventThrottle={16}
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                    >
                        <WarehouseInformation
                            date={date}
                            onDateChange={handleDateChange}
                            supplier={supplier}
                            onSupplierChange={handleSupplierChange}
                            supplierDisplayValue={initialData?.supplierName}
                            selectedZoneId={selectedZoneId}
                            files={files || []}
                            onFilesSelected={handleFilesSelected}
                            fileUploaderRef={fileUploaderRef}
                        />

                        <AddWarehouseMaterial
                            materials={warehouseItems || []}
                            onUpdateMaterial={materialActions.update}
                            onAddMaterial={materialActions.add}
                            onRemoveMaterial={materialActions.remove}
                            warehouseId={warehouseId}
                        />
                    </Animated.ScrollView>
                </SafeInputLayoutMaterial>

                <WarehouseFooter
                    totalAmount={totalAmount}
                    onSaveDraft={handleSaveDraft}
                    onSubmit={triggerSubmitValidation}
                    disabled={isEditMode && !hasChanges}
                    isSavingDraft={isSubmitting && submitTypeRef.current === SubmitType.Draft}
                    isSubmitting={isSubmitting && submitTypeRef.current === SubmitType.Submit}
                />

                <ConfirmSubmiss
                    visible={isConfirmModalVisible}
                    onClose={handleCloseConfirmModal}
                    onConfirm={handleConfirmSubmit}
                    title="Xác Nhận Gửi Phiếu Nhập Kho"
                />

                <ConfirmationModalUI
                    visible={deleteModalVisible}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDeleteModal}
                    title="Xóa phiếu nhập kho"
                    message="Bạn có chắc chắn muốn xóa phiếu nhập kho này không?"
                    showSuccessToast={false}
                />
            </View>
        </>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        content: {
            flex: 1,
        },
        contentContainer: {
            paddingBottom: 100,
            gap: spacing.sm,
        },
    });

export const ImportReceiptFormContent = React.memo(ImportReceiptForm);
