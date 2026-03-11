import React, { useState, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { getErrorMessage } from '@/features/material/utils/errorHandlers';
import { colors } from '@/styles';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { WaterTreatment } from '@/features/farm/components/pondwork/water-treatment/WaterTreatment';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { SelectedMaterialItem } from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';

import { useCreateWaterTreatment } from '@/features/farm/hooks/useWaterTreatmentRecords';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';
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

    // Fetch warehouse materials
    const { materials } = useFarmMaterials();

    const filteredMaterials = useMemo(() => {
        return materials.filter(m => {
            const groupName = (m.group || '').toLowerCase();
            return groupName.includes('công cụ') || groupName.includes('thiết bị điện');
        });
    }, [materials]);
    // Mutation
    const createMutation = useCreateWaterTreatment();

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
        if (selectedMaterials.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn vật tư',
                visibilityTime: 3000,
            });
            return;
        }

        if (!pondId) return;

        const treatmentTypeEnum = TREATMENT_LABEL_TO_ENUM[activityType];
        if (!treatmentTypeEnum) {
            Toast.show({
                type: 'error',
                text1: 'Loại hoạt động không hợp lệ',
            });
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
            Toast.show({
                type: 'success',
                text1: 'Thêm nhật ký thành công',
            });
            navigation.goBack();
        } catch (error: any) {
            console.error('Create water treatment error', error);
            let message = getErrorMessage(error, 'Vui lòng thử lại');

            Toast.show({
                type: 'error',
                text1: 'Có lỗi xảy ra',
                text2: message,
            });
        }
    };

    return (
        <>
            {/* Header */}
            <HeaderSection title="Xử lý nước" onBack={handleBack} />

            <SafeInputLayout
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                extraScrollHeight={50}
            >
                {/* Main Content Component */}
                <WaterTreatment
                    executionDate={executionDate}
                    onExecutionDateChange={setExecutionDate}
                    activityType={activityType}
                    onActivityTypeChange={setActivityType}
                    materials={filteredMaterials}
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
