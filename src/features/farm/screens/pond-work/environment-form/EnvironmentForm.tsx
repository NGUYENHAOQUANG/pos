import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    GeneralInfoBox,
    GeneralInfoBoxType,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { EnvironmentParametersBox } from '@/features/farm/components/pondwork/environment/EnvironmentParametersBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { EnvSkeleton } from '@/features/farm/components/skeleton/EnvSkeleton';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { AppToast } from '@/features/farm/utils/toastMessages';
import {
    createEnvironmentFormSchema,
    EnvironmentFormValues,
} from '@/features/farm/schemas/environmentFormSchema';
import { IParameterLimits } from '@/features/farm/types/envMeasurement.types';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';

interface EnvironmentFormProps {
    isEditMode: boolean;
    isLoading: boolean;
    isSubmitting: boolean;
    initialData: EnvironmentFormValues | null;

    // Images (managed outside form since they involve uploads)
    imageUris: string[];
    onImagesChange: (uris: string[]) => void;
    hasImagesChanged: boolean;

    // Limits for warning display
    limits: IParameterLimits;

    // Advanced parameters config
    advancedParameters: Array<{ id: string; name: string }>;
    onSetupPress: () => void;

    // Actions
    onBack: () => void;
    onCancel: () => void;
    onSubmit: (values: EnvironmentFormValues) => void;
    onDeletePress: () => void;

    // Delete modal
    deleteModalVisible: boolean;
    onConfirmDelete: () => void;
    onCancelDelete: () => void;
}

