import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import {
    GeneralInfoBox,
    GeneralInfoBoxRef,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { MeasurementDataBox } from '@/features/farm/components/pondwork/measurement/MeasurementDataBox';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { useMeasureShrimpSizeForm } from '@/features/farm/hooks/sizeMeasurement/useMeasureShrimpSizeForm';

type MeasureShrimpSizeScreenRouteProp = RouteProp<FarmStackParamList, 'MeasureShrimpSizeScreen'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const MeasureShrimpSizeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<MeasureShrimpSizeScreenRouteProp>();

    const { itemToEdit, pond: routePond } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);

    const currentPond = routePond;

    // Get stocking quantity from cycle data
    // Optimized selector to get stocking quantity without re-rendering on unrelated store updates
    const stockingQuantity = useFarmStore(
        useCallback(
            state => {
                if (!currentPond?.id) return undefined;
                const currentCycle = state.activeCycles[currentPond.id];
                const cyclesForPond = state.getCyclesByPondId(currentPond.id);

                // Ưu tiên cycle từ activeCycles, nếu không có thì tìm trong cycles
                const cycle =
                    currentCycle ||
                    cyclesForPond.find(cycle => cycle.receivingPonds?.includes(currentPond.id)) ||
                    cyclesForPond[0];

                return cycle?.stockingQuantity ? Number(cycle.stockingQuantity) : undefined;
            },
            [currentPond?.id]
        )
    );

    const {
        time,
        setTime,
        shrimpSize,
        setShrimpSize,
        remainingWeight,
        setRemainingWeight,
        notes,
        setNotes,
        images,
        isDeleteModalVisible,
        setIsDeleteModalVisible,
        handleSave,
        handleDelete,
    } = useMeasureShrimpSizeForm({
        pondId: currentPond?.id,
        itemToEdit,
    });
    // ...

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const onSavePress = () => {
        const documentIds = generalInfoBoxRef.current?.getUploadedIds() || [];
        handleSave(documentIds);
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
                    <DeleteButton onPress={() => setIsDeleteModalVisible(true)} />
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </View>

            <SafeInputLayout>
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <GeneralInfoBox
                        ref={generalInfoBoxRef}
                        type="withImage"
                        date={time}
                        onDateChange={setTime}
                        imageUris={images}
                        disabledDate={true}
                    />
                    <MeasurementDataBox
                        shrimpSize={shrimpSize}
                        onShrimpSizeChange={setShrimpSize}
                        remainingWeight={remainingWeight}
                        onRemainingWeightChange={setRemainingWeight}
                        stockingQuantity={stockingQuantity}
                    />
                    <SelectionNotesBox
                        notes={notes}
                        onNotesChange={setNotes}
                        scrollViewRef={scrollViewRef}
                    />
                </ScrollView>
            </SafeInputLayout>

            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={onSavePress}
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
        paddingBottom: 100,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
