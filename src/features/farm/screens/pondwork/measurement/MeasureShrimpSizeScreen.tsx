import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { MeasurementDataBox } from '@/features/farm/components/pondwork/measurement/MeasurementDataBox';
import { useFarm } from '@/features/farm/context/FarmContext';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { IconTrashOutlined } from '@/assets/icons';

type MeasureShrimpSizeScreenRouteProp = RouteProp<FarmStackParamList, 'MeasureShrimpSizeScreen'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const MeasureShrimpSizeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<MeasureShrimpSizeScreenRouteProp>();
    // Correctly destructure only the needed functions
    const { updatePondJob, getPondJobItems, activeCycles, getCyclesByPondId } = useFarm();

    const { itemToEdit, pond: routePond } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();
    const insets = useSafeAreaInsets();

    const currentPond = routePond;

    // Get stocking quantity from cycle data
    const stockingQuantity = useMemo(() => {
        if (!currentPond?.id) return undefined;
        const currentCycle = activeCycles[currentPond.id];
        const cyclesForPond = getCyclesByPondId(currentPond.id);

        // Ưu tiên cycle từ activeCycles, nếu không có thì tìm trong cycles
        const cycle =
            currentCycle ||
            cyclesForPond.find(cycle => cycle.receivingPonds?.includes(currentPond.id)) ||
            cyclesForPond[0];

        return cycle?.stockingQuantity ? Number(cycle.stockingQuantity) : undefined;
    }, [currentPond?.id, activeCycles, getCyclesByPondId]);

    // --- State ---
    const meta = itemToEdit?.meta as
        | {
              shrimpSize?: string;
              remainingWeight?: string;
              notes?: string;
              images?: string[];
              date?: string;
          }
        | undefined;

    const [time, setTime] = useState(new Date());
    const [imageUris, setImageUris] = useState<string[]>(meta?.images || []);
    const [shrimpSize, setShrimpSize] = useState(meta?.shrimpSize || '');
    const [remainingWeight, setRemainingWeight] = useState(meta?.remainingWeight || '');
    const [notes, setNotes] = useState(meta?.notes || '');
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // Real-time validation
    useEffect(() => {
        if (!stockingQuantity || !shrimpSize || !remainingWeight) return;

        const size = parseFloat(shrimpSize);
        const weight = parseFloat(remainingWeight);

        if (isNaN(size) || isNaN(weight)) return;

        const totalShrimp = Math.round(size * weight);

        if (totalShrimp > stockingQuantity) {
            Toast.show({
                type: 'error',
                text1: 'Vượt quá số lượng thả ban đầu',
            });
            return;
        }

        const calculatedSurvivalRate = Math.round((totalShrimp / stockingQuantity) * 100);
        if (calculatedSurvivalRate > 100) {
            Toast.show({
                type: 'error',
                text1: 'Tỉ lệ sống vượt quá 100%',
            });
        }
    }, [shrimpSize, remainingWeight, stockingQuantity]);

    const handleSave = () => {
        if (!shrimpSize || !remainingWeight) {
            Toast.show({ type: 'error', text1: 'Vui lòng nhập đủ thông tin bắt buộc' });
            return;
        }
        if (!currentPond?.id) {
            Toast.show({ type: 'error', text1: 'Không tìm thấy thông tin ao' });
            return;
        }

        const size = parseFloat(shrimpSize);
        const weight = parseFloat(remainingWeight);
        const totalShrimp = !isNaN(size) && !isNaN(weight) ? Math.round(size * weight) : null;

        // Calculate survival rate: (Số con thu / Số con thả ban đầu) × 100
        let survivalRate: number | null = null;
        if (totalShrimp !== null && stockingQuantity && stockingQuantity > 0) {
            survivalRate = Math.round((totalShrimp / stockingQuantity) * 100);
        }

        // Validation: Tổng số tôm hiện tại không được lớn hơn số lượng thả ban đầu
        if (totalShrimp !== null && stockingQuantity && totalShrimp > stockingQuantity) {
            Toast.show({
                type: 'error',
                text1: 'Không thể lưu vui lòng kiểm tra lại',
            });
            return;
        }

        // Validation: Tỉ lệ sống không được vượt quá 100%
        if (survivalRate !== null && survivalRate > 100) {
            Toast.show({
                type: 'error',
                text1: 'Không thể lưu vui lòng kiểm tra lại',
            });
            return;
        }

        const timeString = time.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });

        const itemData = {
            time: timeString,
            meta: {
                date: time.toISOString(),
                shrimpSize,
                remainingWeight,
                totalShrimpCount: totalShrimp,
                survivalRate,
                notes,
                images: imageUris,
            },
        };

        const currentItems = getPondJobItems(currentPond.id, 'MEASURE_SIZE');

        if (itemToEdit) {
            const updatedItems = currentItems.map(item =>
                item.id === itemToEdit.id ? { ...item, ...itemData } : item
            );
            updatePondJob(currentPond.id, 'MEASURE_SIZE', updatedItems);
            Toast.show({ type: 'success', text1: 'Đã cập nhật thành công' });
        } else {
            // Find the max index from existing "Lần X" labels
            const maxIndex = currentItems.reduce((max, item) => {
                const match = item.label.match(/Lần\s+(\d+)/);
                if (match && match[1]) {
                    const num = parseInt(match[1], 10);
                    return num > max ? num : max;
                }
                return max;
            }, 0);

            const nextIndex = maxIndex + 1;
            const newItem = {
                id: Date.now().toString(),
                label: `Lần ${nextIndex}`,
                ...itemData,
                pondId: currentPond.id,
            };
            updatePondJob(currentPond.id, 'MEASURE_SIZE', [...currentItems, newItem]);
            Toast.show({ type: 'success', text1: 'Đã đo kích thước tôm thành công' });
        }

        navigation.goBack();
    };

    // Correct delete logic using the "get, filter, update" pattern
    const handleDelete = () => {
        if (!currentPond?.id || !itemToEdit?.id) return;

        const currentItems = getPondJobItems(currentPond.id, 'MEASURE_SIZE');
        const updatedItems = currentItems.filter(item => item.id !== itemToEdit.id);

        updatePondJob(currentPond.id, 'MEASURE_SIZE', updatedItems);

        setIsDeleteModalVisible(false);
        Toast.show({ type: 'success', text1: 'Tác vụ đã được xóa' });
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {itemToEdit ? 'Chỉnh sửa đo kích thước' : 'Đo kích thước tôm'}
                </Text>
                {itemToEdit ? (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => setIsDeleteModalVisible(true)}
                    >
                        <IconTrashOutlined width={18} height={18} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <GeneralInfoBox
                    type="withImage"
                    date={time}
                    onDateChange={setTime}
                    imageUris={imageUris}
                    onImagesChange={setImageUris}
                    disabledDate={true}
                />
                <MeasurementDataBox
                    shrimpSize={shrimpSize}
                    onShrimpSizeChange={setShrimpSize}
                    remainingWeight={remainingWeight}
                    onRemainingWeightChange={setRemainingWeight}
                    stockingQuantity={stockingQuantity}
                />
                <SelectionNotesBox notes={notes} onNotesChange={setNotes} />
            </ScrollView>

            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleSave}
                    onSecondaryPress={navigation.goBack}
                />
            </View>

            <ConfirmationDeleteModal
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                onConfirm={handleDelete}
                title="Xoá tác vụ"
                message="Bạn có chắc chắn muốn xoá tác vụ này không?"
                confirmText="Đồng ý"
                cancelText="Không"
                successMessage="Đã xoá tác vụ thành công"
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
        borderBottomColor: colors.borderLight,
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
