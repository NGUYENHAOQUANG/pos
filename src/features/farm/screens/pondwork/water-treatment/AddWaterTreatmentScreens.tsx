import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
    showMaterialQuantityZeroToast,
    showInvalidActivityTypeToast,
    showAddJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { handleError } from '@/shared/utils/errorHandler';
import { colors } from '@/styles';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { WaterTreatment } from '@/features/farm/components/pondwork/water-treatment/WaterTreatment';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { SelectedMaterialItem } from '@/features/farm/components/bottom-sheet/MaterialSelectionBox';
import { WaterTreatmentSkeleton } from '@/features/farm/components/skeleton/WaterTreatmentSkeleton';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';

import { useCreateWaterTreatment } from '@/features/farm/hooks/useWaterTreatmentRecords';

import {
    CreateWaterTreatmentCommand,
    TREATMENT_LABEL_TO_ENUM,
} from '@/features/farm/types/waterTreatment.types';

import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'AddWaterTreatmentScreen'>;

export const AddWaterTreatmentScreens: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<ScreenRouteProp>();
    const { pond } = route.params || {};
    const pondId = pond?.id;
    // Mutation
    const createMutation = useCreateWaterTreatment();
    // Fetch warehouse materials
    const { isLoading: materialsLoading } = useFarmMaterials();
    const [initialLoading, setInitialLoading] = useState(true);

    // Minimum loading time to ensure skeleton is visible
    useEffect(() => {
        const timer = setTimeout(() => setInitialLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Show skeleton until both initial timer and materials loading are done
    const isLoading = materialsLoading || initialLoading;

    const [executionDate, setExecutionDate] = useState<Date>(new Date());
    const [activityType, setActivityType] = useState<string>('Đánh khoáng');
    const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
    const [note, setNote] = useState('');
    const hasChanges = useMemo(() => {
        return activityType !== 'Đánh khoáng' || selectedMaterials.length > 0 || note !== '';
    }, [activityType, selectedMaterials, note]);
    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasChanges);
    const handleBack = () => {
        navigation.goBack();
    };
    const handleSave = async () => {
        // Validate material quantities must be greater than 0 (only when materials selected)
        if (selectedMaterials.length > 0 && selectedMaterials.some(m => m.quantity <= 0)) {
            showMaterialQuantityZeroToast();
            return;
        }

        if (!pondId) return;

        const treatmentTypeEnum = TREATMENT_LABEL_TO_ENUM[activityType];
        if (!treatmentTypeEnum) {
            showInvalidActivityTypeToast();
            return;
        }

        const payload: CreateWaterTreatmentCommand = {
            documentIds: [],
            waterTreatmentDetail: {
                treatmentType: treatmentTypeEnum,
                notes: note || undefined,
                materials: selectedMaterials.map(m => ({
                    warehouseItemId: m.material.id,
                    quantity: Number.isNaN(Number(m.quantity)) ? m.quantity : Number(m.quantity),
                })),
            },
        };

        try {
            await createMutation.mutateAsync({
                pondId,
                data: payload,
            });
            allowNavigation();
            showAddJobSuccessToast('WATER_TREATMENT');
            navigation.goBack();
        } catch (error: unknown) {
            handleError(error);
        }
    };

    return (
        <>
            {/* Header */}
            <HeaderSection title="Xử lý nước" onBack={handleBack} />

            {isLoading ? (
                <WaterTreatmentSkeleton />
            ) : (
                <>
                    <SafeInputLayout
                        style={styles.container}
                        contentContainerStyle={styles.scrollContent}
                        extraScrollHeight={150}
                    >
                        {/* Main Content Component */}
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

                    {/* Footer Buttons */}
                    <ButtonBarFarm
                        primaryTitle="Lưu thông tin"
                        secondaryTitle="Huỷ"
                        onPrimaryPress={handleSave}
                        onSecondaryPress={handleBack}
                        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
                    />
                </>
            )}

            {UnsavedChangesModal}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    scrollContent: {
        paddingBottom: 100,
    },
});
