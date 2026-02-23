import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { DocumentPickerResponse } from '@react-native-documents/picker';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { WarehouseInformation } from '@/features/material/components/warehouse/WarehouseInformation';
import {
    AddWarehouseMaterial,
    MaterialItem,
} from '@/features/material/components/warehouse/AddWarehouseMaterial';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { colors, spacing, borderRadius } from '@/styles';
import { ConfirmSubmiss } from '@/features/material/components/warehouse/ConfirmSubmiss';
import { WarehouseFooter } from '@/features/material/components/warehouse/WarehouseFooter';
import { FileUploader, FileUploaderRef } from '@/shared/components/forms/FileUploader';
import { IconTrashOutlined } from '@/assets/icons';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { AddMaterialSkeleton } from '@/features/material/components/AddMaterialSkeleton';

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
import { warehouseFormUtils } from '@/features/material/utils/warehouseFormUtils';
import {
    warehouseFormSchema,
    WarehouseFormValues,
} from '@/features/material/schemas/warehouseFormSchema';
import { useWarehouseMaterialActions } from '@/features/material/hooks/logic/useWarehouseMaterialActions';

export const AddWarehouseScreen: React.FC = () => {
    // Navigation
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<AppStackParamList, 'AddWarehouse'>>();

    // params can be undefined
    const importReceiptId = route.params?.importReceiptId;
    const isEditMode = !!importReceiptId;

    // Stores & Hook Context
    const { setTabBarVisible } = useTabBarVisibility();
    const insets = useSafeAreaInsets();
    const safeBottom = Math.max(insets.bottom, 12);
    const queryClient = useQueryClient();
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

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

    // Form setup
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

    // UI Refs
    const fileUploaderRef = useRef<FileUploaderRef>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const initializedRef = useRef(false);

    const totalAmount = useMemo(
        () => warehouseFormUtils.calculateTotal(warehouseItems || []),
        [warehouseItems]
    );

    // Mutations
    const { submitWithFiles, isUploading } = useFileSubmit();
    const { mutate: createImportReceipt, isPending: isCreating } = useCreateImportReceipt();
    const { mutate: updateImportReceipt, isPending: isUpdating } = useUpdateImportReceipt();
    const { mutate: deleteImportReceipt, isPending: isDeleting } = useDeleteImportReceipt();

    const materialActions = useWarehouseMaterialActions(
        control,
        getValues,
        setValue,
        availableMaterials
    );

    const handleDropdownOpen = (itemIndex: number) => {
        const HEADER_HEIGHT = 280;
        const FILE_ROW_HEIGHT = 40;
        const ITEM_HEIGHT = 280;

        setTimeout(() => {
            const fileSectionHeight = (files?.length || 0) * FILE_ROW_HEIGHT;
            const scrollY = HEADER_HEIGHT + fileSectionHeight + itemIndex * ITEM_HEIGHT;
            scrollViewRef.current?.scrollTo({
                y: Math.max(0, scrollY - 50),
                animated: true,
            });
        }, 100);
    };

    // Effects
    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // Populate Form Data for Edit Mode
    useEffect(() => {
        if (
            isEditMode &&
            importReceiptDetail &&
            importReceiptItems &&
            !initializedRef.current &&
            suppliers.length > 0
        ) {
            const formState = importReceiptService.mapDetailToForm(importReceiptDetail, suppliers);
            const itemsData = importReceiptItems.items || [];
            const mappedItems = importReceiptService.mapItemsToForm(itemsData);

            reset({
                date: formState.date,
                supplier: formState.supplier,
                files: [], // Files hande via form state
                warehouseItems:
                    mappedItems.length > 0
                        ? mappedItems
                        : [
                              {
                                  id: Date.now().toString(),
                                  materialId: '',
                                  materialName: '',
                                  quantity: '',
                                  price: '',
                              },
                          ],
            });

            initializedRef.current = true;
        }
    }, [isEditMode, importReceiptDetail, importReceiptItems, suppliers, reset]);

    const onError = (errors: any) =>
        warehouseFormUtils.handleFormError(errors, showValidationError);

    const onSubmit = async (data: WarehouseFormValues, isDraft: boolean) => {
        const selectedSupplier = suppliers.find(s => s.name === data.supplier);
        if (!selectedSupplier) {
            showValidationError('Vui lòng chọn nhà cung cấp hợp lệ');
            return;
        }

        await submitWithFiles(data.files || [], async documentIds => {
            const payload = importReceiptService.mapFormToPayload(
                selectedSupplier.id,
                warehouses[0]?.id || '',
                data.warehouseItems as MaterialItem[],
                isDraft,
                documentIds
            );

            if (isEditMode && importReceiptId) {
                updateImportReceipt(
                    { id: importReceiptId, data: payload },
                    {
                        onSuccess: () => {
                            fileUploaderRef.current?.markAsSaved();
                            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
                            queryClient.invalidateQueries({ queryKey: importReceiptKeys.lists() });
                            queryClient.invalidateQueries({
                                queryKey: ['importReceipts', 'items', importReceiptId!],
                            });
                            queryClient.invalidateQueries({
                                queryKey: importReceiptKeys.detail(importReceiptId!),
                            });
                            navigation.goBack();
                        },
                    }
                );
            } else {
                createImportReceipt(payload, {
                    onSuccess: () => {
                        fileUploaderRef.current?.markAsSaved();
                        queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
                        queryClient.invalidateQueries({ queryKey: importReceiptKeys.lists() });
                        navigation.goBack();
                    },
                });
            }
        });
    };

    const handleConfirmSubmit = () => {
        setIsConfirmModalVisible(false);
        setTimeout(() => {
            handleSubmit(data => onSubmit(data, false), onError)();
        }, 500);
    };

    const handleDeletePress = () => {
        Keyboard.dismiss();
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (!importReceiptId) return;
        setDeleteModalVisible(false);
        deleteImportReceipt(importReceiptId, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: importReceiptKeys.lists() });
                queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
                navigation.goBack();
            },
        });
    };

    const handleSaveDraft = handleSubmit(data => onSubmit(data, true), onError);
    const triggerSubmitValidation = handleSubmit(() => setIsConfirmModalVisible(true), onError);

    if (isLoadingDetail) {
        return (
            <>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <View style={styles.container}>
                    <HeaderMeterial
                        title="Chỉnh Sửa Phiếu Nhập Kho"
                        onBackPress={() => navigation.goBack()}
                    />
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

    const isLoading = isCreating || isUpdating || isUploading || isDeleting;

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <Loading isLoading={isLoading}>
                <View style={styles.container}>
                    <HeaderMeterial
                        title={isEditMode ? 'Chỉnh Sửa Phiếu Nhập Kho' : 'Tạo Phiếu Nhập Kho'}
                        onBackPress={() => navigation.goBack()}
                        rightComponent={deleteButton}
                    />

                    <SafeInputLayout>
                        <ScrollView
                            ref={scrollViewRef}
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
                                onSupplierChange={newSupplier => setValue('supplier', newSupplier)}
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
                        </ScrollView>
                    </SafeInputLayout>

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
