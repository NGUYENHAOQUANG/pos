import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';

import {
    GeneralInfoBox,
    GeneralInfoBoxRef,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { MeasurementDataBox } from '@/features/farm/components/pondwork/measurement/MeasurementDataBox';
import { EnvSkeleton } from '@/features/farm/components/skeleton/EnvSkeleton';

import { measureShrimpSizeService } from '@/features/farm/services/pond-work/measure-shrimp-size.service';
import {
    measureShrimpSizeSchema,
    MeasureShrimpSizeFormValues,
} from '@/features/farm/schemas/measureShrimpSizeSchema';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
    showDeleteJobSuccessToast,
    showShrimpSizeErrorToast,
    showRemainingWeightErrorToast,
} from '@/features/farm/utils/toastMessages';
import { handleError } from '@/shared/utils/errorHandler';

interface MeasureShrimpSizeFormProps {
    isEditing: boolean;
    isLoadingDetail: boolean;
    isSaving: boolean;
    initialValues: MeasureShrimpSizeFormValues;
    initialSnapshot: string | null;
    aiShrimpSize?: string;
    stockingQuantity?: number;
    onSave: (payload: any) => Promise<void>;
    onDelete: () => Promise<void>;
    onBack: () => void;
    onAIMeasurePress: () => void;
}

export const MeasureShrimpSizeForm: React.FC<MeasureShrimpSizeFormProps> = ({
    isEditing,
    isLoadingDetail,
    isSaving,
    initialValues,
    initialSnapshot,
    aiShrimpSize,
    stockingQuantity,
    onSave,
    onDelete,
    onBack,
    onAIMeasurePress,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { control, handleSubmit, setValue, reset } = useForm<MeasureShrimpSizeFormValues>({
        resolver: zodResolver(measureShrimpSizeSchema),
        defaultValues: initialValues,
    });

    useEffect(() => {
        reset(initialValues);
    }, [initialValues, reset]);

    useEffect(() => {
        if (aiShrimpSize) {
            setValue('shrimpSizePcsPerKg', aiShrimpSize, { shouldDirty: true });
        }
    }, [aiShrimpSize, setValue]);

    const formValues = useWatch({
        control,
        name: [
            'executionDate',
            'shrimpSizePcsPerKg',
            'estimatedRemainingStockKg',
            'averageShrimpSize',
            'notes',
            'imageUris',
            'documentIds',
        ],
    });

    const [
        executionDate,
        shrimpSizePcsPerKg,
        estimatedRemainingStockKg,
        averageShrimpSize,
        notes,
        imageUris,
        documentIds,
    ] = formValues as [Date, string, string, string, string, string[], string[]];

    const currentFormValues: MeasureShrimpSizeFormValues = useMemo(
        () => ({
            executionDate,
            shrimpSizePcsPerKg,
            estimatedRemainingStockKg,
            averageShrimpSize,
            notes,
            documentIds,
            imageUris,
        }),
        [
            executionDate,
            shrimpSizePcsPerKg,
            estimatedRemainingStockKg,
            averageShrimpSize,
            notes,
            documentIds,
            imageUris,
        ]
    );

    const hasChanges = useMemo(() => {
        if (!executionDate || typeof shrimpSizePcsPerKg !== 'string') return false;
        return measureShrimpSizeService.hasChanges(currentFormValues, initialSnapshot);
    }, [currentFormValues, initialSnapshot, executionDate, shrimpSizePcsPerKg]);

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasChanges);

    const onSubmit = useCallback(
        async (data: MeasureShrimpSizeFormValues) => {
            if (isSaving) return;

            const uploadedDocumentIds = generalInfoBoxRef.current?.getUploadedIds() || [];
            const payload = measureShrimpSizeService.mapFormToPayload(data, uploadedDocumentIds);

            try {
                await onSave(payload);
                allowNavigation();
                generalInfoBoxRef.current?.markAsSaved();
                if (isEditing) {
                    showEditJobSuccessToast('MEASURE_SIZE');
                } else {
                    showAddJobSuccessToast('MEASURE_SIZE');
                }
                onBack();
            } catch (error) {
                handleError(error as Error);
            }
        },
        [isSaving, onSave, allowNavigation, isEditing, onBack]
    );

    const onFormError = useCallback((errors: any) => {
        if (errors.shrimpSizePcsPerKg) {
            showShrimpSizeErrorToast();
            return;
        }
        if (errors.estimatedRemainingStockKg) {
            showRemainingWeightErrorToast();
            return;
        }
        showShrimpSizeErrorToast();
    }, []);

    const handleDeletePrimary = useCallback(async () => {
        try {
            await onDelete();
            allowNavigation();
            setShowDeleteModal(false);
            showDeleteJobSuccessToast('MEASURE_SIZE');
            setTimeout(() => onBack(), 300);
        } catch (error) {
            handleError(error as Error);
        }
    }, [onDelete, allowNavigation, onBack, setShowDeleteModal]);

    const handleShowDeleteModal = useCallback(() => {
        setShowDeleteModal(true);
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        setShowDeleteModal(false);
    }, []);

    const handleExecutionDateChange = useCallback(
        (val: Date) => setValue('executionDate', val, { shouldDirty: true }),
        [setValue]
    );

    const handleShrimpSizeChange = useCallback(
        (val: string) => setValue('shrimpSizePcsPerKg', val, { shouldDirty: true }),
        [setValue]
    );

    const handleRemainingWeightChange = useCallback(
        (val: string) => setValue('estimatedRemainingStockKg', val, { shouldDirty: true }),
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

    return (
        <View style={styles.container}>
            <HeaderSection
                title="Đo kích thước tôm"
                onBack={onBack}
                backButtonDisabled={isSaving}
                rightComponent={
                    isEditing ? <DeleteButton onPress={handleShowDeleteModal} /> : undefined
                }
            />

            {isLoadingDetail ? (
                <EnvSkeleton />
            ) : (
                <SafeInputLayout
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    extraScrollHeight={100}
                >
                    <GeneralInfoBox
                        ref={generalInfoBoxRef}
                        type="withImage"
                        date={executionDate}
                        onDateChange={handleExecutionDateChange}
                        imageUris={imageUris}
                        onImagesChange={handleImagesChange}
                        documentIds={documentIds}
                        disabledDate={true}
                    />
                    <MeasurementDataBox
                        shrimpSize={shrimpSizePcsPerKg}
                        onShrimpSizeChange={handleShrimpSizeChange}
                        remainingWeight={estimatedRemainingStockKg}
                        onRemainingWeightChange={handleRemainingWeightChange}
                        stockingQuantity={stockingQuantity}
                        onAIMeasurePress={onAIMeasurePress}
                    />
                    <SelectionNotesBox notes={notes} onNotesChange={handleNotesChange} />
                </SafeInputLayout>
            )}

            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle={isEditing ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleSubmit(onSubmit, onFormError)}
                    onSecondaryPress={onBack}
                    isLoading={isSaving}
                    secondaryDisabled={isSaving}
                    primaryDisabled={isSaving || (isEditing && !hasChanges)}
                />
            </View>

            <ConfirmationModalUI
                visible={showDeleteModal}
                onCancel={handleCloseDeleteModal}
                onConfirm={handleDeletePrimary}
                title="Xoá tác vụ"
                message="Bạn có chắc chắn muốn xoá tác vụ này không?"
                confirmText="Đồng ý"
                cancelText="Không"
                successMessage="Đã xoá tác vụ thành công"
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
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: 0,
            paddingBottom: 100,
        },
        footer: {
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
        },
    });
