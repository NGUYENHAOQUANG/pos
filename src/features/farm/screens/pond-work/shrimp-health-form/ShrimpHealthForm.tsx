import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    GeneralInfoBox,
    GeneralInfoBoxType,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { ShrimpInspectionFoodCheckBox } from '@/features/farm/components/pondwork/shrimp-inspection/ShrimpInspectionFoodCheckBox';
import {
    ShrimpInspectionObservationBox,
    AIHealthCheckResult,
} from '@/features/farm/components/pondwork/shrimp-inspection/ShrimpInspectionObservationBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { EnvSkeleton } from '@/features/farm/components/skeleton/EnvSkeleton';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { AppToast } from '@/features/farm/utils/toastMessages';

import {
    shrimpInspectionSchema,
    LeftoverFoodEnum,
    IntestineStatusEnum,
    IntestineColorEnum,
    StoolColorEnum,
    LiverStatusEnum,
} from '@/features/farm/schemas/shrimpInspectionSchema';
import {
    shrimpHealthService,
    ShrimpHealthFormState,
} from '@/features/farm/services/pond-work/shrimp-health.service';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { useSyncDocuments } from '@/shared/hooks/useDocumentUpload';

interface ShrimpHealthFormProps {
    isEditMode: boolean;
    initialData: ShrimpHealthFormState;
    documentIds: string[];
    aiResult: AIHealthCheckResult | null;
    isSaving: boolean;
    isLoadingDetail?: boolean;
    isDeleteModalVisible: boolean;
    onBack: () => void;
    onDeletePress: () => void;
    onConfirmDelete: () => void;
    onCancelDelete: () => void;
    onAICheckPress: () => void;
    onSubmit: (
        data: ShrimpHealthFormState,
        documentIds: string[],
        markUploadsAsSaved: () => void
    ) => void;
}

