import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, borderRadius } from '@/styles';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import CreateCycleForm from '@/features/farm/screens/create-cycle/CreateCycleForm';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import DeleteIcon from '@/assets/Icon/IconFarm/Delete.svg';
import Toast from 'react-native-toast-message';
import {
    useCreateCycle,
    useUpdateCycle,
    useDeleteCycle,
    useCycleDetail,
} from '@/features/farm/hooks/useCycle';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { useSeasonList } from '@/features/menu/hooks/useSeason';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useShrimpSeeds } from '@/features/material/hooks/useShrimpSeeds';
import { usePondDetail } from '@/features/farm/hooks/usePonds';

import { FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    createCycleSchema,
    CreateCycleFormValues,
} from '@/features/farm/schemas/createCycleSchema';
import { cycleService } from '@/features/farm/services/cycle.service';

type ScreenRouteProp = RouteProp<AppStackParamList, 'CreateCycle'>;
type Nav = NativeStackNavigationProp<AppStackParamList, 'CreateCycle'>;

export const CreateCycleScreen: React.FC = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<ScreenRouteProp>();

    const { pondId, zoneId, cycleId, isEditMode: isEditModeParam } = route.params;
    const isEditMode: boolean = isEditModeParam ?? !!cycleId;
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // --- State & Form Hook Init ---
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { isSubmitting },
    } = useForm<CreateCycleFormValues>({
        resolver: zodResolver(createCycleSchema),
        defaultValues: cycleService.mapDetailToForm(null),
        mode: 'onChange',
    });

    const { data: pond } = usePondDetail(zoneId, pondId);

    const { data: detailData, isLoading: isLoadingDetail } = useCycleDetail(pondId, cycleId || '');

    useEffect(() => {
        if (detailData?.data && isEditMode) {
            reset(cycleService.mapDetailToForm(detailData.data));
        }
    }, [detailData, reset, isEditMode]);

    const { data: warehouses } = useWarehouses({
        PageSize: 1,
        ZoneId: zoneId,
    });

    const primaryWarehouseId = warehouses?.[0]?.id;

    const { data: shrimpSeeds = [], isLoading: isLoadingShrimpSeeds } =
        useShrimpSeeds(primaryWarehouseId);

    const breedSrcInitID = detailData?.data?.warehouseItemId;

    const breedOptions = React.useMemo(
        () => cycleService.mapShrimpSeedsToBreedOptions(shrimpSeeds, breedSrcInitID, undefined),
        [shrimpSeeds, breedSrcInitID]
    );

    const { data: seasonsResponse } = useSeasonList(zoneId);
    const seasons = React.useMemo(() => seasonsResponse?.data?.items ?? [], [seasonsResponse]);

    // Map seasons for dropdown
    const seasonOptions = React.useMemo(() => {
        let opts = seasons.map(s => ({
            label: s.name,
            value: s.id.toString(),
        }));

        // Edit mode fallback cho season hiện tại (nếu không còn trong list)
        if (isEditMode && detailData?.data?.season) {
            const seasonObjectOrStr = detailData.data.season as any;
            const initSeasonId =
                typeof seasonObjectOrStr === 'object'
                    ? String((seasonObjectOrStr as { id: string | number }).id)
                    : String(seasonObjectOrStr);
            const initSeasonName =
                typeof seasonObjectOrStr === 'object'
                    ? (seasonObjectOrStr as { name?: string }).name
                    : 'Vụ nuôi hiện tại';

            if (initSeasonId && !opts.some(o => o.value === initSeasonId)) {
                opts = [
                    { label: initSeasonName || 'Vụ nuôi hiện tại', value: initSeasonId },
                    ...opts,
                ];
            }
        }
        return opts;
    }, [seasons, isEditMode, detailData]);

    // --- Mutations ---
    const { mutate: createCycle, isPending: isCreating } = useCreateCycle();
    const { mutate: updateCycle, isPending: isUpdating } = useUpdateCycle();
    const deleteCycleMutation = useDeleteCycle();

    const onSubmit = (formData: CreateCycleFormValues) => {
        if (!pondId) {
            Toast.show({ type: 'error', text1: 'Không tìm thấy thông tin Ao' });
            return;
        }

        if (isEditMode && cycleId) {
            const updatePayload = cycleService.mapFormToUpdatePayload(formData);

            updateCycle(
                { pondId, cycleId, data: updatePayload },
                {
                    onSuccess: () => {
                        navigation.goBack();
                    },
                }
            );
        } else {
            const createPayload = cycleService.mapFormToCreatePayload(formData);

            createCycle(
                { pondId, data: createPayload },
                {
                    onSuccess: () => {
                        navigation.goBack();
                    },
                }
            );
        }
    };

    const onInvalid = (errors: FieldErrors<CreateCycleFormValues>) => {
        const message =
            errors.breedSource?.message ||
            errors.season?.message ||
            errors.cycleName?.message ||
            'Vui lòng kiểm tra lại thông tin nguồn giống và vụ nuôi';

        Toast.show({
            type: 'error',
            text1: typeof message === 'string' ? message : 'Dữ liệu không hợp lệ',
            position: 'top',
        });
    };

    const onDelete = async () => {
        if (pondId && cycleId) {
            try {
                await deleteCycleMutation.mutateAsync({ pondId, cycleId });
                setShowDeleteModal(false);
                navigation.navigate('MainTabs' as never);
            } catch (_error) {
                setShowDeleteModal(false);
            }
        }
    };

    const onAIPress = useCallback(() => {
        navigation.navigate('CountingShrimp', { pondId, zoneId });
    }, [navigation, pondId, zoneId]);

    useEffect(() => {
        const aiCount = route.params?.aiCount;
        if (aiCount != null && !isEditMode) {
            setValue('stockingQuantity', String(aiCount));
            navigation.setParams({ aiCount: undefined } as any);
        }
    }, [route.params?.aiCount, isEditMode, setValue, navigation]);

    return (
        <View style={styles.container}>
            <HeaderFarm
                title={isEditMode ? 'Chỉnh sửa chu kỳ nuôi' : 'Tạo chu kỳ nuôi'}
                onBack={() => navigation.goBack()}
                type="simple"
                rightAction={
                    isEditMode ? (
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => setShowDeleteModal(true)}
                        >
                            <DeleteIcon width={20} height={20} color={colors.red[900]} />
                        </TouchableOpacity>
                    ) : null
                }
            />

            <View style={{ flex: 1 }}>
                <SafeInputLayout
                    contentContainerStyle={{ paddingBottom: 100 }}
                    extraScrollHeight={100}
                >
                    <CreateCycleForm
                        control={control}
                        pondId={pondId}
                        pond={pond}
                        isEdit={isEditMode}
                        breedOptions={breedOptions}
                        seasonOptions={seasonOptions}
                        onPressCountingShrimp={onAIPress}
                    />
                </SafeInputLayout>
            </View>

            <ButtonBarFarm
                primaryTitle={isEditMode ? 'Cập nhật thông tin' : 'Bắt đầu chu kỳ nuôi'}
                secondaryTitle="Hủy"
                onPrimaryPress={handleSubmit(onSubmit, onInvalid)}
                onSecondaryPress={() => navigation.goBack()}
                primaryDisabled={
                    isCreating ||
                    isUpdating ||
                    isSubmitting ||
                    isLoadingDetail ||
                    isLoadingShrimpSeeds
                }
            />

            <ConfirmationModalUI
                visible={showDeleteModal}
                onConfirm={onDelete}
                onCancel={() => setShowDeleteModal(false)}
                title="Xác nhận xóa chu kỳ nuôi"
                message="Bạn sẽ không thể truy cập lại chu kỳ đã xóa. Các vật tư đã xuất kho cho chu kỳ này sẽ có thể bị ảnh hưởng. Bạn có chắc chắn muốn xóa chu kỳ này không?"
                confirmText="Xóa chu kỳ"
                cancelText="Không"
                showSuccessToast={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.red[900],
    },
});

export default CreateCycleScreen;
