import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, borderRadius } from '@/styles';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import CreateCycleForm from '@/features/farm/screens/pond/createCycle/CreateCycleForm';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import DeleteIcon from '@/assets/Icon/IconFarm/Delete.svg';
import Toast from 'react-native-toast-message';
import { useFarmStore } from '@/features/farm/store/farmStore';
import {
    useCreateCycle,
    useUpdateCycle,
    useDeleteCycle,
    useCycleDetail,
} from '@/features/farm/hooks/useCycle';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { useSeasonsByZone } from '@/features/menu/hooks/useSeasons';
import { normalizeApiError } from '@/core/api/errorHandler';
import { useQuery } from '@tanstack/react-query';
import { pondApi } from '@/features/farm/api/pondApi';
import { useBreedOptions } from '@/features/farm/hooks/pond/useBreedOptions';

// Forms & Services
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    createCycleSchema,
    CreateCycleFormValues,
} from '@/features/farm/schemas/createCycleSchema';
import { cycleService } from '@/features/farm/services/cycleService';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'CreateCycle'>;
type Nav = NativeStackNavigationProp<FarmStackParamList, 'CreateCycle'>;

export const CreateCycleScreen: React.FC = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<ScreenRouteProp>();

    const { pondId, initialData, zoneId, aiCount } = route.params;
    const isEditMode = !!initialData;
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
        defaultValues: cycleService.mapDetailToForm(initialData),
        mode: 'onChange',
    });

    // Listen for AI Count from CountingShrimpScreen
    useEffect(() => {
        if (aiCount !== undefined) {
            setValue('stockingQuantity', String(aiCount), { shouldValidate: true });
        }
    }, [aiCount, setValue]);

    // --- Data Fetching Logic (Container Responsibilities) ---
    const ponds = useFarmStore(state => state.ponds);
    const storePond = ponds.find(p => p.id === pondId);

    const pondZoneIdFromDetail = (initialData?.pond as { zoneId?: string | number })?.zoneId;
    const seasonZoneIdFromDetail = (initialData?.season as { zoneId?: string | number })?.zoneId;

    const rawEffectiveZoneId =
        zoneId || storePond?.zoneId || pondZoneIdFromDetail || seasonZoneIdFromDetail;

    const effectiveZoneId = rawEffectiveZoneId ? String(rawEffectiveZoneId) : undefined;

    const { data: fetchedPondsData } = useQuery({
        queryKey: ['ponds', effectiveZoneId],
        queryFn: () => pondApi.getPondsByZone(effectiveZoneId!, { PageSize: 100 }),
        enabled: !storePond && !!effectiveZoneId,
    });

    const pond = storePond || fetchedPondsData?.items?.find((p: { id: string }) => p.id === pondId);

    // Fetch Details if in Edit Mode
    const { data: detailData, isLoading: isLoadingDetail } = useCycleDetail(
        pondId,
        initialData?.id || ''
    );

    // Reset form when Detail API returns fresh data
    useEffect(() => {
        if (detailData && isEditMode) {
            // Keep existing form values, but update with incoming server detail
            reset(cycleService.mapDetailToForm(detailData));
        }
    }, [detailData, reset, isEditMode]);

    // Fetch Options (Hooks)
    const breedSrcInitID =
        initialData?.breedSource || (initialData as { warehouseItemId?: string })?.warehouseItemId;
    const { options: breedOptions, isLoading: isLoadingBreeds } = useBreedOptions(
        effectiveZoneId,
        breedSrcInitID,
        initialData?.breedName || detailData?.breedName
    );

    const { data: seasons = [] } = useSeasonsByZone(
        effectiveZoneId,
        (pond as { zone?: { code?: string } })?.zone?.code
    );

    // Map seasons for dropdown
    const seasonOptions = React.useMemo(() => {
        let opts = seasons.map(s => ({
            label: s.name,
            value: s.id.toString(),
        }));

        // Edit mode fallback for season
        if (isEditMode && initialData?.season) {
            const seasonObjectOrStr = initialData.season;
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
    }, [seasons, isEditMode, initialData]);

    // --- Mutations ---
    const { mutate: createCycle, isPending: isCreating } = useCreateCycle();
    const { mutate: updateCycle, isPending: isUpdating } = useUpdateCycle();
    const deleteCycleMutation = useDeleteCycle();

    const onSubmit = (formData: CreateCycleFormValues) => {
        if (!pondId) {
            Toast.show({ type: 'error', text1: 'Không tìm thấy thông tin Ao', position: 'top' });
            return;
        }

        if (isEditMode && initialData?.id) {
            const updatePayload = cycleService.mapFormToUpdatePayload(formData);

            updateCycle(
                { pondId, cycleId: initialData.id, data: updatePayload },
                {
                    onSuccess: () => {
                        Toast.show({
                            type: 'success',
                            text1: 'Đã cập nhật chu kỳ thành công',
                            topOffset: 0,
                        });
                        navigation.goBack();
                    },
                    onError: error => {
                        Toast.show({
                            type: 'error',
                            text1: 'Có lỗi xảy ra',
                            text2: normalizeApiError(error).message,
                            position: 'top',
                        });
                    },
                }
            );
        } else {
            const createPayload = cycleService.mapFormToCreatePayload(formData);

            createCycle(
                { pondId, data: createPayload },
                {
                    onSuccess: () => {
                        Toast.show({
                            type: 'success',
                            text1: 'Đã tạo chu kỳ nuôi thành công',
                            topOffset: 0,
                        });
                        navigation.goBack();
                    },
                    onError: error => {
                        Toast.show({
                            type: 'error',
                            text1: 'Có lỗi xảy ra',
                            text2: normalizeApiError(error).message,
                            position: 'top',
                        });
                    },
                }
            );
        }
    };

    const onDelete = async () => {
        if (pondId && initialData?.id) {
            try {
                await deleteCycleMutation.mutateAsync({ pondId, cycleId: initialData.id });
                setShowDeleteModal(false);
                Toast.show({ type: 'success', text1: 'Đã xóa chu kỳ thành công', position: 'top' });
                navigation.navigate('MainTabs' as never);
            } catch (error: unknown) {
                setShowDeleteModal(false);
                Toast.show({
                    type: 'error',
                    text1: 'Xóa thất bại',
                    text2: normalizeApiError(error).message,
                    visibilityTime: 4000,
                });
            }
        }
    };

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
                    />
                </SafeInputLayout>
            </View>

            <ButtonBarFarm
                primaryTitle={isEditMode ? 'Cập nhật thông tin' : 'Bắt đầu chu kỳ nuôi'}
                secondaryTitle="Hủy"
                onPrimaryPress={handleSubmit(onSubmit)}
                onSecondaryPress={() => navigation.goBack()}
                primaryDisabled={
                    isCreating || isUpdating || isSubmitting || isLoadingDetail || isLoadingBreeds
                }
            />

            <ConfirmationDeleteModal
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
