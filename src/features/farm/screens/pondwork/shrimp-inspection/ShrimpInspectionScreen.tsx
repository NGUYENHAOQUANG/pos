import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { useFarm } from '@/features/farm/context/FarmContext';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { ShrimpInspectionFoodCheckBox } from '@/features/farm/components/pondwork/shrimp-inspection/ShrimpInspectionFoodCheckBox';
import { ShrimpInspectionObservationBox } from '@/features/farm/components/pondwork/shrimp-inspection/ShrimpInspectionObservationBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { IconTrashOutlined } from '@/assets/icons';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { ShrimpInspectionMeta } from '@/features/farm/types/farm.types';
import { formatDate, parseDate } from '@/features/farm/utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'ShrimpInspectionScreen'>;

export const ShrimpInspectionScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond, itemToEdit } = route.params || {};
    const insets = useSafeAreaInsets();
    const { setTabBarVisible } = useTabBarVisibility();
    const { getPondJobItems, updatePondJob } = useFarm();

    const meta = useMemo(
        () => (itemToEdit?.meta as ShrimpInspectionMeta) || ({} as ShrimpInspectionMeta),
        [itemToEdit?.meta]
    );
    const [selectedDate, setSelectedDate] = useState(
        itemToEdit?.date ? parseDate(itemToEdit.date) : new Date()
    );
    const [foodAmount, setFoodAmount] = useState(meta.foodAmount || '');
    const [leftoverFood, setLeftoverFood] = useState(meta.leftoverFood || 'Hết');
    const [intestine, setIntestine] = useState(meta.intestine || 'Đầy');
    const [intestineColor, setIntestineColor] = useState(meta.intestineColor || 'Màu thức ăn');
    const [stoolColor, setStoolColor] = useState(meta.stoolColor || 'Màu thức ăn');
    const [liver, setLiver] = useState(meta.liver || 'Bình thường');
    const [notes, setNotes] = useState(itemToEdit?.note || '');
    const [imageUris, setImageUris] = useState<string[]>(meta.images || []);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // Store initial data for comparison when editing
    const initialData = useMemo(() => {
        if (!itemToEdit) return null;
        return {
            date: itemToEdit.date ? parseDate(itemToEdit.date) : new Date(),
            foodAmount: meta.foodAmount || '',
            leftoverFood: meta.leftoverFood || 'Hết',
            intestine: meta.intestine || 'Đầy',
            intestineColor: meta.intestineColor || 'Màu thức ăn',
            stoolColor: meta.stoolColor || 'Màu thức ăn',
            liver: meta.liver || 'Bình thường',
            notes: itemToEdit?.note || '',
            images: meta.images || [],
        };
    }, [itemToEdit, meta]);

    // Hide tab bar when this screen is mounted
    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleSave = () => {
        if (pond?.id) {
            const currentItems = getPondJobItems(pond.id, 'SHRIMP_INSPECTION');
            const timeString = selectedDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            });

            const itemData = {
                label: itemToEdit?.label || `Lần ${currentItems.length + 1}`,
                time: timeString,
                date: formatDate(selectedDate),
                note: notes || undefined,
                meta: {
                    foodAmount,
                    leftoverFood,
                    intestine,
                    intestineColor,
                    stoolColor,
                    liver,
                    images: imageUris,
                },
            };

            if (itemToEdit) {
                // Update existing item
                const updatedItems = currentItems.map(item =>
                    item.id === itemToEdit.id ? { ...item, ...itemData } : item
                );
                updatePondJob(pond.id, 'SHRIMP_INSPECTION', updatedItems);
                showEditJobSuccessToast('SHRIMP_INSPECTION');
            } else {
                // Create new item
                const nextIndex = currentItems.length + 1;
                const newItem = {
                    id: Date.now().toString(),
                    ...itemData,
                    label: `Lần ${nextIndex}`,
                    pondId: pond.id,
                };
                updatePondJob(pond.id, 'SHRIMP_INSPECTION', [...currentItems, newItem]);
                showAddJobSuccessToast('SHRIMP_INSPECTION');
            }
        }

        navigation.goBack();
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const handleDeletePress = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (pond?.id && itemToEdit) {
            const currentItems = getPondJobItems(pond.id, 'SHRIMP_INSPECTION');
            const updatedItems = currentItems.filter(item => item.id !== itemToEdit.id);
            updatePondJob(pond.id, 'SHRIMP_INSPECTION', updatedItems);
            setDeleteModalVisible(false);
            navigation.goBack();
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
    };

    // Check if form is filled completely (foodAmount is required only when creating new)
    const isFormComplete = itemToEdit ? true : foodAmount.trim().length > 0;

    // Check if data has changed from initial (when editing)
    const hasChanges = useMemo(() => {
        if (!itemToEdit || !initialData) return true; // New item always has "changes"

        // Compare dates (only date part, not time)
        const currentDateStr = selectedDate.toDateString();
        const initialDateStr = initialData.date.toDateString();
        if (currentDateStr !== initialDateStr) return true;

        // Compare other fields
        if (foodAmount !== initialData.foodAmount) return true;
        if (leftoverFood !== initialData.leftoverFood) return true;
        if (intestine !== initialData.intestine) return true;
        if (intestineColor !== initialData.intestineColor) return true;
        if (stoolColor !== initialData.stoolColor) return true;
        if (liver !== initialData.liver) return true;
        if (notes !== initialData.notes) return true;

        // Compare images array
        if (imageUris.length !== initialData.images.length) return true;
        const imagesChanged = imageUris.some((uri, index) => uri !== initialData.images[index]);
        if (imagesChanged) return true;

        return false;
    }, [
        itemToEdit,
        initialData,
        selectedDate,
        foodAmount,
        leftoverFood,
        intestine,
        intestineColor,
        stoolColor,
        liver,
        notes,
        imageUris,
    ]);

    const isButtonDisabled = !isFormComplete || (itemToEdit && !hasChanges);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kiểm tra tôm</Text>
                {itemToEdit ? (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
                        <IconTrashOutlined width={18} height={18} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent]}>
                {/* Thông tin chung Box */}
                <GeneralInfoBox
                    date={selectedDate}
                    onDateChange={setSelectedDate}
                    type="withImage"
                    imageUris={imageUris}
                    onImagesChange={setImageUris}
                    disabledDate={true}
                />

                {/* Kiểm tra thức ăn Box */}
                <ShrimpInspectionFoodCheckBox
                    foodAmount={foodAmount}
                    onFoodAmountChange={setFoodAmount}
                    leftoverFood={leftoverFood}
                    onLeftoverFoodChange={setLeftoverFood}
                />

                {/* Quan sát mẫu Box */}
                <ShrimpInspectionObservationBox
                    intestine={intestine}
                    onIntestineChange={setIntestine}
                    intestineColor={intestineColor}
                    onIntestineColorChange={setIntestineColor}
                    stoolColor={stoolColor}
                    onStoolColorChange={setStoolColor}
                    liver={liver}
                    onLiverChange={setLiver}
                />

                {/* Ghi chú Box */}
                <SelectionNotesBox notes={notes} onNotesChange={setNotes} />
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleSave}
                    onSecondaryPress={handleCancel}
                    primaryDisabled={itemToEdit ? isButtonDisabled : false}
                />
            </View>

            {/* Delete Confirmation Modal */}
            <ConfirmationDeleteModal
                visible={deleteModalVisible}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 0,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