export const EnvironmentForm: React.FC<EnvironmentFormProps> = ({
    isEditMode,
    isLoading,
    isSubmitting,
    initialData,
    imageUris,
    onImagesChange,
    hasImagesChanged,
    limits,
    advancedParameters,
    onSetupPress,
    onBack,
    onCancel,
    onSubmit,
    onDeletePress,
    deleteModalVisible,
    onConfirmDelete,
    onCancelDelete,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    // --- Form Setup ---
    const schema = useMemo(() => createEnvironmentFormSchema(), []);

    const defaultValues: EnvironmentFormValues = useMemo(
        () =>
            initialData ?? {
                selectedDate: new Date(),
                notes: '',
                documentIds: [],
                pH: '',
                dissolvedOxygen: '',
                temperature: '',
                salinity: '',
                alkalinity: '',
                transparency: '',
                kali: '',
                tan: '',
                magie: '',
                no3: '',
            },
        [initialData]
    );

    const {
        control,
        setValue,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<EnvironmentFormValues>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    // Watch all form values for controlled inputs
    const selectedDate = useWatch({ control, name: 'selectedDate' }) as Date;
    const notes = useWatch({ control, name: 'notes' }) as string;
    const pH = useWatch({ control, name: 'pH' }) as string;
    const dissolvedOxygen = useWatch({ control, name: 'dissolvedOxygen' }) as string;
    const temperature = useWatch({ control, name: 'temperature' }) as string;
    const salinity = useWatch({ control, name: 'salinity' }) as string;
    const alkalinity = useWatch({ control, name: 'alkalinity' }) as string;
    const transparency = useWatch({ control, name: 'transparency' }) as string;
    const kali = useWatch({ control, name: 'kali' }) as string;
    const tan = useWatch({ control, name: 'tan' }) as string;
    const magie = useWatch({ control, name: 'magie' }) as string;
    const no3 = useWatch({ control, name: 'no3' }) as string;

    // --- Derived ---
    const hasAtLeastOneParameter = [
        pH,
        dissolvedOxygen,
        temperature,
        salinity,
        alkalinity,
        transparency,
        kali,
        tan,
        magie,
        no3,
    ].some(v => v?.trim().length > 0);

    const showParameterError = !!errors.pH?.message && errors.pH.message.includes('ít nhất');

    const isButtonDisabled = isEditMode
        ? !hasAtLeastOneParameter || (!isDirty && !hasImagesChanged)
        : isSubmitting;

    const hasUnsavedChanges = isEditMode
        ? isDirty || hasImagesChanged
        : isDirty || imageUris.length > 0;

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasUnsavedChanges);

    const handleFormSubmit = async (data: EnvironmentFormValues) => {
        allowNavigation();
        onSubmit(data);
    };

    const handleFormError = () => {
        AppToast({
            type: 'error',
            text1: 'Vui lòng kiểm tra lại thông tin môi trường',
        });
    };

    const handleConfirmDelete = () => {
        allowNavigation();
        onConfirmDelete();
    };

    return (
        <View style={styles.container}>
            <HeaderSection
                title="Đo thông số môi trường"
                onBack={onBack}
                backButtonDisabled={isSubmitting}
                rightComponent={isEditMode ? <DeleteButton onPress={onDeletePress} /> : undefined}
            />

            {isLoading || (isEditMode && !initialData) ? (
                <EnvSkeleton />
            ) : (
                <>
                    <SafeInputLayout
                        contentContainerStyle={styles.scrollContent}
                        extraScrollHeight={100}
                    >
                        <View pointerEvents={isSubmitting ? 'none' : 'auto'}>
                            <GeneralInfoBox
                                type={GeneralInfoBoxType.WITH_IMAGE}
                                date={selectedDate}
                                onDateChange={d =>
                                    setValue('selectedDate', d, { shouldDirty: true })
                                }
                                disabledDate={true}
                                imageUris={imageUris}
                                onImagesChange={onImagesChange}
                            />

                            <EnvironmentParametersBox
                                pH={pH ?? ''}
                                onPHChange={v => setValue('pH', v, { shouldDirty: true })}
                                do={dissolvedOxygen ?? ''}
                                onDOChange={v =>
                                    setValue('dissolvedOxygen', v, { shouldDirty: true })
                                }
                                temperature={temperature ?? ''}
                                onTemperatureChange={v =>
                                    setValue('temperature', v, { shouldDirty: true })
                                }
                                salinity={salinity ?? ''}
                                onSalinityChange={v =>
                                    setValue('salinity', v, { shouldDirty: true })
                                }
                                alkalinity={alkalinity ?? ''}
                                onAlkalinityChange={v =>
                                    setValue('alkalinity', v, { shouldDirty: true })
                                }
                                transparency={transparency ?? ''}
                                onTransparencyChange={v =>
                                    setValue('transparency', v, { shouldDirty: true })
                                }
                                onSetupPress={onSetupPress}
                                advancedParameters={advancedParameters}
                                kali={kali ?? ''}
                                onKaliChange={v => setValue('kali', v, { shouldDirty: true })}
                                tan={tan ?? ''}
                                onTanChange={v => setValue('tan', v, { shouldDirty: true })}
                                magie={magie ?? ''}
                                onMagieChange={v => setValue('magie', v, { shouldDirty: true })}
                                no3={no3 ?? ''}
                                onNo3Change={v => setValue('no3', v, { shouldDirty: true })}
                                showError={showParameterError}
                                limits={limits}
                            />

                            <SelectionNotesBox
                                notes={notes ?? ''}
                                onNotesChange={v => setValue('notes', v, { shouldDirty: true })}
                            />
                            <View style={styles.spacer} />
                        </View>
                    </SafeInputLayout>

                    <View style={styles.footer}>
                        <ButtonBarFarm
                            primaryTitle={isEditMode ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                            secondaryTitle="Huỷ"
                            onPrimaryPress={handleSubmit(handleFormSubmit, handleFormError)}
                            onSecondaryPress={onCancel}
                            primaryDisabled={isButtonDisabled}
                            isLoading={isSubmitting}
                        />
                    </View>
                </>
            )}

            <ConfirmationModalUI
                visible={deleteModalVisible}
                onConfirm={handleConfirmDelete}
                onCancel={onCancelDelete}
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
        scrollContent: {
            padding: 0,
            paddingBottom: 100,
            gap: 8,
        },
        footer: {
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
        },
        spacer: {
            height: 20,
        },
    });
