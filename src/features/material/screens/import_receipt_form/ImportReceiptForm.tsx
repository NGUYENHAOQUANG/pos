import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DocumentPickerResponse } from '@react-native-documents/picker';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import Animated from 'react-native-reanimated';
import { WarehouseInformation } from '@/features/material/components/import_receipt_form/WarehouseInformation';
import {
    AddWarehouseMaterial,
    MaterialItem,
} from '@/features/material/components/AddWarehouseMaterial';
import { Loading } from '@/shared/components/ui/Loading';
import { colors, spacing } from '@/styles';
import { ConfirmSubmiss } from '@/features/material/components/ConfirmSubmiss';
import { WarehouseFooter } from '@/features/material/components/import_receipt_form/WarehouseFooter';
import { FileUploader, FileUploaderRef } from '@/shared/components/forms/FileUploader';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { AddMaterialSkeleton } from '@/features/material/components/AddMaterialSkeleton';

import { showValidationError } from '@/features/material/utils/validationToast';
import { warehouseFormUtils } from '@/features/material/utils/warehouseFormUtils';
import {
    warehouseFormSchema,
    WarehouseFormValues,
} from '@/features/material/schemas/warehouseFormSchema';
import { useWarehouseMaterialActions } from '@/features/material/hooks/logic/useWarehouseMaterialActions';
import { ImportReceiptStatus } from '@/features/material/types/importReceipt.types';
import { SafeInputLayoutMaterial } from '@/shared/components/layout/SafeInputLayoutMaterial';

export type AddImportReceiptUIProps = {
    isEditMode: boolean;
    isLoadingDetail: boolean;
    isSubmitting: boolean;
    initialData?: {
        date: Date;
        supplier: string;
        supplierName?: string;
        warehouseItems: MaterialItem[];
    };
    onBackPress: () => void;
    onSubmit: (
        data: WarehouseFormValues,
        status: ImportReceiptStatus,
        onSuccess: () => void
    ) => void;
    onDelete?: () => void;
};

const ImportReceiptFormComponent: React.FC<AddImportReceiptUIProps> = ({
    isEditMode,
    isLoadingDetail,
    isSubmitting,
    initialData,
    onBackPress,
    onSubmit,
    onDelete,
}) => {
    const insets = useSafeAreaInsets();
    const safeBottom = Math.max(insets.bottom, 12);

    const { control, handleSubmit, setValue, getValues, reset } = useForm<WarehouseFormValues>({
        resolver: zodResolver(warehouseFormSchema),
        defaultValues: {
            date: new Date(),
            supplier: '',
            files: [],
            warehouseItems: [
                {
                    id: Date.now().toString(),
                    materialId: '',
                    materialName: '',
                    quantity: '',
                    price: '',
                    unit: '',
                },
            ],
        },
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

    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const fileUploaderRef = useRef<FileUploaderRef>(null);
    const scrollViewRef = useRef<any>(null);
    const initializedRef = useRef(false);
    const initialSnapshotRef = useRef<string | null>(null);

    const totalAmount = useMemo(
        () => warehouseFormUtils.calculateTotal(warehouseItems || []),
        [warehouseItems]
    );

    const materialActions = useWarehouseMaterialActions(
        control,
        getValues,
        setValue,
        [] // Material name/unit set directly by DropdownMaterialItem callback
    );

    useEffect(() => {
        if (isEditMode && initialData && !initializedRef.current) {
            reset({
                date: initialData.date,
                supplier: initialData.supplier,
                files: [],
                warehouseItems: initialData.warehouseItems,
            });
            initializedRef.current = true;
            // Save snapshot for change comparison
            initialSnapshotRef.current = JSON.stringify({
                date: new Date(initialData.date).getTime(),
                supplier: initialData.supplier || '',
                warehouseItems: (initialData.warehouseItems || []).map((item: MaterialItem) => ({
                    materialId: item.materialId || '',
                    quantity: item.quantity || '',
                    price: item.price || '',
                })),
            });
        }
    }, [isEditMode, initialData, reset]);

    // Track changes for edit mode disable
    const hasChanges = useMemo(() => {
        if (!isEditMode || !initialSnapshotRef.current) return true;
        const normalizeItems = (items: MaterialItem[]) =>
            (items || []).map((item: MaterialItem) => ({
                materialId: item.materialId || '',
                quantity: item.quantity || '',
                price: item.price || '',
            }));
        const currentSnapshot = JSON.stringify({
            date: new Date(date).getTime(),
            supplier: supplier || '',
            warehouseItems: normalizeItems(warehouseItems),
        });
        if (currentSnapshot !== initialSnapshotRef.current) return true;
        if ((files || []).length > 0) return true;
        return false;
    }, [isEditMode, date, supplier, warehouseItems, files]);

    const onError = useCallback(
        (errors: unknown) => warehouseFormUtils.handleFormError(errors, showValidationError),
        []
    );

    const handleConfirmSubmit = useCallback(() => {
        setIsConfirmModalVisible(false);
        setTimeout(() => {
            handleSubmit(data => {
                onSubmit(data, ImportReceiptStatus.Pending, () => {
                    fileUploaderRef.current?.markAsSaved();
                });
            }, onError)();
        }, 500);
    }, [handleSubmit, onSubmit, onError]);

    const handleDeletePress = useCallback(() => {
        Keyboard.dismiss();
        setDeleteModalVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        setDeleteModalVisible(false);
        onDelete?.();
    }, [onDelete]);

    const handleSaveDraft = useMemo(
        () =>
            handleSubmit(data => {
                onSubmit(data, ImportReceiptStatus.Draft, () => {
                    fileUploaderRef.current?.markAsSaved();
                });
            }, onError),
        [handleSubmit, onSubmit, onError]
    );

    const triggerSubmitValidation = useMemo(
        () => handleSubmit(() => setIsConfirmModalVisible(true), onError),
        [handleSubmit, onError]
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
    const handleCloseConfirmModal = useCallback(() => setIsConfirmModalVisible(false), []);
    const handleCancelDeleteModal = useCallback(() => setDeleteModalVisible(false), []);

    if (isLoadingDetail) {
        return (
            <>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <View style={styles.container}>
                    <HeaderMeterial title="Chỉnh Sửa Phiếu Nhập Kho" onBackPress={onBackPress} />
                    <AddMaterialSkeleton />
                </View>
            </>
        );
    }

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <Loading isLoading={isSubmitting}>
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
                            ref={scrollViewRef}
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
                            >
                                <FileUploader
                                    ref={fileUploaderRef}
                                    files={files || []}
                                    onFilesSelected={handleFilesSelected}
                                    maxFiles={5}
                                />
                            </WarehouseInformation>

                            <AddWarehouseMaterial
                                materials={warehouseItems || []}
                                onUpdateMaterial={materialActions.update}
                                onAddMaterial={materialActions.add}
                                onRemoveMaterial={materialActions.remove}
                            />
                        </Animated.ScrollView>
                    </SafeInputLayoutMaterial>

                    <WarehouseFooter
                        safeBottom={safeBottom}
                        totalAmount={totalAmount}
                        onSaveDraft={handleSaveDraft}
                        onSubmit={triggerSubmitValidation}
                        disabled={isEditMode && !hasChanges}
                    />

                    <ConfirmSubmiss
                        visible={isConfirmModalVisible}
                        onClose={handleCloseConfirmModal}
                        onConfirm={handleConfirmSubmit}
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
            </Loading>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 100,
        gap: spacing.sm,
    },
});

export const ImportReceiptForm = React.memo(ImportReceiptFormComponent);
