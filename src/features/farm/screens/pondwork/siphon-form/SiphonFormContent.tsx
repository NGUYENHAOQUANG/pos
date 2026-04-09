import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GeneralInfoBoxRef } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectedMaterialItem } from '@/features/farm/components/bottom-sheet/MaterialSelectionBox';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { EnvSkeleton } from '@/features/farm/components/skeleton/EnvSkeleton';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
    showMaterialQuantityZeroToast,
} from '@/features/farm/utils/toastMessages';
import { siphonFormService } from '@/features/farm/services/pond-work/siphon.service';
import { siphonFormSchema, SiphonFormValues } from '@/features/farm/schemas/siphonFormSchema';
import { SiphonFormInformation } from '@/features/farm/components/pondwork/xyphon/SiphonFormInformation';

interface SiphonFormContentProps {
    isEditing: boolean;
    isLoadingDetail: boolean;
    isSaving: boolean;
    initialValues: SiphonFormValues;
    initialSnapshot: string | null;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    onSave: (payload: any, documentIds: string[]) => Promise<void>;
    onDelete: () => Promise<void>;
    onBack: () => void;
}

export const SiphonFormContent: React.FC<SiphonFormContentProps> = ({
    isEditing,
    isLoadingDetail,
    isSaving,
    initialValues,
    initialSnapshot,
    selectedDate,
    onDateChange,
    onSave,
    onDelete,
    onBack,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // ── useForm + zodResolver ───────────────────────────────────────
    const { control, handleSubmit, setValue, reset } = useForm<SiphonFormValues>({
        resolver: zodResolver(siphonFormSchema),
        defaultValues: initialValues,
    });

    // Sync when initialValues change (detail loaded from API)
    React.useEffect(() => {
        reset(initialValues);
    }, [initialValues, reset]);

    // ── useWatch — reactive form values ─────────────────────────────
    const formValues = useWatch({
        control,
        name: ['lossAmount', 'notes', 'imageUris', 'documentIds', 'selectedMaterials'],
    });

    const [lossAmount, notes, imageUris, documentIds, selectedMaterials] = formValues as [
        string,
        string,
        string[],
        string[],
        SelectedMaterialItem[]
    ];

    // ── Change detection ────────────────────────────────────────────
    const currentFormValues: SiphonFormValues = useMemo(
        () => ({ lossAmount, notes, imageUris, documentIds, selectedMaterials }),
        [lossAmount, notes, imageUris, documentIds, selectedMaterials]
    );

    const hasUnsavedChanges = useMemo(
        () => siphonFormService.hasChanges(currentFormValues, initialSnapshot),
        [currentFormValues, initialSnapshot]
    );

    const isButtonDisabled = isEditing && !hasUnsavedChanges;

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasUnsavedChanges);

    // ── Handlers ────────────────────────────────────────────────────
    const onSubmit = useCallback(
        async (data: SiphonFormValues) => {
            if (
                siphonFormService.hasMaterialWithZeroQuantity(
                    data.selectedMaterials as SelectedMaterialItem[]
                )
            ) {
                showMaterialQuantityZeroToast();
                return;
            }

            const uploadedIds = generalInfoBoxRef.current?.getUploadedIds() || [];
            const payload = siphonFormService.mapFormToPayload(data, uploadedIds);

            allowNavigation();
            await onSave(payload, uploadedIds);
            generalInfoBoxRef.current?.markAsSaved();

            if (isEditing) {
                showEditJobSuccessToast('SIPHON');
            } else {
                showAddJobSuccessToast('SIPHON');
            }
            onBack();
        },
        [isEditing, allowNavigation, onSave, onBack]
    );

    const handleDeletePress = useCallback(() => setDeleteModalVisible(true), []);

    const handleConfirmDelete = useCallback(async () => {
        allowNavigation();
        await onDelete();
        setDeleteModalVisible(false);
        Toast.show({ type: 'success', text1: 'Xóa thành công' });
        setTimeout(() => onBack(), 300);
    }, [allowNavigation, onDelete, onBack]);

    const handleCancelDelete = useCallback(() => setDeleteModalVisible(false), []);

    const handleCancel = useCallback(() => onBack(), [onBack]);

    // ── Field change handlers (setValue) ─────────────────────────────
    const handleLossAmountChange = useCallback(
        (val: string) => setValue('lossAmount', val, { shouldDirty: true }),
        [setValue]
    );
    const handleNotesChange = useCallback(
        (val: string) => setValue('notes', val, { shouldDirty: true }),
        [setValue]
    );
    const handleImagesChange = useCallback(
        (uris: string[]) => setValue('imageUris', uris, { shouldDirty: true }),
        [setValue]
    );
    const handleMaterialsChange = useCallback(
        (mats: SelectedMaterialItem[]) =>
            setValue('selectedMaterials', mats as any, { shouldDirty: true }),
        [setValue]
    );

    // ── Render ──────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <HeaderSection
                title="Xi-phông"
                onBack={onBack}
                backButtonDisabled={isSaving}
                rightComponent={
                    isEditing ? <DeleteButton onPress={handleDeletePress} /> : undefined
                }
            />

            {isLoadingDetail ? (
                <EnvSkeleton />
            ) : (
                <SiphonFormInformation
                    generalInfoBoxRef={generalInfoBoxRef}
                    selectedDate={selectedDate}
                    onDateChange={onDateChange}
                    imageUris={imageUris}
                    onImagesChange={handleImagesChange}
                    documentIds={documentIds}
                    lossAmount={lossAmount}
                    onLossAmountChange={handleLossAmountChange}
                    selectedMaterials={selectedMaterials}
                    onMaterialsChange={handleMaterialsChange}
                    notes={notes}
                    onNotesChange={handleNotesChange}
                />
            )}

            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle={isEditing ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleSubmit(onSubmit)}
                    onSecondaryPress={handleCancel}
                    isLoading={isSaving}
                    secondaryDisabled={isSaving}
                    primaryDisabled={isSaving || isButtonDisabled}
                />
            </View>

            <ConfirmationModalUI
                visible={deleteModalVisible}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
            {UnsavedChangesModal}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        footer: {
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
        },
    });
