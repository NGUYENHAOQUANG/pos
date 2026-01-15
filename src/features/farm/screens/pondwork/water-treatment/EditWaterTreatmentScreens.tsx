import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { colors } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { WaterTreatment } from '@/features/farm/components/pondwork/water-treatment/WaterTreatment';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarm } from '@/features/farm/store/farmStore';
import { SelectedMaterialItem } from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { formatDate } from '@/features/farm/utils/dateUtils';
import { showEditJobSuccessToast } from '@/features/farm/utils/toastMessages';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'EditWaterTreatmentScreens'>;

export const EditWaterTreatmentScreens: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<ScreenRouteProp>();
    // EditFeeder gets params: pondId, jobId. We do the same.
    const { pondId, jobId } = route.params || {};
    const { updatePondJob, getPondJobItems } = useFarm();

    const [executionDate, setExecutionDate] = useState<Date>(new Date());
    const [activityType, setActivityType] = useState<string>('Đánh khoáng');
    const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
    const [note, setNote] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Load existing data
    useEffect(() => {
        if (pondId && jobId) {
            const items = getPondJobItems(pondId, 'WATER_TREATMENT');
            const itemToEdit = items.find(i => i.id === jobId);
            if (itemToEdit) {
                setNote(itemToEdit.note || '');
                if (itemToEdit.materials) {
                    setSelectedMaterials(itemToEdit.materials);
                }
                if (itemToEdit.waterTreatmentType) {
                    setActivityType(itemToEdit.waterTreatmentType);
                }
                // Do not override date/time with itemToEdit.date/time
                // executionDate is already initialized to new Date() (current time) by useState
            }
        }
    }, [pondId, jobId, getPondJobItems]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSave = () => {
        if (pondId && jobId) {
            const items = getPondJobItems(pondId, 'WATER_TREATMENT');

            const timeString = executionDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            });
            const dateString = formatDate(executionDate);

            const updatedItems = items.map(item => {
                if (item.id === jobId) {
                    return {
                        ...item,
                        time: timeString,
                        date: dateString,
                        note: note || undefined,
                        waterTreatmentType: activityType,
                        materials: selectedMaterials,
                    };
                }
                return item;
            });

            updatePondJob(pondId, 'WATER_TREATMENT', updatedItems);
            showEditJobSuccessToast('WATER_TREATMENT');

            navigation.goBack();
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setShowDeleteModal(false);
        if (pondId && jobId) {
            const items = getPondJobItems(pondId, 'WATER_TREATMENT');
            const updatedItems = items.filter(item => item.id !== jobId);
            updatePondJob(pondId, 'WATER_TREATMENT', updatedItems);
            navigation.goBack();
        }
    };

    const renderHeaderRight = () => <DeleteButton onPress={handleDelete} />;

    return (
        <>
            {/* Header */}
            <HeaderFarm
                type="simple"
                title="Xử lý nước"
                onBack={handleBack}
                rightAction={renderHeaderRight()}
            />

            <SafeInputLayout style={styles.flex1}>
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.flex1}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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
                        scrollViewRef={scrollViewRef}
                    />
                </ScrollView>
            </SafeInputLayout>

            {/* Footer Buttons */}
            <ButtonBarFarm
                primaryTitle="Cập nhật thông tin"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSave}
                onSecondaryPress={handleBack}
                style={{ borderTopWidth: 1, borderTopColor: colors.border }}
            />

            <ConfirmationDeleteModal
                visible={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </>
    );
};

const styles = StyleSheet.create({
    flex1: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
});
