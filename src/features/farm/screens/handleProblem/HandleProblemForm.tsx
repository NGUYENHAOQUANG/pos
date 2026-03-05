import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { colors, borderRadius } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { GeneralInfoBox, GeneralInfoBoxRef } from '../../components/pondwork/GeneralInfoBox';
import { MaterialSelectionBox } from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import DeleteIcon from '@/assets/Icon/IconFarm/Delete.svg';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';

import { handleProblemSchema, HandleProblemFormValues } from '../../schemas/handleProblemSchema';
import { IMaterial } from '@/features/material/types/material.types';

export interface HandleProblemFormProps {
    isEditMode: boolean;
    isSaving: boolean;
    initialData: HandleProblemFormValues;
    materials: IMaterial[];
    title: string;
    onBack: () => void;
    onSubmit: (data: HandleProblemFormValues, documentIds: string[]) => void;
    onDelete: () => void;
}

export const HandleProblemForm = ({
    isEditMode,
    isSaving,
    initialData,
    materials,
    title,
    onBack,
    onSubmit,
    onDelete,
}: HandleProblemFormProps) => {
    const { control, handleSubmit, reset, watch } = useForm<HandleProblemFormValues>({
        resolver: zodResolver(handleProblemSchema),
        defaultValues: initialData,
    });

    const currentValues = watch();
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
            currentValues.selectedDate.getTime() !== initialData.selectedDate.getTime();
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
    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);

    const handleFormSubmit = (data: HandleProblemFormValues) => {
        let docIds: string[] = [];
        if (generalInfoBoxRef.current) {
            generalInfoBoxRef.current.markAsSaved(); // Prevent cleanup on unmount if saved
            docIds = generalInfoBoxRef.current.getUploadedIds();
        } else {
            docIds = initialData.documentIds || [];
        }
        allowNavigation();
        onSubmit(data, docIds);
    };

    const handleConfirmDelete = () => {
        setShowDeleteModal(false);
        allowNavigation();
        onDelete();
    };

    return (
        <Loading isLoading={isSaving}>
            <View style={styles.container}>
                <HeaderFarm
                    type="simple"
                    title={isEditMode ? `Chỉnh sửa ${title.toLowerCase()}` : title}
                    onBack={onBack}
                    rightAction={
                        isEditMode ? (
                            <TouchableOpacity
                                onPress={() => setShowDeleteModal(true)}
                                style={styles.headerDeleteButton}
                            >
                                <DeleteIcon width={20} height={20} color={colors.red[900]} />
                            </TouchableOpacity>
                        ) : null
                    }
                />

                <SafeInputLayout>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* 1. Thông tin chung */}
                        <Controller
                            control={control}
                            name="selectedDate"
                            render={({ field: { value, onChange } }) => (
                                <Controller
                                    control={control}
                                    name="imageUris"
                                    render={({ field: { value: images, onChange: setImages } }) => (
                                        <GeneralInfoBox
                                            ref={generalInfoBoxRef}
                                            type="withImage"
                                            date={value}
                                            onDateChange={onChange}
                                            imageUris={images || []}
                                            onImagesChange={setImages}
                                            disabledDate={true}
                                            documentIds={initialData.documentIds}
                                        />
                                    )}
                                />
                            )}
                        />

                        {/* 2. Chọn vật tư */}
                        <Controller
                            control={control}
                            name="selectedMaterials"
                            render={({ field: { value, onChange } }) => (
                                <MaterialSelectionBox
                                    selectedMaterials={value}
                                    onMaterialsChange={onChange}
                                    materials={materials}
                                />
                            )}
                        />

                        {/* 3. Ghi chú (Mô tả sự cố) */}
                        <Controller
                            control={control}
                            name="note"
                            render={({ field: { value, onChange } }) => (
                                <SelectionNotesBox notes={value || ''} onNotesChange={onChange} />
                            )}
                        />

                        <View style={styles.spacer} />
                    </ScrollView>
                </SafeInputLayout>

                <ButtonBarFarm
                    primaryTitle={isEditMode ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleSubmit(handleFormSubmit)}
                    onSecondaryPress={onBack}
                    style={{ borderTopWidth: 1, borderTopColor: colors.border }}
                    primaryDisabled={isEditMode && !hasChanges}
                />

                <ConfirmationModalUI
                    visible={showDeleteModal}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
                {UnsavedChangesModal}
            </View>
        </Loading>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundPrimary },
    scrollContent: { paddingBottom: 100 },

    headerDeleteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.red[900],
        backgroundColor: colors.white,
    },
    spacer: { height: 80 },
});
