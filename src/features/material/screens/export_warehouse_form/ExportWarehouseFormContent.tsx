import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, StatusBar, Keyboard } from 'react-native';
import { useForm, useWatch, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DocumentPickerResponse } from '@react-native-documents/picker';
import Animated from 'react-native-reanimated';

import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing } from '@/styles';
import { Zone } from '@/features/farm/types/farm.types';
import { PondData } from '@/features/farm/types/pond.types';

import { exportReceiptService } from '@/features/material/services/exportReceiptService';
import {
    ExportWarehouseFormValues,
    exportWarehouseFormSchema,
} from '@/features/material/schemas/exportWarehouseFormSchema';
import { showValidationError } from '@/features/material/utils/validationToast';
import { SubmitType } from '@/features/material/types/form-submit.types';
import { useExportMaterialActions } from '@/features/material/hooks';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { ExportWarehouseFooter } from '@/features/material/components/export_warehouse/ExportWarehouseFooter';
import { ExportWarehouseInformation } from '@/features/material/components/export_warehouse/ExportWarehouseInformation';
import {
    AddWarehouseMaterial,
    MaterialItem,
    WarehouseFormType,
} from '@/features/material/components/AddWarehouseMaterial';
import { ConfirmSubmiss } from '@/features/material/components/ConfirmSubmiss';
import { AddMaterialSkeleton } from '@/features/material/components/AddMaterialSkeleton';

import { SafeInputLayoutMaterial } from '@/shared/components/layout/SafeInputLayoutMaterial';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { FileUploaderRef } from '@/shared/components/forms/FileUploader';

export interface ExportWarehouseFormProps {
    isEditMode: boolean;
    isLoadingDetail: boolean;
    initialData?: ExportWarehouseFormValues;
    creatorName?: string;
    fileUploaderRef: React.RefObject<FileUploaderRef | null>;
    onSubmit: (data: ExportWarehouseFormValues, isDraft: boolean) => void;
    onDelete?: () => void;
    onBackPress: () => void;
    zones: Zone[];
    ponds: PondData[];
    warehouseId?: string;
    onZoneChange: (zoneId: string) => void;
    isSubmitting?: boolean;
}

