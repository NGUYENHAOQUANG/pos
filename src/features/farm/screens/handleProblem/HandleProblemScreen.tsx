import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, borderRadius } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    GeneralInfoBox,
    GeneralInfoBoxRef,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { MaterialSelectionBox } from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';

import { useFarmStore } from '@/features/farm/store/farmStore';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import {
    useHandleProblemMaterials,
    useHandleProblemForm,
} from '@/features/farm/hooks/Incident/useHandleProblemForm';
import { IMaterial } from '@/features/material/types/material.types';
import DeleteIcon from '@/assets/Icon/IconFarm/Delete.svg';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { formatDate, parseDate } from '@/features/farm/utils/dateUtils';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import Toast from 'react-native-toast-message';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'HandleProblem'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const HandleProblemScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();

    const { pond, item, jobType = 'CLEAN_POND' } = route.params || {};
    const updatePondJob = useFarmStore(state => state.updatePondJob);
    const getPondJobItems = useFarmStore(state => state.getPondJobItems);

    const currentJobType: JobType = jobType as JobType;
    const isIncident = currentJobType === 'TROUBLESHOOTING';

    // Xử lý sự cố (API): form state + handlers từ hook
    const incidentForm = useHandleProblemForm({
        pond: isIncident ? pond : undefined,
        item: isIncident ? item : undefined,
    });

    // Rửa ao / Phơi ao: chỉ cần materials + state local
    const { materials: materialsFromStore } = useHandleProblemMaterials(
        isIncident ? undefined : pond
    );
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedMaterials, setSelectedMaterials] = useState<
        Array<{ material: IMaterial; quantity: number; unit: string }>
    >([]);
    const [note, setNote] = useState('');
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const materials = isIncident ? incidentForm.materials : materialsFromStore;
    const scrollViewRef = useRef<ScrollView>(null);
    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);

    // State thống nhất cho UI: incident lấy từ form, không incident từ state local
    const selectedDateVal = isIncident ? incidentForm.selectedDate : selectedDate;
    const setSelectedDateVal = isIncident ? incidentForm.setSelectedDate : setSelectedDate;
    const selectedMaterialsVal = isIncident ? incidentForm.selectedMaterials : selectedMaterials;
    const setSelectedMaterialsVal = isIncident
        ? incidentForm.setSelectedMaterials
        : setSelectedMaterials;
    const noteVal = isIncident ? incidentForm.note : note;
    const setNoteVal = isIncident ? incidentForm.setNote : setNote;
    const imageUrisVal = isIncident ? incidentForm.imageUris : imageUris;
    const setImageUrisVal = isIncident ? incidentForm.setImageUris : setImageUris;
    const showDeleteModalVal = isIncident ? incidentForm.showDeleteModal : showDeleteModal;
    const setShowDeleteModalVal = isIncident ? incidentForm.setShowDeleteModal : setShowDeleteModal;

    const getTitle = () => {
        switch (currentJobType) {
            case 'CLEAN_POND':
                return 'Rửa ao';
            case 'SUN_DRY_POND':
                return 'Phơi ao';
            case 'TROUBLESHOOTING':
                return 'Xử lý sự cố';
            default:
                return 'Xử lý sự cố';
        }
    };

    const baseTitle = getTitle();
    const screenTitle = item ? `Chỉnh sửa ${baseTitle}` : baseTitle;

    // Load data for edit (chỉ Rửa ao / Phơi ao – incident đã load trong useHandleProblemForm)
    React.useEffect(() => {
        if (isIncident || !item) return;
        setNote(item.note || '');
        if (item.date) setSelectedDate(new Date(parseDate(item.date)));
        if (item.materials?.length) {
            const mapped = item.materials.map(im => {
                const mat = materialsFromStore.find(m => m.id === im.material.id);
                return {
                    material:
                        mat ??
                        ({
                            id: im.material.id,
                            name: im.material.name || 'Vật tư',
                            unitName: im.material.unitName || '',
                        } as IMaterial),
                    quantity: im.quantity,
                    unit: im.unit || mat?.unitName || '',
                };
            });
            setSelectedMaterials(mapped);
        }
        if (item.images?.length) setImageUris(item.images);
    }, [isIncident, item, materialsFromStore]);

    const handleSave = () => {
        if (isIncident) {
            incidentForm.handleSave(
                () => generalInfoBoxRef.current?.getUploadedIds() ?? [],
                () => generalInfoBoxRef.current?.markAsSaved()
            );
            return;
        }

        if (selectedMaterials.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn vật tư',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }
        if (!pond?.id) return;

        const currentItems = getPondJobItems(pond.id, currentJobType);
        const timeString = selectedDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const dateString = formatDate(selectedDate);
        const documentIds = generalInfoBoxRef.current?.getUploadedIds() ?? [];
        const jobData = {
            materials: selectedMaterials,
            note: note || undefined,
            images: imageUris.length > 0 ? imageUris : undefined,
            documentIds: documentIds.length > 0 ? documentIds : undefined,
        };

        if (item) {
            const updatedItems = currentItems.map(i =>
                i.id === item.id ? { ...i, time: timeString, date: dateString, ...jobData } : i
            );
            updatePondJob(pond.id, currentJobType, updatedItems);
            generalInfoBoxRef.current?.markAsSaved();
            showEditJobSuccessToast(currentJobType);
            navigation.goBack();
            return;
        }

        const newItem = {
            id: `local-${Date.now()}`,
            label: `Lần ${currentItems.length + 1}`,
            time: timeString,
            date: dateString,
            ...jobData,
        };
        updatePondJob(pond.id, currentJobType, [...currentItems, newItem]);
        generalInfoBoxRef.current?.markAsSaved();
        showAddJobSuccessToast(currentJobType);
        navigation.goBack();
    };

    const handleDelete = () => {
        if (isIncident) return incidentForm.handleDelete();
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (isIncident) return incidentForm.confirmDelete();
        if (!pond?.id || !item?.id) {
            setShowDeleteModal(false);
            return;
        }
        const currentItems = getPondJobItems(pond.id, currentJobType);
        const updatedItems = currentItems.filter(i => i.id !== item.id);
        updatePondJob(pond.id, currentJobType, updatedItems);
        setShowDeleteModal(false);
        navigation.goBack();
    };

    const isLoading = isIncident ? incidentForm.isSaving : false;

    return (
        <Loading isLoading={isLoading}>
            <View style={styles.container}>
                <HeaderFarm
                    type="simple"
                    title={screenTitle}
                    onBack={() => navigation.goBack()}
                    rightAction={
                        item ? (
                            <TouchableOpacity
                                onPress={handleDelete}
                                style={styles.headerDeleteButton}
                            >
                                <DeleteIcon width={20} height={20} color={colors.red[900]} />
                            </TouchableOpacity>
                        ) : null
                    }
                />

                <SafeInputLayout>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* 1. Thông tin chung (images: same logic as shrimp health – documentIds + resolve for display) */}
                        <GeneralInfoBox
                            ref={generalInfoBoxRef}
                            type="withImage"
                            date={selectedDateVal}
                            onDateChange={setSelectedDateVal}
                            imageUris={imageUrisVal}
                            onImagesChange={setImageUrisVal}
                            documentIds={item?.documentIds}
                            disabledDate={true}
                        />
                        {/* 2. Chọn vật tư */}
                        <MaterialSelectionBox
                            selectedMaterials={selectedMaterialsVal}
                            onMaterialsChange={setSelectedMaterialsVal}
                            materials={materials}
                        />

                        {/* 3. Ghi chú (Mô tả sự cố) */}
                        <SelectionNotesBox
                            notes={noteVal}
                            onNotesChange={setNoteVal}
                            scrollViewRef={scrollViewRef}
                        />

                        <View style={styles.spacer} />
                    </ScrollView>
                </SafeInputLayout>

                <ButtonBarFarm
                    primaryTitle={item ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleSave}
                    onSecondaryPress={() => navigation.goBack()}
                    style={{ borderTopWidth: 1, borderTopColor: colors.border }}
                />

                <DatePickerModal
                    visible={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    date={selectedDateVal}
                    onSelectDate={d => {
                        const newDate = new Date(selectedDateVal);
                        newDate.setFullYear(d.getFullYear());
                        newDate.setMonth(d.getMonth());
                        newDate.setDate(d.getDate());
                        setSelectedDateVal(newDate);
                    }}
                />
                <ConfirmationDeleteModal
                    visible={showDeleteModalVal}
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteModalVal(false)}
                />
            </View>
        </Loading>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundPrimary },
    scrollContent: { paddingBottom: 100 },

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
    spacer: { height: 80 },
});
