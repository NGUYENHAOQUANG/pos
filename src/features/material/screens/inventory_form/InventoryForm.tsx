import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import Animated from 'react-native-reanimated';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { SafeInputLayoutMaterial } from '@/shared/components/layout/SafeInputLayoutMaterial';
import { colors, spacing } from '@/styles';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';
import { InventoryGeneralInfo } from '@/features/material/components/inventory/InventoryGeneralInfo';
import {
    InventoryMaterialList,
    InventoryItem,
} from '@/features/material/components/inventory/InventoryMaterialList';
import { formatMaterialDate, formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import { IconTrashOutlined } from '@/assets/icons';
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
import { useDropdownScroll, DropdownScrollContext } from '@/features/material/hooks';

export type InventoryFormProps = {
    isEditMode: boolean;
    isLoadingDetail: boolean;
    isSubmitting: boolean;
    initialData?: InventoryFormValues;
    warehouseName: string;
    creatorName: string;
    materialOptions: any[];
    availableMaterials: any[];
    onBackPress: () => void;
    onSubmit: (data: InventoryFormValues, isDraft: boolean) => void;
    onDelete?: () => void;
};

export const InventoryForm: React.FC<InventoryFormProps> = ({
    isEditMode,
    isLoadingDetail,
    isSubmitting,
    initialData,
    warehouseName,
    creatorName,
    materialOptions,
    availableMaterials,
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

    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const {
        scrollRef: scrollViewRef,
        scrollToDropdown,
        scrollOffset,
        onScroll,
    } = useDropdownScroll();
    const initializedRef = useRef(false);

    const materialActions = useInventoryMaterialActions(
        control,
        getValues,
        setValue,
        availableMaterials
    );

    const handleDropdownOpen = (itemIndex: number) => {
        scrollToDropdown({
            index: itemIndex,
            headerHeight: 300,
            itemHeight: 400,
        });
    };

    useEffect(() => {
        if (initialData && !initializedRef.current) {
            reset({
                date: initialData.date || new Date(),
                note: initialData.note || '',
                inventoryItems: initialData.inventoryItems,
            });
            initializedRef.current = true;
        }
    }, [initialData, reset]);

    const onError = useCallback(
        (errors: any) => warehouseFormUtils.handleFormError(errors, showValidationError),
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
                        rightIcon={
                            isEditMode ? (
                                <IconTrashOutlined width={20} height={20} color={colors.text} />
                            ) : undefined
                        }
                        onRightPress={isEditMode ? () => setDeleteModalVisible(true) : undefined}
                    />

                    <SafeInputLayoutMaterial>
                        <DropdownScrollContext.Provider value={scrollOffset}>
                            <Animated.ScrollView
                                ref={scrollViewRef}
                                onScroll={onScroll}
                                scrollEventThrottle={16}
                                style={styles.scrollView}
                                contentContainerStyle={styles.contentContainer}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <InventoryGeneralInfo
                                    date={formatMaterialDate(date)}
                                    createdDate={formatMaterialDateTime(date)}
                                    note={note}
                                    onDatePress={() => setDatePickerVisible(true)}
                                    onNoteChange={val => setValue('note', val)}
                                    warehouseName={warehouseName}
                                    creatorName={creatorName}
                                />

                                <View style={styles.dropdownSection}>
                                    <InventoryMaterialList
                                        items={inventoryItems}
                                        onUpdateItem={materialActions.update}
                                        onAddItem={materialActions.add}
                                        onRemoveItem={materialActions.remove}
                                        materialOptions={materialOptions}
                                        onDropdownOpen={handleDropdownOpen}
                                    />
                                </View>
                            </Animated.ScrollView>
                        </DropdownScrollContext.Provider>
                    </SafeInputLayoutMaterial>

                    <ButtonBarMaterial
                        mode="double"
                        primaryTitle="Gửi Phiếu"
                        secondaryTitle="Lưu Nháp"
                        onPrimaryPress={triggerSubmitValidation}
                        onSecondaryPress={handleSaveDraft}
                        containerStyle={{
                            borderTopWidth: 1,
                            borderTopColor: colors.gray[200],
                        }}
                    />

                    <DatePickerModal
                        visible={isDatePickerVisible}
                        onClose={() => setDatePickerVisible(false)}
                        date={date}
                        onSelectDate={newDate => {
                            setValue('date', newDate);
                            setDatePickerVisible(false);
                        }}
                    />

                    <ConfirmationModalUI
                        visible={deleteModalVisible}
                        onConfirm={() => {
                            setDeleteModalVisible(false);
                            onDelete?.();
                        }}
                        onCancel={() => setDeleteModalVisible(false)}
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
        paddingVertical: spacing.md,
        paddingBottom: 100,
    },
    dropdownSection: {
        zIndex: 100,
        ...Platform.select({
            android: { elevation: 5 },
            ios: { zIndex: 100 },
        }),
    },
});

export default React.memo(InventoryForm);