const ExportWarehouseFormInner: React.FC<ExportWarehouseFormProps> = ({
    isEditMode,
    isLoadingDetail,
    initialData,
    creatorName,
    fileUploaderRef,
    onSubmit,
    onDelete,
    onBackPress,
    zones,
    ponds,
    warehouseId,
    onZoneChange,
    isSubmitting = false,
}) => {
    // ─── State ──────────────────────────────────────────────
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [settledZone, setSettledZone] = useState<string | null>(null);
    const [settledPond, setSettledPond] = useState<string | null>(null);

    const submitTypeRef = useRef<SubmitType | null>(null);
    const initializedRef = useRef(false);
    const initialSnapshotRef = useRef<string | null>(null);
    const scrollViewRef = useRef<any>(null);
    const theme = useAppTheme();
    const styles = getStyles(theme);

    // ─── Form ───────────────────────────────────────────────
    const { control, handleSubmit, reset, setValue, getValues } =
        useForm<ExportWarehouseFormValues>({
            resolver: zodResolver(exportWarehouseFormSchema),
            defaultValues: {
                date: new Date(),
                selectedZone: '',
                selectedPond: '',
                note: '',
                files: [],
                exportItems: [exportReceiptService.createDefaultExportItem()],
            },
        });

    const watchedForm = useWatch({ control });

    // ─── Material Actions ───────────────────────────────────
    const { add, remove, update } = useExportMaterialActions(control, getValues, setValue);

    // ─── Effects ────────────────────────────────────────────
    useEffect(() => {
        if (initialData && !initializedRef.current) {
            reset(initialData);
            initializedRef.current = true;
            initialSnapshotRef.current = exportReceiptService.createFormSnapshot(initialData);
        }
    }, [initialData, reset]);

    useEffect(() => {
        if (initializedRef.current && settledZone === null && isEditMode) {
            const timer = setTimeout(() => {
                const values = getValues();
                setSettledZone(values.selectedZone ?? '');
                setSettledPond(values.selectedPond ?? '');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isEditMode, initialData, settledZone, getValues]);

    // ─── Derived State ──────────────────────────────────────
    const totalAmount = useMemo(
        () => exportReceiptService.calculateTotalAmount(watchedForm.exportItems || []),
        [watchedForm.exportItems]
    );

    const {
        date: wDate,
        selectedZone: wZone,
        selectedPond: wPond,
        note: wNote,
        exportItems: wExportItems,
        files: wFiles,
    } = watchedForm;

    const hasChanges = useMemo(
        () =>
            exportReceiptService.hasFormChanges({
                isEditMode,
                initialSnapshot: initialSnapshotRef.current,
                currentForm: {
                    date: wDate,
                    selectedZone: wZone,
                    selectedPond: wPond,
                    note: wNote,
                    exportItems: wExportItems,
                    files: wFiles,
                },
                settledZone,
                settledPond,
            }),
        [isEditMode, settledZone, settledPond, wDate, wZone, wPond, wNote, wExportItems, wFiles]
    );

    // ─── Handlers ───────────────────────────────────────────
    const handleZoneChange = useCallback(
        (zoneId: string) => {
            setValue('selectedZone', zoneId, { shouldValidate: true });
            setValue('selectedPond', '', { shouldValidate: true });

            const currentItems = getValues('exportItems');
            const hasSelectedItems = currentItems?.some(item => item.materialId);
            if (hasSelectedItems) {
                setValue('exportItems', [exportReceiptService.createDefaultExportItem()]);
            }

            onZoneChange(zoneId);
        },
        [setValue, getValues, onZoneChange]
    );

    const handleDateChange = useCallback(
        (val: Date) => setValue('date', val, { shouldValidate: true }),
        [setValue]
    );

    const handlePondChange = useCallback(
        (val: string) => setValue('selectedPond', val, { shouldValidate: true }),
        [setValue]
    );

    const handleNoteChange = useCallback((val: string) => setValue('note', val), [setValue]);

    const handleFilesSelected = useCallback(
        (newFiles: DocumentPickerResponse[]) => setValue('files', newFiles),
        [setValue]
    );

    const onError = useCallback((formErrors: FieldErrors<ExportWarehouseFormValues>) => {
        const firstErrorKey = Object.keys(formErrors)[0] as
            | keyof ExportWarehouseFormValues
            | undefined;
        if (firstErrorKey) {
            const errorMsg = formErrors[firstErrorKey]?.message;
            showValidationError(errorMsg || 'Vui lòng kiểm tra lại thông tin');
        }
    }, []);

    const handleSaveDraft = useCallback(() => {
        submitTypeRef.current = SubmitType.Draft;
        handleSubmit(data => onSubmit(data, true), onError)();
    }, [handleSubmit, onSubmit, onError]);

    const triggerSubmitValidation = useMemo(
        () => handleSubmit(() => setConfirmModalVisible(true), onError),
        [handleSubmit, onError]
    );

    const handleConfirmSubmit = useCallback(() => {
        setConfirmModalVisible(false);
        submitTypeRef.current = SubmitType.Submit;
        setTimeout(() => {
            handleSubmit(data => onSubmit(data, false), onError)();
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

    const handleCloseConfirmModal = useCallback(() => setConfirmModalVisible(false), []);
    const handleCancelDeleteModal = useCallback(() => setDeleteModalVisible(false), []);

    // ─── Loading State ──────────────────────────────────────
    if (isLoadingDetail) {
        return (
            <>
                <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
                <View style={styles.container}>
                    <HeaderMeterial title="Chỉnh Sửa Phiếu Xuất Kho" onBackPress={onBackPress} />
                    <AddMaterialSkeleton />
                </View>
            </>
        );
    }

    // ─── Render ─────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <HeaderMeterial
                title={isEditMode ? 'Chỉnh Sửa Phiếu Xuất Kho' : 'Tạo Phiếu Xuất Kho'}
                onBackPress={onBackPress}
                rightComponent={
                    isEditMode && onDelete ? (
                        <DeleteButton onPress={handleDeletePress} />
                    ) : undefined
                }
            />

            <SafeInputLayoutMaterial>
                <Animated.ScrollView
                    ref={scrollViewRef}
                    scrollEventThrottle={16}
                    style={styles.contentScroll}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <ExportWarehouseInformation
                        date={watchedForm.date ?? new Date()}
                        onDateChange={handleDateChange}
                        zones={zones}
                        selectedZone={watchedForm.selectedZone ?? ''}
                        onZoneChange={handleZoneChange}
                        ponds={ponds}
                        selectedPond={watchedForm.selectedPond ?? ''}
                        onPondChange={handlePondChange}
                        isEditMode={isEditMode}
                        creatorName={creatorName}
                        note={watchedForm.note ?? ''}
                        onNoteChange={handleNoteChange}
                        files={(watchedForm.files as DocumentPickerResponse[]) || []}
                        onFilesSelected={handleFilesSelected}
                        fileUploaderRef={fileUploaderRef}
                    />

                    <AddWarehouseMaterial
                        materials={watchedForm.exportItems as MaterialItem[]}
                        onUpdateMaterial={update}
                        onAddMaterial={add}
                        onRemoveMaterial={remove}
                        title="Vật tư xuất kho"
                        isPriceDisabled={true}
                        warehouseId={warehouseId}
                        formType={WarehouseFormType.ExportWarehouse}
                    />
                </Animated.ScrollView>
            </SafeInputLayoutMaterial>

            <ExportWarehouseFooter
                totalAmount={totalAmount}
                onSaveDraft={handleSaveDraft}
                onSubmit={triggerSubmitValidation}
                disabled={isEditMode && !hasChanges}
                isSavingDraft={isSubmitting && submitTypeRef.current === SubmitType.Draft}
                isSubmitting={isSubmitting && submitTypeRef.current === SubmitType.Submit}
            />

            <ConfirmSubmiss
                visible={confirmModalVisible}
                onClose={handleCloseConfirmModal}
                onConfirm={handleConfirmSubmit}
            />

            <ConfirmationModalUI
                visible={deleteModalVisible}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDeleteModal}
                title="Xóa phiếu xuất kho"
                message="Bạn có chắc chắn muốn xóa phiếu xuất kho này không?"
                showSuccessToast={false}
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        contentScroll: {
            flex: 1,
        },
        contentContainer: {
            gap: spacing.sm,
            paddingBottom: 100,
        },
    });

export const ExportWarehouseForm = React.memo(ExportWarehouseFormInner);
