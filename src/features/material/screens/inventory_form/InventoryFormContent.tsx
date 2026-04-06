import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Animated from 'react-native-reanimated';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles';
import {
    inventoryFormSchema,
    InventoryFormValues,
} from '@/features/material/schemas/inventoryFormSchema';
import { SubmitType } from '@/features/material/types/form-submit.types';
import { showValidationError } from '@/features/material/utils/validationToast';
import { warehouseFormUtils } from '@/features/material/utils/warehouseFormUtils';
import { formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import { inventoryService } from '@/features/material/services/inventoryService';
import { useInventoryMaterialActions } from '@/features/material/hooks';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { AddMaterialSkeleton } from '@/features/material/components/AddMaterialSkeleton';
import { InventoryGeneralInfo } from '@/features/material/components/inventory/InventoryGeneralInfo';
import {
    InventoryMaterialList,
    InventoryItem,
} from '@/features/material/components/inventory/InventoryMaterialList';
import { InventoryFooter } from '@/features/material/components/inventory/InventoryFooter';
import { SafeInputLayoutMaterial } from '@/shared/components/layout/SafeInputLayoutMaterial';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';

export type InventoryFormProps = {
    isEditMode: boolean;
    isLoadingDetail: boolean;
    submitType: SubmitType | null;
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
    submitType,
    initialData,
    warehouseName,
    creatorName,
    warehouseId,
    onBackPress,
    onSubmit,
    onDelete,
}) => {
    // ─── State & Refs ──────────────────────────────────────
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const scrollViewRef = useRef<Animated.ScrollView>(null);
    const initializedRef = useRef(false);
    const initialSnapshotRef = useRef<string | null>(null);
    const theme = useAppTheme();
    const styles = getStyles(theme);

    // ─── Form ──────────────────────────────────────────────
    const { control, handleSubmit, setValue, getValues, reset } = useForm<InventoryFormValues>({
        resolver: zodResolver(inventoryFormSchema),
        defaultValues: inventoryService.createDefaultFormValues(),
    });

    const formValues = useWatch({
        control,
        name: ['date', 'note', 'inventoryItems'],
    });

    const [date, note, inventoryItems] = formValues as [Date, string, InventoryItem[]];

    const materialActions = useInventoryMaterialActions(
        control,
        getValues,
        setValue,
        [] // Material data set directly by DropdownWarehouseItem callback
    );

    // ─── Effects ───────────────────────────────────────────
    useEffect(() => {
        if (initialData && !initializedRef.current) {
            reset(inventoryService.normalizeFormValues(initialData));
            initializedRef.current = true;
            initialSnapshotRef.current = inventoryService.createSnapshot(initialData);
        }
    }, [initialData, reset]);

    // ─── Derived ───────────────────────────────────────────
    const isSavingDraft = submitType === SubmitType.Draft;
    const isSubmitting = submitType === SubmitType.Submit;

    const hasChanges = useMemo(() => {
        if (!isEditMode || !initialSnapshotRef.current) return true;
        const currentSnapshot = inventoryService.createSnapshot({ date, note, inventoryItems });
        return currentSnapshot !== initialSnapshotRef.current;
    }, [isEditMode, date, note, inventoryItems]);

    const title = isEditMode
        ? 'Chỉnh Sửa Phiếu Điều Chỉnh Tồn Kho'
        : 'Tạo Phiếu Điều Chỉnh Tồn Kho';

    // ─── Handlers ──────────────────────────────────────────
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
                <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
                <View style={styles.container}>
                    <HeaderMeterial title={title} onBackPress={onBackPress} />
                    <AddMaterialSkeleton />
                </View>
            </>
        );
    }

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
            <View style={styles.container}>
                <HeaderMeterial
                    title={title}
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

                <InventoryFooter
                    onSaveDraft={handleSaveDraft}
                    onSubmit={triggerSubmitValidation}
                    disabled={isEditMode && !hasChanges}
                    isSavingDraft={isSavingDraft}
                    isSubmitting={isSubmitting}
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
        </>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        scrollView: {
            flex: 1,
        },
        contentContainer: {
            paddingBottom: 100,
        },
    });

export const InventoryForm = React.memo(InventoryFormComponent);
