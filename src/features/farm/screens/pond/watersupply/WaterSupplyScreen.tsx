import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { WaterSupplyInfoBox } from '@/features/farm/components/pondwork/watersupply/WaterSupplyInfoBox';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { MaterialSelectionBox } from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { useFarm } from '@/features/farm/store/farmStore';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { WaterSupplyMeta } from '@/features/farm/types/farm.types';
import { IMaterial } from '@/features/material/types/material.types';
import DeleteIcon from '@/assets/Icon/IconFarm/Delete.svg';

// Mock data vật tư
const MOCK_MATERIALS: IMaterial[] = [
    { id: '1', name: 'Zeolite', group: 'Khoáng', unit: 'kg', remaining: 50 },
    { id: '2', name: 'Chlorine 70% Granules', group: 'Diệt khuẩn', unit: 'kg', remaining: 20 },
    { id: '3', name: 'Vôi nóng', group: 'Xử lý', unit: 'kg', remaining: 100 },
];

type ScreenRouteProp = RouteProp<FarmStackParamList, 'WaterSupply'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const WaterSupplyScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();

    const { pond, item } = route.params || {};
    const { updatePondJob, getPondJobItems } = useFarm();

    const [selectedDate, setSelectedDate] = useState(new Date());

    // Thông số nước
    const [targetLevel, setTargetLevel] = useState(''); // H_target
    const [supplyLevel, setSupplyLevel] = useState(''); // H_add

    // Vật tư & Ghi chú
    const [selectedMaterials, setSelectedMaterials] = useState<
        Array<{ material: IMaterial; quantity: number; unit: string }>
    >([]);
    const [note, setNote] = useState('');
    const [imageUris, setImageUris] = useState<string[]>([]);

    // Modal Delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // --- Load Data khi Edit ---
    useEffect(() => {
        if (item) {
            // Do not setSelectedDate from item.date/time, keep as current time (new Date())

            const meta = (item.meta as WaterSupplyMeta) || ({} as WaterSupplyMeta);
            setTargetLevel(meta?.targetLevel?.toString() || '');
            setSupplyLevel(meta?.supplyLevel?.toString() || '');
            setNote(item.note || '');
            if (item.materials) {
                setSelectedMaterials(item.materials);
            }
        }
    }, [item]);

    // ---LOGIC TÍNH TOÁN THEO CÔNG THỨC---
    const calculateInfo = useMemo(() => {
        // 1. Kiểm tra nếu chưa nhập liệu thì trả về '-'
        if (targetLevel === '' || supplyLevel === '') {
            return {
                drainLevel: '-',
                volumeAfterDrain: '-',
                volumeSupply: '-',
                volumeAfterSupply: '-',
            };
        }

        // 2. Lấy dữ liệu đầu vào
        const H_target = parseFloat(targetLevel);
        const H_add = parseFloat(supplyLevel);

        // Xác định Diện tích ao (S)
        let S = 1000; // Giá trị mặc định
        if (pond?.area) {
            const areaStr = String(pond.area).replace(/[^0-9.]/g, '');
            const parsedArea = parseFloat(areaStr);
            if (!isNaN(parsedArea) && parsedArea > 0) {
                S = parsedArea;
            }
        }

        // 3. Áp dụng công thức
        // H_base = H_target - H_add
        const H_base = H_target - H_add;

        // V_base = S * (H_base / 100)
        const V_base = S * (H_base / 100);

        // V_add = S * (H_add / 100)
        const V_add = S * (H_add / 100);

        // V_total = S * (H_target / 100)
        const V_total = S * (H_target / 100);

        return {
            // Mực nước xả xuống (cm)
            drainLevel: H_base >= 0 ? H_base.toString() : '0',

            // Thể tích sau xả (m3)
            volumeAfterDrain: V_base > 0 ? V_base.toFixed(0) : '0',

            // Thể tích nước cấp vào (m3)
            volumeSupply: V_add.toFixed(0),

            // Thể tích nước sau cấp (m3)
            volumeAfterSupply: V_total.toFixed(0),
        };
    }, [targetLevel, supplyLevel, pond]);

    // const handleDateSelect = (date: Date) => {
    //   const newDate = new Date(selectedDate);
    //   newDate.setFullYear(date.getFullYear());
    //   newDate.setMonth(date.getMonth());
    //   newDate.setDate(date.getDate());
    //   setSelectedDate(newDate);
    // };

    const handleSave = () => {
        if (!targetLevel || !supplyLevel) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập đầy đủ thông tin mực nước',
                position: 'top',
                visibilityTime: 3000,
            });
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

        const currentItems = getPondJobItems(pond.id, 'WATER_CHANGE');
        const timeString = selectedDate.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const dateString = selectedDate.toLocaleDateString('vi-VN'); // dd/mm/yyyy

        const itemData = {
            time: timeString,
            date: dateString,
            note: note || undefined,
            materials: selectedMaterials,
            meta: {
                targetLevel: targetLevel || undefined,
                supplyLevel: supplyLevel || undefined,
                drainLevel: calculateInfo.drainLevel !== '-' ? calculateInfo.drainLevel : undefined,
                volumeAfterDrain:
                    calculateInfo.volumeAfterDrain !== '-'
                        ? calculateInfo.volumeAfterDrain
                        : undefined,
                volumeSupply:
                    calculateInfo.volumeSupply !== '-' ? calculateInfo.volumeSupply : undefined,
                volumeAfterSupply:
                    calculateInfo.volumeAfterSupply !== '-'
                        ? calculateInfo.volumeAfterSupply
                        : undefined,
            },
        };

        if (item) {
            // UPDATE
            const updatedItems = currentItems.map(i =>
                i.id === item.id ? { ...i, ...itemData } : i
            );
            updatePondJob(pond.id, 'WATER_CHANGE', updatedItems);
            showEditJobSuccessToast('WATER_CHANGE');
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
                ...itemData,
                pondId: pond.id,
            };
            updatePondJob(pond.id, 'WATER_CHANGE', [...currentItems, newItem]);
            showAddJobSuccessToast('WATER_CHANGE');
        }

        navigation.goBack();
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (pond?.id && item?.id) {
            const currentItems = getPondJobItems(pond.id, 'WATER_CHANGE');
            const updatedItems = currentItems.filter(i => i.id !== item.id);
            updatePondJob(pond.id, 'WATER_CHANGE', updatedItems);
            navigation.goBack();
        }
        setShowDeleteModal(false);
    };

    const renderHeaderRight = () =>
        item ? (
            <TouchableOpacity onPress={handleDelete} style={styles.headerDeleteButton}>
                <DeleteIcon width={20} height={20} color={colors.red[900]} />
            </TouchableOpacity>
        ) : null;

    return (
        <View style={styles.container}>
            <HeaderFarm
                type="simple"
                title={item ? 'Chỉnh sửa Thay/Cấp nước' : 'Thay/Cấp nước'}
                onBack={() => navigation.goBack()}
                rightAction={renderHeaderRight()}
            />

            <View style={styles.contentContainer}>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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

                    {/* 2. Mực nước & Thể tích */}
                    <WaterSupplyInfoBox
                        targetLevel={targetLevel}
                        onTargetLevelChange={setTargetLevel}
                        supplyLevel={supplyLevel}
                        onSupplyLevelChange={setSupplyLevel}
                        // Truyền các giá trị đã tính toán
                        drainLevel={calculateInfo.drainLevel}
                        volumeAfterDrain={calculateInfo.volumeAfterDrain}
                        volumeSupply={calculateInfo.volumeSupply}
                        volumeAfterSupply={calculateInfo.volumeAfterSupply}
                    />

                    {/* 3. Chọn vật tư */}
                    <MaterialSelectionBox
                        selectedMaterials={selectedMaterials}
                        onMaterialsChange={setSelectedMaterials}
                        materials={MOCK_MATERIALS}
                    />

                    {/* 4. Ghi chú */}
                    <SelectionNotesBox
                        notes={note}
                        onNotesChange={setNote}
                        scrollViewRef={scrollViewRef}
                    />

                    <View style={styles.spacer} />
                </ScrollView>
            </View>

            {/* Footer */}
            <ButtonBarFarm
                primaryTitle={item ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSave}
                onSecondaryPress={() => navigation.goBack()}
                style={{ borderTopWidth: 1, borderTopColor: colors.border }}
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
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.md,
    },
    section: {
        backgroundColor: colors.white,
        padding: spacing.md,
        marginTop: spacing.sm,
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: spacing.xs,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    required: {
        color: colors.error,
    },
    noteInput: {
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: borderRadius.sm,
        padding: spacing.md,
        minHeight: 100,
        fontSize: 14,
        color: colors.text,
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
    spacer: {
        height: 80,
    },
});
