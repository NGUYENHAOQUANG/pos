import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import Animated from 'react-native-reanimated';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { SafeInputLayoutMaterial } from '@/shared/components/layout/SafeInputLayoutMaterial';
import { colors } from '@/styles';
import { InventoryGeneralInfo } from '@/features/material/components/inventory/InventoryGeneralInfo';
import {
    InventoryMaterialList,
    InventoryItem,
} from '@/features/material/components/inventory/InventoryMaterialList';
import { formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { AddMaterialSkeleton } from '@/features/material/components/AddMaterialSkeleton';
import { Loading } from '@/shared/components/ui/Loading';

import { showValidationError } from '@/features/material/utils/validationToast';
import {
    inventoryFormSchema,
    InventoryFormValues,
} from '@/features/material/schemas/inventoryFormSchema';
import { warehouseFormUtils } from '@/features/material/utils/warehouseFormUtils';
import { useInventoryMaterialActions } from '@/features/material/hooks/logic/useInventoryMaterialActions';

export type InventoryFormProps = {
    isEditMode: boolean;
    isLoadingDetail: boolean;
    isSubmitting: boolean;
    initialData?: InventoryFormValues;
    warehouseName: string;
    creatorName: string;
    warehouseId?: string;
    onBackPress: () => void;
    onSubmit: (data: InventoryFormValues, isDraft: boolean) => void;
    onDelete?: () => void;
};

const InventoryFormComponent: React.FC<InventoryFormProps> = ({
    isEditMode,
    isLoadingDetail,
    isSubmitting,
    initialData,
    warehouseName,
    creatorName,
    warehouseId,
    onBackPress,
    onSubmit,
    onDelete,
}) => {
    const { control, handleSubmit, setValue, getValues, reset } = useForm<InventoryFormValues>({
        resolver: zodResolver(inventoryFormSchema),
        defaultValues: {
            date: new Date(),
            note: '',
            inventoryItems: [
                {
                    id: Date.now().toString(),
                    materialId: '',
                    materialName: '',
                    oldStock: 0,
                    newStock: '',
                    difference: 0,
                    unit: '',
                },
            ],
        },
    });

    const formValues = useWatch({
        control,
        name: ['date', 'note', 'inventoryItems'],
    });

    const [date, note, inventoryItems] = formValues as [Date, string, InventoryItem[]];

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const scrollViewRef = React.useRef<any>(null);
    const initializedRef = useRef(false);
    const initialSnapshotRef = useRef<string | null>(null);

    const materialActions = useInventoryMaterialActions(
        control,
        getValues,
        setValue,
        [] // Material data set directly by DropdownWarehouseItem callback
    );

    useEffect(() => {
        if (initialData && !initializedRef.current) {
            reset({
                date: initialData.date || new Date(),
                note: initialData.note || '',
                inventoryItems: initialData.inventoryItems,
            });
            initializedRef.current = true;
            // Save snapshot for change comparison
            initialSnapshotRef.current = JSON.stringify({
                date: new Date(initialData.date || new Date()).getTime(),
                note: initialData.note || '',
                inventoryItems: (initialData.inventoryItems || []).map(item => ({
                    materialId: item.materialId || '',
                    newStock: item.newStock || '',
                })),
            });
        }
    }, [initialData, reset]);

    // Track changes for edit mode disable
    const hasChanges = useMemo(() => {
        if (!isEditMode || !initialSnapshotRef.current) return true;
        const normalizeItems = (items: InventoryFormValues['inventoryItems']) =>
            (items || []).map(item => ({
                materialId: item.materialId || '',
                newStock: item.newStock || '',
            }));
        const currentSnapshot = JSON.stringify({
            date: new Date(date).getTime(),
            note: note || '',
            inventoryItems: normalizeItems(inventoryItems),
        });
        return currentSnapshot !== initialSnapshotRef.current;
    }, [isEditMode, date, note, inventoryItems]);

    const onError = useCallback(
        (errors: unknown) => warehouseFormUtils.handleFormError(errors, showValidationError),
        []
    );

    const processSubmit = useCallback(
        (data: InventoryFormValues, isDraft: boolean) => {
            onSubmit(data, isDraft);
        },
        [onSubmit]
    );

    const handleSaveDraft = useMemo(
        () => handleSubmit(data => processSubmit(data, true), onError),
        [handleSubmit, processSubmit, onError]
    );
    const triggerSubmitValidation = useMemo(
        () => handleSubmit(data => processSubmit(data, false), onError),
        [handleSubmit, processSubmit, onError]
    );

    const handleDateChange = useCallback((newDate: Date) => setValue('date', newDate), [setValue]);
    const handleNoteChange = useCallback((val: string) => setValue('note', val), [setValue]);
    const handleDeletePress = useCallback(() => setDeleteModalVisible(true), []);
    const handleConfirmDelete = useCallback(() => {
        setDeleteModalVisible(false);
        onDelete?.();
    }, [onDelete]);
    const handleCancelDelete = useCallback(() => setDeleteModalVisible(false), []);

    if (isLoadingDetail) {
        return (
            <>
                <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
                <View style={styles.container}>
                    <HeaderMeterial
                        title={
                            isEditMode
                                ? 'Chỉnh Sửa Phiếu Điều Chỉnh Tồn Kho'
                                : 'Tạo Phiếu Điều Chỉnh Tồn Kho'
                        }
                        onBackPress={onBackPress}
                    />
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
                        title={
                            isEditMode
                                ? 'Chỉnh Sửa Phiếu Điều Chỉnh Tồn Kho'
                                : 'Tạo Phiếu Điều Chỉnh Tồn Kho'
                        }
                        onBackPress={onBackPress}
                        rightComponent={
                            isEditMode ? <DeleteButton onPress={handleDeletePress} /> : undefined
                        }
                    />

                    <SafeInputLayoutMaterial>
                        <Animated.ScrollView
                            ref={scrollViewRef}
                            scrollEventThrottle={16}
                            style={styles.scrollView}
                            contentContainerStyle={styles.contentContainer}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <InventoryGeneralInfo
                                date={date}
                                createdDate={formatMaterialDateTime(date)}
                                note={note}
                                onDateChange={handleDateChange}
                                onNoteChange={handleNoteChange}
                                warehouseName={warehouseName}
                                creatorName={creatorName}
                            />

                            <InventoryMaterialList
                                items={inventoryItems}
                                onUpdateItem={materialActions.update}
                                onAddItem={materialActions.add}
                                onRemoveItem={materialActions.remove}
                                warehouseId={warehouseId}
                            />
                        </Animated.ScrollView>
                    </SafeInputLayoutMaterial>

                    <ButtonBarMaterial
                        mode="double"
                        primaryTitle="Gửi Phiếu"
                        secondaryTitle="Lưu Nháp"
                        onPrimaryPress={triggerSubmitValidation}
                        onSecondaryPress={handleSaveDraft}
                        // primaryButtonDisabled={isEditMode && !hasChanges}
                        secondaryButtonDisabled={isEditMode && !hasChanges}
                        containerStyle={{
                            borderTopWidth: 1,
                            borderTopColor: colors.gray[200],
                        }}
                    />

                    <ConfirmationModalUI
                        visible={deleteModalVisible}
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCancelDelete}
                        title="Xóa phiếu kiểm kho"
                        message="Bạn có chắc chắn muốn xóa phiếu kiểm kho này không?"
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
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 100,
    },
});

export const InventoryForm = React.memo(InventoryFormComponent);
