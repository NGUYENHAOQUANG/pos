import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { HarvestDataBox } from '@/features/farm/components/pondwork/harvest/HarvestDataBox';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { IconTrashOutlined } from '@/assets/icons';
import { useFarm } from '@/features/farm/store/farmStore';
import { HarvestMeta } from '@/features/farm/types/farm.types';
import { getHarvestSuccessMessage } from '@/features/farm/utils/toastMessages';
import Toast from 'react-native-toast-message';
import { formatDate, parseDate } from '@/features/farm/utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'AddHarvestScreen'>;

export const AddHarvestScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond, itemToEdit } = route.params || {};
    const insets = useSafeAreaInsets();
    const { setTabBarVisible } = useTabBarVisibility();
    const {
        getPondJobItems,
        updatePondJob,
        deleteActiveCycle,
        deleteCycle,
        activeCycles,
        getCyclesByPondId,
    } = useFarm();

    // Initialize state from itemToEdit if available
    const meta = useMemo(() => (itemToEdit?.meta as HarvestMeta) || {}, [itemToEdit?.meta]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [notes, setNotes] = useState<string>(itemToEdit?.note || '');
    const [harvestType, setHarvestType] = useState<string>(meta.harvestType || 'Thu hết');
    const [yieldAmount, setYieldAmount] = useState<string>(meta.yieldAmount || '');
    const [shrimpSize, setShrimpSize] = useState<string>(meta.shrimpSize || '');
    const [referencePrice, setReferencePrice] = useState<string>(meta.referencePrice || '');

    // Harvest type options
    const harvestTypeOptions = ['Thu hết', 'Thu tỉa', 'Đóng chu kỳ'];

    // Store initial data for comparison when editing
    const initialData = useMemo(() => {
        if (!itemToEdit) return null;
        return {
            date: (() => {
                const date = itemToEdit.date ? parseDate(itemToEdit.date) : new Date();
                if (itemToEdit.date && itemToEdit.time) {
                    const [hours, minutes] = itemToEdit.time.split(':').map(Number);
                    if (!isNaN(hours) && !isNaN(minutes)) {
                        date.setHours(hours, minutes);
                    }
                }
                return date;
            })(),
            notes: itemToEdit?.note || '',
            harvestType: meta.harvestType || 'Thu hết',
            yieldAmount: meta.yieldAmount || '',
            shrimpSize: meta.shrimpSize || '',
            referencePrice: meta.referencePrice || '',
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

    const handleCancel = () => {
        navigation.goBack();
    };

    const handleDeletePress = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (pond?.id && itemToEdit) {
            const currentItems = getPondJobItems(pond.id, 'HARVEST');
            const updatedItems = currentItems.filter(item => item.id !== itemToEdit.id);
            updatePondJob(pond.id, 'HARVEST', updatedItems);
            setDeleteModalVisible(false);
            navigation.goBack();
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
    };

    // Check if data has changed from initial (when editing)
    const hasChanges = useMemo(() => {
        if (!itemToEdit || !initialData) return true; // New item always has "changes"

        // Compare dates (only date part, not time)
        const currentDateStr = selectedDate.toDateString();
        const initialDateStr = initialData.date.toDateString();
        if (currentDateStr !== initialDateStr) return true;

        // Compare notes
        if (notes !== initialData.notes) return true;

        // Compare harvestType
        if (harvestType !== initialData.harvestType) return true;

        // Compare harvest data
        if (yieldAmount !== initialData.yieldAmount) return true;
        if (shrimpSize !== initialData.shrimpSize) return true;
        if (referencePrice !== initialData.referencePrice) return true;

        return false;
    }, [
        itemToEdit,
        initialData,
        selectedDate,
        notes,
        harvestType,
        yieldAmount,
        shrimpSize,
        referencePrice,
    ]);

    const isButtonDisabled = itemToEdit && !hasChanges;

    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
    const [confirmationModalType, setConfirmationModalType] = useState<
        'harvest_full' | 'harvest_close_cycle' | null
    >(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const handleSavePress = () => {
        // Show confirmation modal if harvestType is 'Thu hết' or 'Đóng chu kỳ' and it's a new item
        if (harvestType === 'Thu hết' && !itemToEdit) {
            setConfirmationModalType('harvest_full');
            setIsConfirmationModalVisible(true);
        } else if (harvestType === 'Đóng chu kỳ' && !itemToEdit) {
            setConfirmationModalType('harvest_close_cycle');
            setIsConfirmationModalVisible(true);
        } else {
            handleSave();
        }
    };

    const handleConfirmSave = () => {
        const currentType = confirmationModalType;
        setIsConfirmationModalVisible(false);
        setConfirmationModalType(null);

        // Nếu là "Đóng chu kỳ", xóa chu kỳ hiện tại trước khi lưu
        if (currentType === 'harvest_close_cycle' && pond?.id) {
            // Tìm cycle đang active cho pond này
            const currentCycle = activeCycles[pond.id];
            const cyclesForPond = getCyclesByPondId(pond.id);

            // Ưu tiên cycle từ activeCycles, nếu không có thì tìm trong cycles
            const cycleToDelete =
                currentCycle ||
                cyclesForPond.find(cycle => cycle.receivingPonds?.includes(pond.id)) ||
                cyclesForPond[0];

            if (cycleToDelete && cycleToDelete.id) {
                // Xóa cycle khỏi cycles array
                deleteCycle(cycleToDelete.id);

                // Tìm tất cả các ponds có cycle này trong activeCycles và xóa chúng
                Object.keys(activeCycles).forEach(pondId => {
                    const cycleInActive = activeCycles[pondId];
                    if (cycleInActive && cycleInActive.id === cycleToDelete.id) {
                        deleteActiveCycle(pondId);
                    }
                });
            } else {
                // Fallback: xóa cycle của pond hiện tại
                deleteActiveCycle(pond.id);
            }
        }

        handleSave();
    };

    const handleCancelConfirmation = () => {
        setIsConfirmationModalVisible(false);
        setConfirmationModalType(null);
    };

    const handleSave = () => {
        if (harvestType !== 'Đóng chu kỳ') {
            if (!yieldAmount.trim()) {
                Toast.show({
                    type: 'error',
                    text1: 'Vui lòng nhập sản lượng thu hoạch',
                    position: 'top',
                    visibilityTime: 3000,
                });
                return;
            }
            if (!shrimpSize.trim()) {
                Toast.show({
                    type: 'error',
                    text1: 'Vui lòng nhập cỡ tôm thu hoạch',
                    position: 'top',
                    visibilityTime: 3000,
                });
                return;
            }
        }

        if (!pond?.id) {
            navigation.goBack();
            return;
        }

        const pondId = pond.id;
        const currentItems = getPondJobItems(pondId, 'HARVEST');

        // Time & date formatting
        const timeString = selectedDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });

        const baseData = {
            label: itemToEdit?.label || `Lần ${currentItems.length + 1}`,
            time: timeString,
            date: formatDate(selectedDate),
            note: notes || undefined,
            meta: {
                ...(itemToEdit?.meta || {}),
                harvestType,
                yieldAmount,
                shrimpSize,
                referencePrice,
            },
        };

        if (itemToEdit) {
            // Update existing HARVEST job
            const updatedItems = currentItems.map(item =>
                item.id === itemToEdit.id ? { ...item, ...baseData } : item
            );
            updatePondJob(pondId, 'HARVEST', updatedItems);
            Toast.show({
                type: 'success',
                text1: getHarvestSuccessMessage(harvestType),
                position: 'top',
                visibilityTime: 3000,
            });
        } else {
            // Create new HARVEST job with proper next index
            let maxIndex = 0;
            currentItems.forEach(item => {
                const match = item.label.match(/Lần (\d+)/);
                if (match) {
                    const index = parseInt(match[1], 10);
                    if (index > maxIndex) maxIndex = index;
                }
            });
            const nextIndex = maxIndex + 1;

            const newItem = {
                id: Date.now().toString(),
                ...baseData,
                label: `Lần ${nextIndex}`,
                pondId: pondId,
            };

            updatePondJob(pondId, 'HARVEST', [...currentItems, newItem]);
            Toast.show({
                type: 'success',
                text1: getHarvestSuccessMessage(harvestType),
                position: 'top',
                visibilityTime: 3000,
            });
        }

        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thu hoạch</Text>
                {itemToEdit ? (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
                        <IconTrashOutlined width={18} height={18} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <GeneralInfoBox
                    type="harvest"
                    date={selectedDate}
                    onDateChange={setSelectedDate}
                    activityLabel="Chọn loại thu hoạch"
                    activityOptions={harvestTypeOptions}
                    selectedActivity={harvestType}
                    onSelectActivity={setHarvestType}
                    disabledDate={true}
                />

                {/* Chỉ hiển thị số liệu thu hoạch khi không phải "Đóng chu kỳ" */}
                {harvestType !== 'Đóng chu kỳ' && (
                    <HarvestDataBox
                        yieldAmount={yieldAmount}
                        onYieldAmountChange={setYieldAmount}
                        shrimpSize={shrimpSize}
                        onShrimpSizeChange={setShrimpSize}
                        referencePrice={referencePrice}
                        onReferencePriceChange={setReferencePrice}
                    />
                )}

                <SelectionNotesBox notes={notes} onNotesChange={setNotes} />
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleSavePress}
                    onSecondaryPress={handleCancel}
                    primaryDisabled={isButtonDisabled}
                />
            </View>

            {/* Confirmation Modal for "Thu hết" and "Đóng chu kỳ" */}
            {confirmationModalType && (
                <ConfirmationModal
                    visible={isConfirmationModalVisible}
                    onConfirm={handleConfirmSave}
                    onCancel={handleCancelConfirmation}
                    type={confirmationModalType}
                />
            )}

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
