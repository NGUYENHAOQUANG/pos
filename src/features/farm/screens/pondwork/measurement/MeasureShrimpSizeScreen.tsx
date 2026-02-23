import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useQuery } from '@tanstack/react-query';
import { useActiveCycle } from '@/features/farm/hooks/useCycle';
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

    const { itemToEdit, pond: routePond, aiShrimpSize } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();
    const insets = useSafeAreaInsets();

    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);

    const currentPond = routePond;

    // Get stocking quantity from cycle data
    // Optimized selector to get stocking quantity without re-rendering on unrelated store updates
    // Get initial active cycle from hook
    const activeCycle = useActiveCycle(currentPond?.id || '');

    // Fetch fresh cycle details once we have an ID
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
        initialData: activeCycle,
        refetchOnMount: 'always',
        staleTime: 0,
    });

    const activeCycleData = fetchedCycleData || activeCycle;

    // Get stocking quantity from cycle data
    const stockingQuantity = useMemo(() => {
        let quantity: number | undefined;
        if (activeCycleData?.transferInfo?.originalCycle?.stockingQuantity) {
            quantity = Number(activeCycleData.transferInfo.originalCycle.stockingQuantity);
        } else if (activeCycleData?.stockingQuantity) {
            quantity = Number(activeCycleData.stockingQuantity);
        } else if ((activeCycleData as any)?.totalStocking) {
            quantity = Number((activeCycleData as any).totalStocking);
        }

        console.log('MeasureShrimpSize - activeCycleData:', {
            id: activeCycleData?.id,
            hasTransferInfo: !!activeCycleData?.transferInfo,
            stockingQuantity: activeCycleData?.stockingQuantity,
            totalStocking: (activeCycleData as any)?.totalStocking,
            resolvedQuantity: quantity,
        });

        return quantity;
    }, [activeCycleData]);

    const latestAIMeasurement = useFarmStore(state =>
        currentPond?.id ? state.latestAIMeasurement[currentPond.id] : undefined
    );

    const clearLatestAIMeasurement = useFarmStore(state => state.clearLatestAIMeasurement);

    // Clear AI measurement when unmounting
    useEffect(() => {
        return () => {
            if (currentPond?.id) {
                clearLatestAIMeasurement(currentPond.id);
            }
        };
    }, [currentPond?.id, clearLatestAIMeasurement]);

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
    } = useMeasureShrimpSizeForm({
        pondId: currentPond?.id,
        itemToEdit,
        onSaveSuccess: () => {
            generalInfoBoxRef.current?.markAsSaved();
        },
    });

    useEffect(() => {
        if (latestAIMeasurement?.averageSizeCm) {
            setAverageShrimpSize(latestAIMeasurement.averageSizeCm.toString());
        }
    }, [latestAIMeasurement, setAverageShrimpSize]);
    // ...

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    useEffect(() => {
        if (aiShrimpSize) {
            setShrimpSize(aiShrimpSize);
        }
    }, [aiShrimpSize, setShrimpSize]);

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

            <SafeInputLayout
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                extraScrollHeight={100}
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
                <SelectionNotesBox notes={notes} onNotesChange={setNotes} />
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
