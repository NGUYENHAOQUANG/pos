import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { colors } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { WaterTreatment } from '@/features/farm/components/pondwork/water-treatment/WaterTreatment';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarmStore } from '@/features/farm/store/farmStore';
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
    const { pondId, jobId, itemToEdit } = route.params || {};

    // Use individual selectors instead of useFarm() to prevent unnecessary re-renders
    const updatePondJob = useFarmStore(state => state.updatePondJob);
    const getPondJobItems = useFarmStore(state => state.getPondJobItems);

    const [executionDate, setExecutionDate] = useState<Date>(new Date());
    const [activityType, setActivityType] = useState<string>('Đánh khoáng');
    const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
    const [note, setNote] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Load existing data
    useEffect(() => {
        // Prioritize itemToEdit passed from navigation (WorkLog)
        if (itemToEdit) {
            setNote(itemToEdit.note || '');
            if (itemToEdit.materials) {
                // Ensure materials are cast correctly if needed
                setSelectedMaterials(itemToEdit.materials as SelectedMaterialItem[]);
            }
            if (itemToEdit.waterTreatmentType) {
                setActivityType(itemToEdit.waterTreatmentType);
            }

            // Parse date/time
            if (itemToEdit.date && itemToEdit.time) {
                const [day, month, year] = itemToEdit.date.split('/').map(Number);
                const [hours, minutes] = itemToEdit.time.split(':').map(Number);
                if (
                    !isNaN(day) &&
                    !isNaN(month) &&
                    !isNaN(year) &&
                    !isNaN(hours) &&
                    !isNaN(minutes)
                ) {
                    const date = new Date(year, month - 1, day, hours, minutes);
                    setExecutionDate(date);
                }
            } else if (itemToEdit.createdAt) {
                setExecutionDate(new Date(itemToEdit.createdAt));
            }
        } else if (pondId && jobId) {
            // Fallback to store lookup if itemToEdit is not passed (e.g. deep link or other nav)
            const items = getPondJobItems(pondId, 'WATER_TREATMENT');
            const foundItem = items.find(i => i.id === jobId);
            if (foundItem) {
                setNote(foundItem.note || '');
                if (foundItem.materials) {
                    setSelectedMaterials(foundItem.materials);
                }
                if (foundItem.waterTreatmentType) {
                    setActivityType(foundItem.waterTreatmentType);
                }
                // Parse date/time for store item
                if (foundItem.date && foundItem.time) {
                    const [day, month, year] = foundItem.date.split('/').map(Number);
                    const [hours, minutes] = foundItem.time.split(':').map(Number);
                    if (
                        !isNaN(day) &&
                        !isNaN(month) &&
                        !isNaN(year) &&
                        !isNaN(hours) &&
                        !isNaN(minutes)
                    ) {
                        const date = new Date(year, month - 1, day, hours, minutes);
                        setExecutionDate(date);
                    }
                }
            }
        }
    }, [pondId, jobId, itemToEdit, getPondJobItems]);

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

            <ConfirmationDeleteModal
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
    flex1: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
});
