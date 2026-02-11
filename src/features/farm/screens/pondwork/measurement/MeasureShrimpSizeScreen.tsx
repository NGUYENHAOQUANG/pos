import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { cycleApi } from '@/features/farm/api/cycleAPI';
import { CycleData } from '@/features/farm/types/farm.types';
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

    // Route params now contain full pond object which should be used directly
    const { itemToEdit, pond: routePond, aiShrimpSize } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);

    const currentPond = routePond;

    // --- Active Cycle Logic ---

    // 1. Try to get cycle from Store first
    const initialActiveCycle = useFarmStore(
        useCallback(
            state => {
                if (!currentPond?.id) return undefined;
                return (
                    state.activeCycles[currentPond.id] ||
                    state
                        .getCyclesByPondId(currentPond.id)
                        .find(cycle => cycle.receivingPonds?.includes(currentPond.id)) ||
                    state.getCyclesByPondId(currentPond.id)[0]
                );
            },
            [currentPond?.id]
        )
    );

    // 2. Fetch cycles if needed (using React Query)
    const { data: cycles } = useQuery({
        queryKey: ['cycles', currentPond?.id],
        queryFn: async () => {
            if (!currentPond?.id) return [];
            try {
                return await cycleApi.getCyclesByPond(currentPond.id);
            } catch (error) {
                console.log('Error fetching cycles:', error);
                return [];
            }
        },
        enabled: !!currentPond?.id && !initialActiveCycle,
    });

    // 3. Determine active cycle
    const activeCycle = useMemo(() => {
        if (initialActiveCycle) return initialActiveCycle;
        if (cycles && cycles.length > 0) {
            return (
                cycles.find(
                    c =>
                        (c.status === 'InProgress' || c.status === 'Active') &&
                        c.receivingPonds?.includes(currentPond?.id || '')
                ) || cycles[0]
            );
        }
        return undefined;
    }, [initialActiveCycle, cycles, currentPond?.id]);

    // 4. Fetch detailed cycle data
    const { data: fetchedCycleData } = useQuery({
        queryKey: ['cycleDetail', currentPond?.id, activeCycle?.id],
        queryFn: async () => {
            if (!currentPond?.id || !activeCycle?.id) return null;
            try {
                const rawData = await cycleApi.getCycleDetail(currentPond.id, activeCycle.id);
                if (rawData) {
                    return {
                        ...rawData,
                        cycleName: rawData.name || (rawData as any).cycleName,
                        breedSource: rawData.breedSource || (rawData as any).warehouseItemId,
                        stockingDate: (rawData as any).createdAt || rawData.stockingDate,
                        season: rawData.season,
                    } as CycleData;
                }
            } catch (error) {
                console.log('Error fetching cycle detail:', error);
            }
            return null;
        },
        enabled: !!currentPond?.id && !!activeCycle?.id,
        initialData: initialActiveCycle,
        refetchOnMount: 'always',
        staleTime: 0,
    });

    const activeCycleData = fetchedCycleData || activeCycle;

    // --- Stocking Quantity Optimization ---
    const stockingQuantity = useMemo(() => {
        if (!activeCycleData) return undefined;

        // Optimized check sequence
        return (
            activeCycleData.transferInfo?.originalCycle?.stockingQuantity ??
            activeCycleData.stockingQuantity ??
            (activeCycleData as any).totalStocking
        );
    }, [activeCycleData]);

    // --- AI Measurement Sync ---
    const latestAIMeasurement = useFarmStore(state =>
        currentPond?.id ? state.latestAIMeasurement[currentPond.id] : undefined
    );
    const clearLatestAIMeasurement = useFarmStore(state => state.clearLatestAIMeasurement);

    useEffect(() => {
        return () => {
            if (currentPond?.id) {
                clearLatestAIMeasurement(currentPond.id);
            }
        };
    }, [currentPond?.id, clearLatestAIMeasurement]);

    // --- Form Handling ---
    const {
        time,
        setTime,
        shrimpSize,
        setShrimpSize,
        remainingWeight,
        setRemainingWeight,
        averageShrimpSize,
        setAverageShrimpSize,
        notes,
        setNotes,
        images,
        initialDocumentIds,
        isDeleteModalVisible,
        setIsDeleteModalVisible,
        handleSave,
        handleDelete,
        isSubmitting,
    } = useMeasureShrimpSizeForm({
        pondId: currentPond?.id,
        itemToEdit,
        onSaveSuccess: () => {
            generalInfoBoxRef.current?.markAsSaved();
        },
    });

    // --- Sync Effects ---
    // Only update if values are explicitly undefined in current state to avoid overwriting user input
    // or if specific conditions are met (like AI measurement just arrived)
    useEffect(() => {
        if (latestAIMeasurement?.averageSizeCm && !averageShrimpSize) {
            setAverageShrimpSize(latestAIMeasurement.averageSizeCm.toString());
        }
    }, [latestAIMeasurement, averageShrimpSize, setAverageShrimpSize]);

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    useEffect(() => {
        if (aiShrimpSize && !shrimpSize) {
            setShrimpSize(aiShrimpSize);
        }
    }, [aiShrimpSize, shrimpSize, setShrimpSize]);

    const onSavePress = () => {
        if (isSubmitting) return;
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
                        documentIds={initialDocumentIds}
                        disabledDate={true}
                    />
                    <MeasurementDataBox
                        shrimpSize={shrimpSize}
                        onShrimpSizeChange={setShrimpSize}
                        remainingWeight={remainingWeight}
                        onRemainingWeightChange={setRemainingWeight}
                        stockingQuantity={stockingQuantity}
                        onAIMeasurePress={() =>
                            navigation.navigate('MeasureShrimpSizeAIScreen', {
                                pondId: currentPond?.id || '',
                            })
                        }
                        averageSizeCm={
                            averageShrimpSize
                                ? parseFloat(averageShrimpSize)
                                : latestAIMeasurement?.averageSizeCm
                        }
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
                    isLoading={isSubmitting}
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
