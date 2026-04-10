import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { GeneralInfoBox, GeneralInfoBoxType } from '../../components/pondwork/GeneralInfoBox';
import {
    MaterialSelectionBox,
    SelectedMaterialItem,
} from '@/features/farm/components/bottom-sheet/MaterialSelectionBox';
import { SpecificType } from '@/features/material/types/warehouse.types';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { AppToast } from '@/features/farm/utils/toastMessages';

import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { useSyncDocuments } from '@/shared/hooks/useDocumentUpload';

import { handleProblemSchema, HandleProblemFormValues } from '../../schemas/handleProblemSchema';

export interface HandleProblemFormProps {
    isEditMode: boolean;
    isSaving: boolean;
    initialData: HandleProblemFormValues;
    title: string;
    onBack: () => void;
    onSubmit: (
        data: HandleProblemFormValues,
        documentIds: string[],
        markUploadsAsSaved: () => void
    ) => void;
    onDelete: () => void;
    /** Whether material selection is required. Default: true */
    isMaterialRequired?: boolean;
}

export const HandleProblemForm = ({
    isEditMode,
    isSaving,
    initialData,
    title,
    onBack,
    onSubmit,
    onDelete,
    isMaterialRequired = true,
}: HandleProblemFormProps) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const { control, handleSubmit, reset, setValue } = useForm<HandleProblemFormValues>({
        resolver: zodResolver(handleProblemSchema),
        defaultValues: initialData,
    });

    const [isUploading, setIsUploading] = useState(false);
    const { uploadAndSyncDocuments, markUploadsAsSaved } = useSyncDocuments();

    // ── useWatch — reactive form values ─────────────────────────────
    const currentValues = useWatch({
        control,
    });
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            reset(initialData);
            setIsInitialized(true);
        }
    }, [initialData, isInitialized, reset]);

    const hasChanges = useMemo(() => {
        if (!isInitialized) return false;
        if (!isEditMode) {
            return !!(
                (currentValues.note && currentValues.note.length > 0) ||
                (currentValues.selectedMaterials && currentValues.selectedMaterials.length > 0) ||
                (currentValues.imageUris && currentValues.imageUris.length > 0)
            );
        }

        const dateChanged =
            currentValues.selectedDate?.getTime() !== initialData.selectedDate.getTime();
        const noteChanged = currentValues.note !== initialData.note;
        const materialsChanged =
            JSON.stringify(currentValues.selectedMaterials) !==
            JSON.stringify(initialData.selectedMaterials);
        const imagesChanged =
            JSON.stringify(currentValues.imageUris) !== JSON.stringify(initialData.imageUris);

        return !!(dateChanged || noteChanged || materialsChanged || imagesChanged);
    }, [currentValues, initialData, isInitialized, isEditMode]);

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasChanges);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleFormSubmit = async (data: HandleProblemFormValues) => {
        setIsUploading(true);
        try {
            const finalDocIds = await uploadAndSyncDocuments(
                data.imageUris || [],
                initialData.imageUris || [],
                initialData.documentIds || []
            );

            allowNavigation();
            onSubmit(data, finalDocIds, markUploadsAsSaved);
        } catch (error) {
            console.error('Failed to upload handling problem documents', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFormError = () => {
        AppToast({
            type: 'error',
            text1: 'Vui lòng kiểm tra đầy đủ thông tin',
        });
    };

    const handleConfirmDelete = () => {
        setShowDeleteModal(false);
        allowNavigation();
        setTimeout(() => {
            onDelete();
        }, 300);
    };

    return (
        <View style={styles.container}>
            <HeaderSection
                title={title}
                onBack={onBack}
                backButtonDisabled={isSaving || isUploading}
                rightComponent={
                    isEditMode ? (
                        <DeleteButton onPress={() => setShowDeleteModal(true)} />
                    ) : undefined
                }
            />

            <SafeInputLayout>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View pointerEvents={isSaving || isUploading ? 'none' : 'auto'}>
                        {/* 1. Thông tin chung */}
                        <GeneralInfoBox
                            type={GeneralInfoBoxType.WITH_IMAGE}
                            date={currentValues.selectedDate || new Date()}
                            onDateChange={val =>
                                setValue('selectedDate', val, { shouldDirty: true })
                            }
                            imageUris={currentValues.imageUris || []}
                            onImagesChange={val =>
                                setValue('imageUris', val, { shouldDirty: true })
                            }
                            disabledDate={true}
                        />

                        {/* 2. Chọn vật tư */}
                        <MaterialSelectionBox
                            selectedMaterials={
                                (currentValues.selectedMaterials as SelectedMaterialItem[]) || []
                            }
                            onMaterialsChange={val =>
                                setValue('selectedMaterials', val as any, { shouldDirty: true })
                            }
                            specificType={SpecificType.Normal}
                            isRequired={isMaterialRequired}
                        />

                        {/* 3. Ghi chú (Mô tả sự cố) */}
                        <SelectionNotesBox
                            notes={currentValues.note || ''}
                            onNotesChange={val => setValue('note', val, { shouldDirty: true })}
                        />

                        <View style={styles.spacer} />
                    </View>
                </ScrollView>
            </SafeInputLayout>

            <ButtonBarFarm
                primaryTitle={isEditMode ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSubmit(handleFormSubmit, handleFormError)}
                onSecondaryPress={onBack}
                isLoading={isSaving || isUploading}
                secondaryDisabled={isSaving || isUploading}
                primaryDisabled={isSaving || isUploading || (isEditMode && !hasChanges)}
                style={{
                    borderTopWidth: 1,
                    borderTopColor: theme.defaultBorder,
                    backgroundColor: theme.background,
                }}
            />

            <ConfirmationModalUI
                visible={showDeleteModal}
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
            {UnsavedChangesModal}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.backgroundPrimary },
        scrollContent: { paddingBottom: 100 },
        spacer: { height: 80 },
    });
