import React, { useRef, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    GeneralInfoBox,
    GeneralInfoBoxRef,
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

interface Props {
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
    onSubmit: (data: ShrimpHealthFormState, documentIds: string[]) => void;
}

export const ShrimpInspectionForm: React.FC<Props> = ({
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
    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);

    const initialSnapshot = useMemo(
        () => (isEditMode ? shrimpHealthService.createSnapshot(initialData) : null),
        [initialData, isEditMode]
    );

    const { control, handleSubmit, reset } = useForm<ShrimpHealthFormState>({
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

    const handleFormSubmit = (data: ShrimpHealthFormState) => {
        allowNavigation(); // bypass useUnsavedChanges
        const docIds = generalInfoBoxRef.current?.getUploadedIds() || [];
        onSubmit(data, docIds);
        generalInfoBoxRef.current?.markAsSaved();
    };

    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <HeaderSection
                title="Kiểm tra tôm"
                onBack={onBack}
                backButtonDisabled={isSaving}
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
                    <Controller
                        control={control}
                        name="date"
                        render={({ field: { value, onChange } }) => (
                            <Controller
                                control={control}
                                name="images"
                                render={({ field: { value: imgValue, onChange: onImgChange } }) => (
                                    <GeneralInfoBox
                                        ref={generalInfoBoxRef}
                                        date={value}
                                        onDateChange={onChange}
                                        type="withImage"
                                        imageUris={imgValue || []}
                                        onImagesChange={onImgChange}
                                        documentIds={documentIds}
                                        disabledDate={true}
                                    />
                                )}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="foodAmount"
                        render={({ field: { value: foodAmountVal, onChange: onFoodChange } }) => (
                            <Controller
                                control={control}
                                name="leftoverFood"
                                render={({
                                    field: { value: leftoverVal, onChange: onLeftoverChange },
                                }) => (
                                    <ShrimpInspectionFoodCheckBox
                                        foodAmount={foodAmountVal || ''}
                                        onFoodAmountChange={onFoodChange}
                                        leftoverFood={leftoverVal || LeftoverFoodEnum.NONE}
                                        onLeftoverFoodChange={onLeftoverChange}
                                    />
                                )}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="intestine"
                        render={({ field: { value: intVal, onChange: onIntChange } }) => (
                            <Controller
                                control={control}
                                name="intestineColor"
                                render={({
                                    field: { value: intColVal, onChange: onIntColChange },
                                }) => (
                                    <Controller
                                        control={control}
                                        name="stoolColor"
                                        render={({
                                            field: { value: stoolVal, onChange: onStoolChange },
                                        }) => (
                                            <Controller
                                                control={control}
                                                name="liver"
                                                render={({
                                                    field: {
                                                        value: liverVal,
                                                        onChange: onLiverChange,
                                                    },
                                                }) => (
                                                    <ShrimpInspectionObservationBox
                                                        intestine={
                                                            intVal || IntestineStatusEnum.FULL
                                                        }
                                                        onIntestineChange={onIntChange}
                                                        intestineColor={
                                                            intColVal ||
                                                            IntestineColorEnum.FOOD_COLOR
                                                        }
                                                        onIntestineColorChange={onIntColChange}
                                                        stoolColor={
                                                            stoolVal || StoolColorEnum.FOOD_COLOR
                                                        }
                                                        onStoolColorChange={onStoolChange}
                                                        liver={liverVal || LiverStatusEnum.NORMAL}
                                                        onLiverChange={onLiverChange}
                                                        onAICheckPress={onAICheckPress}
                                                        aiResult={aiResult}
                                                    />
                                                )}
                                            />
                                        )}
                                    />
                                )}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="notes"
                        render={({ field: { value, onChange } }) => (
                            <SelectionNotesBox notes={value || ''} onNotesChange={onChange} />
                        )}
                    />
                </SafeInputLayout>
            )}

            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle={isEditMode ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleSubmit(handleFormSubmit)}
                    onSecondaryPress={onBack}
                    primaryDisabled={isEditMode ? isButtonDisabled : false}
                    secondaryDisabled={isSaving}
                    isLoading={isSaving}
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
