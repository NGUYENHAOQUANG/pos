import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { EnvSkeleton } from '@/features/farm/components/skeleton/EnvSkeleton';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { WaterTreatment } from '@/features/farm/components/pondwork/water-treatment/WaterTreatment';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import {
    showMaterialQuantityZeroToast,
    showInvalidActivityTypeToast,
    showEditJobSuccessToast,
    showAddJobSuccessToast,
    showDeleteJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { waterTreatmentService } from '@/features/farm/services/pond-work/water-treatment.service';
import { WaterTreatmentFormValues } from '@/features/farm/schemas/waterTreatmentSchema';
import { TREATMENT_LABEL_TO_ENUM } from '@/features/farm/types/waterTreatment.types';
import { handleError } from '@/shared/utils/errorHandler';

interface WaterTreatmentFormProps {
    isEditing: boolean;
    isLoadingDetail: boolean;
    isSaving: boolean;
    initialValues: WaterTreatmentFormValues;
    initialSnapshot: string | null;
    onSave: (payload: any) => Promise<void>;
    onDelete: () => Promise<void>;
    onBack: () => void;
}

export const WaterTreatmentForm: React.FC<WaterTreatmentFormProps> = ({
    isEditing,
    isLoadingDetail,
    isSaving,
    initialValues,
    initialSnapshot,
    onSave,
    onDelete,
    onBack,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const [executionDate, setExecutionDate] = useState(initialValues.executionDate);
    const [activityType, setActivityType] = useState(initialValues.activityType);
    const [selectedMaterials, setSelectedMaterials] = useState(initialValues.selectedMaterials);
    const [note, setNote] = useState(initialValues.note);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        setExecutionDate(initialValues.executionDate);
        setActivityType(initialValues.activityType);
        setSelectedMaterials(initialValues.selectedMaterials);
        setNote(initialValues.note);
    }, [initialValues]);

    const hasChanges = useMemo(() => {
        const currentData: WaterTreatmentFormValues = {
            executionDate,
            activityType,
            note,
            selectedMaterials,
            documentIds: initialValues.documentIds,
        };
        return waterTreatmentService.hasChanges(currentData, initialSnapshot);
    }, [
        executionDate,
        activityType,
        note,
        selectedMaterials,
        initialValues.documentIds,
        initialSnapshot,
    ]);

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasChanges);

    const handleSavePress = async () => {
        if (waterTreatmentService.hasMaterialWithZeroQuantity(selectedMaterials)) {
            showMaterialQuantityZeroToast();
            return;
        }

        const treatmentTypeEnum = TREATMENT_LABEL_TO_ENUM[activityType];
        if (!treatmentTypeEnum) {
            showInvalidActivityTypeToast();
            return;
        }

        const currentData: WaterTreatmentFormValues = {
            executionDate,
            activityType,
            note,
            selectedMaterials,
            documentIds: initialValues.documentIds,
        };

        const payload = waterTreatmentService.mapFormToPayload(
            currentData,
            initialValues.documentIds
        );

        try {
            await onSave(payload);
            allowNavigation();
            if (isEditing) {
                showEditJobSuccessToast('WATER_TREATMENT');
            } else {
                showAddJobSuccessToast('WATER_TREATMENT');
            }
            onBack();
        } catch (err) {
            handleError(err);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await onDelete();
            allowNavigation();
            setShowDeleteModal(false);
            showDeleteJobSuccessToast('WATER_TREATMENT');
            setTimeout(() => onBack(), 300);
        } catch (err) {
            handleError(err);
        }
    };

    return (
        <View style={styles.container}>
            <HeaderSection
                title="Xử lý nước"
                onBack={onBack}
                backButtonDisabled={isSaving}
                rightComponent={
                    isEditing ? (
                        <DeleteButton onPress={() => setShowDeleteModal(true)} />
                    ) : undefined
                }
            />

            <View style={{ flex: 1 }}>
                {isLoadingDetail ? (
                    <EnvSkeleton />
                ) : (
                    <SafeInputLayout
                        contentContainerStyle={styles.scrollContent}
                        extraScrollHeight={150}
                    >
                        <WaterTreatment
                            executionDate={executionDate}
                            onExecutionDateChange={setExecutionDate}
                            activityType={activityType}
                            onActivityTypeChange={setActivityType}
                            selectedMaterials={selectedMaterials}
                            onSelectedMaterialsChange={setSelectedMaterials}
                            note={note}
                            onNoteChange={setNote}
                            disabledDate={true}
                        />
                    </SafeInputLayout>
                )}
            </View>

            <ButtonBarFarm
                primaryTitle={isEditing ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSavePress}
                onSecondaryPress={onBack}
                primaryDisabled={isSaving || (isEditing && !hasChanges)}
                secondaryDisabled={isSaving}
                isLoading={isSaving}
                style={{
                    borderTopWidth: 1,
                    borderTopColor: theme.defaultBorder,
                    backgroundColor: theme.background,
                }}
            />

            {UnsavedChangesModal}

            <ConfirmationModalUI
                visible={showDeleteModal}
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteModal(false)}
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
        scrollContent: {
            paddingBottom: 100,
        },
    });