export const ShrimpHealthForm: React.FC<ShrimpHealthFormProps> = ({
    isEditMode,
    initialData,
    documentIds,
    aiResult,
    isSaving,
    isLoadingDetail,
    isDeleteModalVisible,
    onBack,
    onDeletePress,
    onConfirmDelete,
    onCancelDelete,
    onAICheckPress,
    onSubmit,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const { uploadAndSyncDocuments, markUploadsAsSaved } = useSyncDocuments();

    const initialSnapshot = useMemo(
        () => (isEditMode ? shrimpHealthService.createSnapshot(initialData) : null),
        [initialData, isEditMode]
    );

    const { control, handleSubmit, reset, setValue } = useForm<ShrimpHealthFormState>({
        resolver: zodResolver(shrimpInspectionSchema),
        defaultValues: initialData,
    });

    useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);

    const {
        date: selectedDate,
        foodAmount,
        leftoverFood,
        intestine,
        intestineColor,
        stoolColor,
        liver,
        notes,
        images,
        averageInfectionRate,
        isHealthy,
        diagnosisDetails,
        aiItems,
    } = useWatch({ control }) as ShrimpHealthFormState;

    const currentFormValues = useMemo<ShrimpHealthFormState>(
        () => ({
            date: selectedDate,
            foodAmount,
            leftoverFood,
            intestine,
            intestineColor,
            stoolColor,
            liver,
            notes,
            images,
            averageInfectionRate,
            isHealthy,
            diagnosisDetails,
            aiItems,
        }),
        [
            selectedDate,
            foodAmount,
            leftoverFood,
            intestine,
            intestineColor,
            stoolColor,
            liver,
            notes,
            images,
            averageInfectionRate,
            isHealthy,
            diagnosisDetails,
            aiItems,
        ]
    );

    const hasChanges = useMemo(
        () => shrimpHealthService.hasChanges(currentFormValues, initialSnapshot),
        [currentFormValues, initialSnapshot]
    );

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasChanges);

    const isFormComplete = isEditMode ? true : (foodAmount || '').trim().length > 0;
    const isButtonDisabled = !isFormComplete || (isEditMode && !hasChanges);

    // ── Field change handlers (setValue) ─────────────────────────────
    const handleDateChange = useCallback(
        (date: Date) => setValue('date', date, { shouldDirty: true }),
        [setValue]
    );
    const handleImagesChange = useCallback(
        (uris: string[]) => setValue('images', uris, { shouldDirty: true }),
        [setValue]
    );
    const handleFoodAmountChange = useCallback(
        (val: string) => setValue('foodAmount', val, { shouldDirty: true }),
        [setValue]
    );
    const handleLeftoverFoodChange = useCallback(
        (val: string) => setValue('leftoverFood', val as LeftoverFoodEnum, { shouldDirty: true }),
        [setValue]
    );
    const handleIntestineChange = useCallback(
        (val: string) => setValue('intestine', val as IntestineStatusEnum, { shouldDirty: true }),
        [setValue]
    );
    const handleIntestineColorChange = useCallback(
        (val: string) =>
            setValue('intestineColor', val as IntestineColorEnum, { shouldDirty: true }),
        [setValue]
    );
    const handleStoolColorChange = useCallback(
        (val: string) => setValue('stoolColor', val as StoolColorEnum, { shouldDirty: true }),
        [setValue]
    );
    const handleLiverChange = useCallback(
        (val: string) => setValue('liver', val as LiverStatusEnum, { shouldDirty: true }),
        [setValue]
    );
    const handleNotesChange = useCallback(
        (val: string) => setValue('notes', val, { shouldDirty: true }),
        [setValue]
    );

    const handleFormSubmit = async (data: ShrimpHealthFormState) => {
        setIsUploading(true);
        try {
            const finalDocIds = await uploadAndSyncDocuments(
                data.images || [],
                initialData?.images || [],
                documentIds || []
            );

            allowNavigation();
            onSubmit(data, finalDocIds, markUploadsAsSaved);
        } catch (error) {
            console.error('Failed to upload documents', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFormError = (errors: any) => {
        if (errors?.foodAmount) {
            AppToast({
                type: 'error',
                text1: errors.foodAmount.message,
            });
            return;
        }
        AppToast({
            type: 'error',
            text1: 'Vui lòng kiểm tra lại thông tin nhập',
        });
    };

    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <HeaderSection
                title="Kiểm tra tôm"
                onBack={onBack}
                backButtonDisabled={isSaving || isUploading}
                rightComponent={isEditMode ? <DeleteButton onPress={onDeletePress} /> : undefined}
                containerStyle={styles.headerContainer}
            />

            {isLoadingDetail ? (
                <EnvSkeleton />
            ) : (
                <SafeInputLayout
                    contentContainerStyle={styles.scrollContent}
                    extraScrollHeight={100}
                >
                    <View pointerEvents={isSaving || isUploading ? 'none' : 'auto'}>
                        <GeneralInfoBox
                            type={GeneralInfoBoxType.WITH_IMAGE}
                            imageUris={images || []}
                            onImagesChange={handleImagesChange}
                            date={selectedDate}
                            onDateChange={handleDateChange}
                            disabledDate={true}
                        />

                        <ShrimpInspectionFoodCheckBox
                            foodAmount={foodAmount || ''}
                            onFoodAmountChange={handleFoodAmountChange}
                            leftoverFood={leftoverFood || LeftoverFoodEnum.NONE}
                            onLeftoverFoodChange={handleLeftoverFoodChange}
                        />

                        <ShrimpInspectionObservationBox
                            intestine={intestine || IntestineStatusEnum.FULL}
                            onIntestineChange={handleIntestineChange}
                            intestineColor={intestineColor || IntestineColorEnum.FOOD_COLOR}
                            onIntestineColorChange={handleIntestineColorChange}
                            stoolColor={stoolColor || StoolColorEnum.FOOD_COLOR}
                            onStoolColorChange={handleStoolColorChange}
                            liver={liver || LiverStatusEnum.NORMAL}
                            onLiverChange={handleLiverChange}
                            onAICheckPress={onAICheckPress}
                            aiResult={aiResult}
                        />

                        <SelectionNotesBox notes={notes || ''} onNotesChange={handleNotesChange} />
                    </View>
                </SafeInputLayout>
            )}

            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle={isEditMode ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    secondaryTitle="Hủy"
                    onPrimaryPress={handleSubmit(handleFormSubmit, handleFormError)}
                    onSecondaryPress={onBack}
                    primaryDisabled={
                        (isEditMode ? isButtonDisabled : false) || isSaving || isUploading
                    }
                    secondaryDisabled={isSaving || isUploading}
                    isLoading={isSaving || isUploading}
                />
            </View>

            <ConfirmationModalUI
                visible={isDeleteModalVisible}
                onConfirm={onConfirmDelete}
                onCancel={onCancelDelete}
                successMessage="Đã xoá kiểm tra tôm"
                showSuccessToast={false}
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
        headerContainer: {
            backgroundColor: theme.backgroundPrimary,
        },
        scrollContent: {
            paddingBottom: 100,
        },
        footer: {
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
        },
    });
