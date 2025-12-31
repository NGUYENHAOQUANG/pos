import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { GeneralInfoBox } from '../../components/pondwork/GeneralInfoBox';
import { MaterialSelectionBox } from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { DatePickerModal } from '@/features/home/components/DatePickerModal';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';

import { useFarm } from '@/features/farm/context/FarmContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { IMaterial } from '@/features/material/types/material.types';
import DeleteIcon from '@/assets/Icon/IconFarm/Delete.svg';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { formatDate, parseDate } from '@/features/farm/utils/dateUtils';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';

// Mock Data
const MOCK_MATERIALS: IMaterial[] = [
    { id: '1', name: 'Vi sinh xử lý đáy', group: 'Xử lý', unit: 'lít', remaining: 10 },
    { id: '2', name: 'Vôi bột', group: 'Xử lý', unit: 'kg', remaining: 50 },
    { id: '3', name: 'Yucca', group: 'Cấp cứu', unit: 'lít', remaining: 5 },
];

type ScreenRouteProp = RouteProp<FarmStackParamList, 'HandleProblem'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const HandleProblemScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const insets = useSafeAreaInsets();

    const { pond, item, jobType = 'CLEAN_POND' } = route.params || {};
    const { updatePondJob, getPondJobItems } = useFarm();

    // Determine job type and title
    const currentJobType: JobType = jobType as JobType;
    const screenTitle = item ? 'Chỉnh sửa Xử lý sự cố' : 'Xử lý sự cố';

    // State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedMaterials, setSelectedMaterials] = useState<
        Array<{ material: IMaterial; quantity: number; unit: string }>
    >([]);
    const [note, setNote] = useState('');
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Load Data for Edit
    useEffect(() => {
        if (item) {
            if (item.date) {
                setSelectedDate(parseDate(item.date));
            }
            setNote(item.note || '');
            if (item.materials) {
                setSelectedMaterials(item.materials);
            }
            // Load images if any
            if (item.images) {
                setImageUris(item.images);
            }
        }
    }, [item]);

    const handleSave = () => {
        if (!pond?.id) return;

        const currentItems = getPondJobItems(pond.id, currentJobType);
        const timeString = selectedDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const dateString = formatDate(selectedDate);

        const jobData = {
            materials: selectedMaterials,
            note: note || undefined,
            images: imageUris.length > 0 ? imageUris : undefined,
        };

        if (item) {
            // UPDATE
            const updatedItems = currentItems.map(i =>
                i.id === item.id ? { ...i, time: timeString, date: dateString, ...jobData } : i
            );
            updatePondJob(pond.id, currentJobType, updatedItems);
            showEditJobSuccessToast(currentJobType);
        } else {
            // CREATE
            let maxIndex = 0;
            currentItems.forEach(i => {
                const match = i.label.match(/Lần (\d+)/);
                if (match) {
                    const idx = parseInt(match[1], 10);
                    if (idx > maxIndex) maxIndex = idx;
                }
            });
            const nextIndex = maxIndex + 1;

            const newItem = {
                id: Date.now().toString(),
                label: `Lần ${nextIndex}`,
                time: timeString,
                date: dateString,
                pondId: pond.id,
                ...jobData,
            };
            updatePondJob(pond.id, currentJobType, [...currentItems, newItem]);
            showAddJobSuccessToast(currentJobType);
        }
        navigation.goBack();
    };

    const handleDelete = () => setShowDeleteModal(true);

    const confirmDelete = () => {
        if (pond?.id && item?.id) {
            const currentItems = getPondJobItems(pond.id, currentJobType);
            const updatedItems = currentItems.filter(i => i.id !== item.id);
            updatePondJob(pond.id, currentJobType, updatedItems);
            navigation.goBack();
        }
        setShowDeleteModal(false);
    };

    return (
        <View style={styles.container}>
            <HeaderFarm
                type="simple"
                title={screenTitle}
                onBack={() => navigation.goBack()}
                rightAction={
                    item ? (
                        <TouchableOpacity onPress={handleDelete} style={styles.headerDeleteButton}>
                            <DeleteIcon width={20} height={20} color={colors.red[900]} />
                        </TouchableOpacity>
                    ) : null
                }
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Thông tin chung */}
                <GeneralInfoBox
                    type="withImage"
                    date={selectedDate}
                    onDateChange={setSelectedDate}
                    imageUris={imageUris}
                    onImagesChange={setImageUris}
                    disabledDate={true}
                />
                {/* 2. Chọn vật tư */}
                <MaterialSelectionBox
                    selectedMaterials={selectedMaterials}
                    onMaterialsChange={setSelectedMaterials}
                    materials={MOCK_MATERIALS}
                />

                {/* 3. Ghi chú (Mô tả sự cố) */}
                <SelectionNotesBox notes={note} onNotesChange={setNote} />

                <View style={styles.spacer} />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Huỷ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>
                        {item ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    </Text>
                </TouchableOpacity>
            </View>

            <DatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                date={selectedDate}
                onSelectDate={d => {
                    const newDate = new Date(selectedDate);
                    newDate.setFullYear(d.getFullYear());
                    newDate.setMonth(d.getMonth());
                    newDate.setDate(d.getDate());
                    setSelectedDate(newDate);
                }}
            />
            <ConfirmationDeleteModal
                visible={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundPrimary },
    scrollContent: { paddingBottom: spacing.md },
    footer: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray[100],
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray[300],
        marginRight: spacing.md,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: { fontSize: 14, fontWeight: '500', color: colors.text },
    saveButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: { fontSize: 14, fontWeight: '600', color: colors.white },
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
