import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Keyboard } from 'react-native';
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
import { colors, spacing, borderRadius } from '@/styles';
import { ConfirmSubmiss } from '@/features/material/components/ConfirmSubmiss';
import { WarehouseFooter } from '@/features/material/components/import_receipt_form/WarehouseFooter';
import { FileUploader, FileUploaderRef } from '@/shared/components/forms/FileUploader';
import { IconTrashOutlined } from '@/assets/icons';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { AddMaterialSkeleton } from '@/features/material/components/AddMaterialSkeleton';

import { showValidationError } from '@/features/material/utils/validationToast';
import { warehouseFormUtils } from '@/features/material/utils/warehouseFormUtils';
import {
    warehouseFormSchema,
    WarehouseFormValues,
} from '@/features/material/schemas/warehouseFormSchema';
import { useWarehouseMaterialActions } from '@/features/material/hooks/logic/useWarehouseMaterialActions';
import { ImportReceiptStatus } from '@/features/material/types/importReceipt.types';
import { useDropdownScroll, DropdownScrollContext } from '@/features/material/hooks';
import { SafeInputLayoutMaterial } from '@/shared/components/layout/SafeInputLayoutMaterial';

export type AddImportReceiptUIProps = {
    isEditMode: boolean;
    isLoadingDetail: boolean;
    isSubmitting: boolean;
    initialData?: {
        date: Date;
        supplier: string;
        warehouseItems: MaterialItem[];
    };
    supplierOptions: { label: string; value: string }[];
    materialOptions: any[];
    availableMaterials: any[];
    onBackPress: () => void;
    onSubmit: (
        data: WarehouseFormValues,
        status: ImportReceiptStatus,
        onSuccess: () => void
    ) => void;
    onDelete?: () => void;
};

const ImportReceiptForm: React.FC<AddImportReceiptUIProps> = ({
    isEditMode,
    isLoadingDetail,
    isSubmitting,
    initialData,
    supplierOptions,
    materialOptions,
    availableMaterials,
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
    const {
        scrollRef: scrollViewRef,
        scrollToDropdown,
        scrollOffset,
        onScroll,
    } = useDropdownScroll();
    const initializedRef = useRef(false);

    const totalAmount = useMemo(
        () => warehouseFormUtils.calculateTotal(warehouseItems || []),
        [warehouseItems]
    );

    const materialActions = useWarehouseMaterialActions(
        control,
        getValues,
        setValue,
        availableMaterials
    );

    const handleDropdownOpen = (itemIndex: number) => {
        scrollToDropdown({
            index: itemIndex,
            headerHeight: 280,
            itemHeight: 280,
            fileCount: files?.length || 0,
            fileRowHeight: 40,
        });
    };

    useEffect(() => {
        if (isEditMode && initialData && !initializedRef.current && supplierOptions.length > 0) {
            reset({
                date: initialData.date,
                supplier: initialData.supplier,
                files: [],
                warehouseItems: initialData.warehouseItems,
            });
            initializedRef.current = true;
        }
    }, [isEditMode, initialData, supplierOptions, reset]);

    const onError = useCallback(
        (errors: any) => warehouseFormUtils.handleFormError(errors, showValidationError),
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

    const deleteButton = isEditMode ? (
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeletePress}
            activeOpacity={0.7}
        >
            <IconTrashOutlined width={20} height={20} />
        </TouchableOpacity>
    ) : null;

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <Loading isLoading={isSubmitting}>
                <View style={styles.container}>
                    <HeaderMeterial
                        title={isEditMode ? 'Chỉnh Sửa Phiếu Nhập Kho' : 'Tạo Phiếu Nhập Kho'}
                        onBackPress={onBackPress}
                        rightComponent={deleteButton}
                    />

                    <SafeInputLayoutMaterial>
                        <DropdownScrollContext.Provider value={scrollOffset}>
                            <Animated.ScrollView
                                ref={scrollViewRef}
                                onScroll={onScroll}
                                scrollEventThrottle={16}
                                style={styles.content}
                                contentContainerStyle={styles.contentContainer}
                                showsVerticalScrollIndicator={false}
                                nestedScrollEnabled={true}
                                keyboardShouldPersistTaps="handled"
                            >
                                <WarehouseInformation
                                    date={date}
                                    onDateChange={newDate => setValue('date', newDate)}
                                    supplier={supplier}
                                    onSupplierChange={newSupplier =>
                                        setValue('supplier', newSupplier)
                                    }
                                    supplierOptions={supplierOptions}
                                >
                                    <FileUploader
                                        ref={fileUploaderRef}
                                        files={files || []}
                                        onFilesSelected={newFiles => setValue('files', newFiles)}
                                        maxFiles={5}
                                    />
                                </WarehouseInformation>

                                <AddWarehouseMaterial
                                    materials={warehouseItems || []}
                                    onUpdateMaterial={materialActions.update}
                                    onAddMaterial={materialActions.add}
                                    onRemoveMaterial={materialActions.remove}
                                    materialOptions={materialOptions}
                                    onDropdownOpen={handleDropdownOpen}
                                />
                            </Animated.ScrollView>
                        </DropdownScrollContext.Provider>
                    </SafeInputLayoutMaterial>

                    <WarehouseFooter
                        safeBottom={safeBottom}
                        totalAmount={totalAmount}
                        onSaveDraft={handleSaveDraft}
                        onSubmit={triggerSubmitValidation}
                    />

                    <ConfirmSubmiss
                        visible={isConfirmModalVisible}
                        onClose={() => setIsConfirmModalVisible(false)}
                        onConfirm={handleConfirmSubmit}
                    />

                    <ConfirmationDeleteModal
                        visible={deleteModalVisible}
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setDeleteModalVisible(false)}
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
        backgroundColor: '#F0F5FF',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        marginTop: spacing.sm,
        paddingBottom: 100,
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error,
    },
});

export default React.memo(ImportReceiptForm);
