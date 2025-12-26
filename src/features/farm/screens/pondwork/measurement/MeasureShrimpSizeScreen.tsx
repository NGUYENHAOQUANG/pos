import React, { useState, useEffect } from 'react';
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
    const { updatePondJob, getPondJobItems } = useFarm();

    const { itemToEdit, pond: routePond } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();
    const insets = useSafeAreaInsets();

    const currentPond = routePond;

    // --- State ---
    const [time, setTime] = useState(itemToEdit?.date ? new Date(itemToEdit.date) : new Date());
    const [imageUris, setImageUris] = useState<string[]>(itemToEdit?.images || []);
    const meta = itemToEdit?.meta as
        | { shrimpSize?: string; remainingWeight?: string; notes?: string; images?: string[] }
        | undefined;
    const [shrimpSize, setShrimpSize] = useState(meta?.shrimpSize || '');
    const [remainingWeight, setRemainingWeight] = useState(meta?.remainingWeight || '');
    const [notes, setNotes] = useState(meta?.notes || '');
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

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
        const totalShrimp = !isNaN(size) && !isNaN(weight) ? size * weight : null;
        const survivalRate = null; // Survival rate calculation can be added when initialShrimpCount is available

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
            const nextIndex = currentItems.length + 1;
            const newItem = {
                id: Date.now().toString(),
                label: `Lần ${nextIndex}`,
                ...itemData,
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

        // Re-label items after deletion to maintain sequence (e.g., Lần 1, Lần 2)
        const relabeledItems = updatedItems.map((item, index) => ({
            ...item,
            label: `Lần ${index + 1}`,
        }));

        updatePondJob(currentPond.id, 'MEASURE_SIZE', relabeledItems);

        setIsDeleteModalVisible(false);
        Toast.show({ type: 'success', text1: 'Đã xóa tác vụ thành công' });
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
                />
                <MeasurementDataBox
                    shrimpSize={shrimpSize}
                    onShrimpSizeChange={setShrimpSize}
                    remainingWeight={remainingWeight}
                    onRemainingWeightChange={setRemainingWeight}
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
        backgroundColor: '#F5F5F5',
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
