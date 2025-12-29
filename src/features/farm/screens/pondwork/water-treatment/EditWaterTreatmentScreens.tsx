import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { colors, borderRadius } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { WaterTreatment } from '@/features/farm/components/pondwork/water-treatment/WaterTreatment';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarm } from '@/features/farm/context/FarmContext';
import { SelectedMaterialItem } from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { formatDate, parseDate } from '@/features/farm/utils/dateUtils';
import { showEditJobSuccessToast } from '@/features/farm/utils/toastMessages';

import DeleteIcon from '@/assets/Icon/IconFarm/Delete.svg';

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

                // Parse date and time from itemToEdit
                if (itemToEdit.date) {
                    const dateObj = parseDate(itemToEdit.date);
                    // Set time if available
                    if (itemToEdit.time) {
                        const [hours, minutes] = itemToEdit.time.split(':').map(Number);
                        dateObj.setHours(hours, minutes);
                    }
                    setExecutionDate(dateObj);
                } else if (itemToEdit.time) {
                    // Fallback: if no date, just set time to current date
                    const [hours, minutes] = itemToEdit.time.split(':').map(Number);
                    const date = new Date();
                    date.setHours(hours, minutes);
                    setExecutionDate(date);
                }
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

    const renderHeaderRight = () => (
        <TouchableOpacity onPress={handleDelete} style={styles.headerDeleteButton}>
            <DeleteIcon width={20} height={20} color={colors.red[900]} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <HeaderFarm
                type="simple"
                title="Xử lý nước"
                onBack={handleBack}
                rightAction={renderHeaderRight()}
            />

            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
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
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer Buttons */}
            <ButtonBarFarm
                primaryTitle="Cập nhật thông tin"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSave}
                onSecondaryPress={handleBack}
            />

            <ConfirmationDeleteModal
                visible={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </SafeAreaView>
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
    headerDeleteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.red[900],
        backgroundColor: colors.white,
    },
});
