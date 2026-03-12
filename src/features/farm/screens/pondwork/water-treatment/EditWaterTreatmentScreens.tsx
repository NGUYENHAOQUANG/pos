import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { showMaterialQuantityZeroToast } from '@/features/farm/utils/toastMessages';

import { getErrorMessage } from '@/features/material/utils/errorHandlers';
import { colors } from '@/styles';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { WaterTreatment } from '@/features/farm/components/pondwork/water-treatment/WaterTreatment';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { SelectedMaterialItem } from '@/features/farm/components/bottom-sheet/MaterialSelectionBox';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';

import { waterTreatmentApi } from '@/features/farm/api/waterTreatmentApi';
import {
    useUpdateWaterTreatment,
    useDeleteWaterTreatment,
} from '@/features/farm/hooks/useWaterTreatmentRecords';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';
import {
    UpdateWaterTreatmentCommand,
    IWaterTreatmentRecord,
    TREATMENT_TYPE_LABELS,
    TREATMENT_LABEL_TO_ENUM,
} from '@/features/farm/types/waterTreatment.types';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'EditWaterTreatmentScreens'>;

export const EditWaterTreatmentScreens: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<ScreenRouteProp>();
    const { pondId, jobId, item, pond } = route.params || {};

    // Mutations
    const updateMutation = useUpdateWaterTreatment();
    const deleteMutation = useDeleteWaterTreatment();

    // Fetch warehouse materials - needed for mapping detail data
    const { materials } = useFarmMaterials();

    // Local state
    const [executionDate, setExecutionDate] = useState<Date>(new Date());
    const [activityType, setActivityType] = useState<string>('Đánh khoáng');
    const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
    const [note, setNote] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [detailData, setDetailData] = useState<IWaterTreatmentRecord | null>(null);

    const targetPondId = pondId || pond?.id || '';
    const targetJobId = jobId || item?.id || '';

    // --- Fetch detail from API ---
    useEffect(() => {
        const fetchDetail = async () => {
            if (targetPondId && targetJobId) {
                try {
                    const response = await waterTreatmentApi.getDetail(targetPondId, targetJobId);
                    if (response?.data) {
                        setDetailData(response.data);
                    }
                } catch (e) {
                    console.error('Fetch water treatment detail error:', e);
                }
            }
        };
        fetchDetail();
    }, [targetPondId, targetJobId]);

    // --- Bind basic data from API detail ---
    useEffect(() => {
        if (!detailData) return;

        if (detailData.createdAt) {
            setExecutionDate(new Date(detailData.createdAt));
        }

        if (detailData.waterTreatmentDetail) {
            const detail = detailData.waterTreatmentDetail;

            // Map treatmentType enum to Vietnamese label
            if (detail.treatmentType) {
                const label = TREATMENT_TYPE_LABELS[detail.treatmentType];
                if (label) setActivityType(label);
            }

            // Set notes
            setNote(detail.notes || '');
        }
    }, [detailData]);

    // --- Bind materials (need to wait for materials from warehouse to load) ---
    useEffect(() => {
        if (!detailData?.waterTreatmentDetail?.materials || materials.length === 0) return;

        const mapped = detailData.waterTreatmentDetail.materials
            .map(m => {
                const found = materials.find(
                    mat => mat.id === m.warehouseItemId || mat.materialDefId === m.warehouseItemId
                );
                if (found) {
                    return {
                        material: found,
                        quantity: m.quantity,
                        unit: found.unitName || '',
                    } as SelectedMaterialItem;
                }
                return null;
            })
            .filter(Boolean) as SelectedMaterialItem[];

        if (mapped.length > 0) {
            setSelectedMaterials(prev => (prev.length === 0 ? mapped : prev));
        }
    }, [detailData, materials]);

    const hasChanges = useMemo(() => {
        if (!detailData) return false;

        // Check if activityType changed
        let originalActivityType = 'Đánh khoáng';
        if (detailData.waterTreatmentDetail?.treatmentType) {
            originalActivityType =
                TREATMENT_TYPE_LABELS[detailData.waterTreatmentDetail.treatmentType] ||
                'Đánh khoáng';
        }
        if (activityType !== originalActivityType) return true;

        // Check if note changed
        const originalNote = detailData.waterTreatmentDetail?.notes || '';
        if (note !== originalNote) return true;

        // Check if materials changed
        const originalMaterials = detailData.waterTreatmentDetail?.materials || [];
        if (selectedMaterials.length !== originalMaterials.length) return true;

        const materialsChanged = selectedMaterials.some(sm => {
            const om = originalMaterials.find(
                o =>
                    o.warehouseItemId === sm.material.id ||
                    o.warehouseItemId === sm.material.materialDefId
            );
            if (!om) return true;
            return parseFloat(sm.quantity.toString()) !== parseFloat(om.quantity.toString());
        });

        if (materialsChanged) return true;

        return false;
    }, [detailData, activityType, note, selectedMaterials]);

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasChanges);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSave = async () => {
        if (!targetPondId || !targetJobId) return;

        // Validate material quantities must be greater than 0
        if (selectedMaterials.some(m => m.quantity <= 0)) {
            showMaterialQuantityZeroToast();
            return;
        }

        const treatmentTypeEnum = TREATMENT_LABEL_TO_ENUM[activityType];
        if (!treatmentTypeEnum) {
            Toast.show({
                type: 'error',
                text1: 'Loại hoạt động không hợp lệ',
            });
            return;
        }

        const payload: UpdateWaterTreatmentCommand = {
            documentIds: detailData?.documentIds || [],
            waterTreatmentDetail: {
                treatmentType: treatmentTypeEnum,
                notes: note.trim() || '',
                materials: selectedMaterials.map(m => ({
                    warehouseItemId: m.material.id,
                    quantity: Number.isNaN(Number(m.quantity)) ? m.quantity : Number(m.quantity),
                })),
            },
        };

        try {
            await updateMutation.mutateAsync({
                pondId: targetPondId,
                id: targetJobId,
                data: payload,
            });
            allowNavigation();
            Toast.show({
                type: 'success',
                text1: 'Cập nhật nhật ký thành công',
            });
            navigation.goBack();
        } catch (error: any) {
            console.error('Update water treatment error', error);
            let message = getErrorMessage(error, 'Vui lòng thử lại');

            if (
                message.includes('invalid start of a value') ||
                message.includes('converted to System.Decimal') ||
                message.includes('System.Decimal')
            ) {
                message = 'Số lượng vật tư không hợp lệ';
            }

            Toast.show({
                type: 'error',
                text1: 'Có lỗi xảy ra',
                text2: message,
            });
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (targetPondId && targetJobId) {
            try {
                await deleteMutation.mutateAsync({
                    pondId: targetPondId,
                    id: targetJobId,
                });
                allowNavigation();
                setShowDeleteModal(false);
                navigation.goBack();
                Toast.show({ type: 'success', text1: 'Xóa thành công' });
            } catch (error: unknown) {
                console.error('Delete water treatment error', error);
                const message = error instanceof Error ? error.message : 'Vui lòng thử lại';
                Toast.show({
                    type: 'error',
                    text1: 'Xóa thất bại',
                    text2: message,
                });
            }
        }
    };

    return (
        <>
            {/* Header */}
            <HeaderSection
                title="Xử lý nước"
                onBack={handleBack}
                rightComponent={<DeleteButton onPress={handleDelete} />}
            />

            <SafeInputLayout
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                extraScrollHeight={50}
            >
                {/* Main Content Component */}
                <WaterTreatment
                    executionDate={executionDate}
                    onExecutionDateChange={setExecutionDate}
                    disabledDate={true}
                    activityType={activityType}
                    onActivityTypeChange={setActivityType}
                    selectedMaterials={selectedMaterials}
                    onSelectedMaterialsChange={setSelectedMaterials}
                    note={note}
                    onNoteChange={setNote}
                />
            </SafeInputLayout>

            {/* Footer Buttons */}
            <ButtonBarFarm
                primaryTitle="Cập nhật thông tin"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSave}
                onSecondaryPress={handleBack}
                style={{ borderTopWidth: 1, borderTopColor: colors.border }}
            />

            {UnsavedChangesModal}

            <ConfirmationModalUI
                visible={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
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
