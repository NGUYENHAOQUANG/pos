import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, borderRadius } from '@/styles';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import CreateCycleForm from '@/features/farm/components/pond/CreateCycleForm';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import DeleteIcon from '@/assets/Icon/IconFarm/Delete.svg';
import Toast from 'react-native-toast-message';
import { useFarmStore } from '@/features/farm/store/farmStore';
import {
    CycleData,
    CreateCycleCommand,
    BreedOption,
    UpdateCycleCommand,
} from '@/features/farm/types/farm.types';
import { useCreateCycle, useUpdateCycle, useDeleteCycle } from '@/features/farm/hooks/useCycle';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { formatDateWithTime } from '@/features/farm/utils/dateUtils';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useShrimpSeeds } from '@/features/material/hooks/useShrimpSeeds';
import { normalizeApiError } from '@/core/api/errorHandler';
import { useSeasonsByZone } from '@/features/menu/hooks/useSeasons';
import { IShrimpSeed } from '@/features/material/types/material.types';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'CreateCycle'>;
type Nav = NativeStackNavigationProp<FarmStackParamList, 'CreateCycle'>;

export const CreateCycleScreen: React.FC = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<ScreenRouteProp>();

    // Lấy các hàm từ useFarmStore với selectors
    const saveActiveCycle = useFarmStore(state => state.saveActiveCycle);
    const deleteActiveCycle = useFarmStore(state => state.deleteActiveCycle);
    const deleteCycle = useFarmStore(state => state.deleteCycle);
    const updateCycleStore = useFarmStore(state => state.updateCycle);
    const ponds = useFarmStore(state => state.ponds);
    const storeBreedOptions = useFarmStore(state => state.breedOptions);
    const { mutate: createCycle, isPending: isCreating } = useCreateCycle();

    const { pondId, initialData, zoneId } = route.params;
    const isEdit = !!initialData;

    // --- Data Fetching Logic (Lifted from CreateCycleForm) ---
    // 1. Determine Context
    const pond = ponds.find(p => p.id === pondId);
    // Prefer passed zoneId, fallback to pond from store
    const effectiveZoneId = zoneId || pond?.zoneId?.toString();

    // 2. Fetch Warehouses filtered by the current Zone
    const { data: warehouses } = useWarehouses({
        PageSize: 100,
        ZoneId: effectiveZoneId,
    });

    // Default to the first warehouse found for this zone
    const defaultWarehouseId = warehouses?.[0]?.id;

    // 3. Fetch Shrimp Seeds using the matching warehouse ID
    const { data: shrimpSeeds } = useShrimpSeeds(defaultWarehouseId);

    // 3. Fetch Seasons (Lifted from Form)
    // Use effectiveZoneId and store logic to get code if needed
    // Assuming useSeasonsByZone handles params correctly
    const { data: seasons = [] } = useSeasonsByZone(effectiveZoneId, (pond as any)?.zone?.code);

    const seasonOptions = useMemo(() => {
        let options = seasons.map(s => ({
            label: s.name,
            value: s.id.toString(),
        }));

        // --- Fallback for Edit Mode ---
        if (initialData?.season) {
            const currentSeasonId =
                typeof initialData.season === 'object' ? initialData.season.id : initialData.season;
            // Try to find name if possible. initialData.season might be object with name
            const currentSeasonName =
                typeof initialData.season === 'object'
                    ? initialData.season.name
                    : 'Vụ nuôi hiện tại';

            const exists = options.some(o => o.value === currentSeasonId);
            if (!exists && currentSeasonId) {
                options = [
                    {
                        label: currentSeasonName || 'Vụ nuôi hiện tại',
                        value: currentSeasonId,
                    },
                    ...options,
                ];
            }
        }
        return options;
    }, [seasons, initialData]);

    // 4. Map shrimp seeds to breed options with FALLBACK
    const breedOptions: BreedOption[] = useMemo(() => {
        let options: BreedOption[] = [];

        if (shrimpSeeds && shrimpSeeds.length > 0) {
            options = shrimpSeeds.map((seed: IShrimpSeed) => ({
                label: seed.materialName || 'N/A',
                value: seed.id,
                materialCode: seed.materialCode,
                price: seed.averagePrice || 0,
                supplier: seed.manufacturer || seed.supplier || 'N/A',
            }));
        } else {
            options = [...storeBreedOptions];
        }

        // --- Fallback for Edit Mode ---
        if (initialData?.breedSource) {
            const exists = options.some(o => o.value === initialData.breedSource);
            if (!exists) {
                options = [
                    {
                        label: initialData.breedName || 'Giống hiện tại',
                        value: initialData.breedSource,
                        materialCode: '', // Unknown if not in list
                        price: 0, // Unknown
                        supplier: '',
                    },
                    ...options,
                ];
            }
        }

        return options;
    }, [shrimpSeeds, storeBreedOptions, initialData]);
    // ---------------------------------------------------------

    // State quản lý ẩn/hiện Modal xác nhận xóa
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Initialize form data from CycleData
    const getInitialFormData = (data: CycleData | null | undefined): Partial<CycleData> => {
        if (!data) {
            return {
                cycleName: '',
                breedSource: undefined,
                season: undefined,
                stockingDate: formatDateWithTime(new Date()),
            };
        }

        // Handle season object vs ID
        let seasonId = data.season;
        if (typeof data.season === 'object' && data.season !== null) {
            seasonId = data.season.id;
        }

        return {
            ...data,
            season: seasonId,
            breedSource: data.breedSource || (data as any).warehouseItemId,
            // Map API fields if they exist and internal keys are missing
            stockingQuantity: data.stockingQuantity || data.totalStocking,
            age: data.age || data.ageDays,
            // Override stockingDate with current time in edit mode
            stockingDate: formatDateWithTime(new Date()),
        };
    };

    // Sử dụng state cục bộ để quản lý dữ liệu form trước khi lưu
    const [cycleData, setCycleData] = useState<Partial<CycleData>>(getInitialFormData(initialData));

    const { mutate: updateCycle, isPending: isUpdating } = useUpdateCycle();

    const checkFields = () => {
        return (
            !!cycleData.breedSource &&
            !!cycleData.season &&
            !!cycleData.cycleName &&
            !!cycleData.stockingDate &&
            cycleData.stockingQuantity !== undefined &&
            cycleData.stockingQuantity > 0 &&
            cycleData.age !== undefined &&
            cycleData.age > 0
        );
    };

    const handleCreate = async () => {
        if (!checkFields() || !pondId) {
            return Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập đầy đủ các thông tin',
                position: 'top',
            });
        }

        const command: CreateCycleCommand = {
            seasonId: cycleData.season!,
            warehouseItemId: cycleData.breedSource!,
            name: cycleData.cycleName!,
            totalStocking: cycleData.stockingQuantity!,
            ageDays: cycleData.age!,
            notes: cycleData.notes,
        };

        if (isEdit && initialData?.id) {
            const updateCommand: UpdateCycleCommand = {
                seasonId: cycleData.season!,
                warehouseItemId: cycleData.breedSource!,
                name: cycleData.cycleName!,
                totalStocking: cycleData.stockingQuantity!,
                ageDays: cycleData.age!,
                notes: cycleData.notes,
            };

            console.log('DEBUG UPDATE CYCLE:', {
                pondId,
                cycleId: initialData.id,
                data: updateCommand,
                url: `/pond/${pondId}/cycle/${initialData.id}`,
            });

            updateCycle(
                { pondId, cycleId: initialData.id, data: updateCommand },
                {
                    onSuccess: _result => {
                        // Find breed name
                        const selectedBreed = breedOptions.find(
                            b => b.value === command.warehouseItemId
                        );

                        // Update locally in store if needed, similar to create
                        // API returns { success: true, data: CycleData } or just CycleData depending on interceptor.
                        // Based on user JSON: result is { success: true, data: { ... } }
                        // But cycleApi.updateCycle returns response.data.
                        // If response.data is the wrapper, we access .data.
                        // Let's assume _result has the data property or IS the data.
                        const updatedCycleData = (_result as any).data || _result;

                        const fullCycleData: CycleData = {
                            ...updatedCycleData,
                            // Ensure fields are preserved/mapped if API returns partial
                            breedName: selectedBreed?.label,
                        };

                        saveActiveCycle(pondId, fullCycleData);
                        updateCycleStore(initialData.id, fullCycleData);

                        Toast.show({
                            type: 'success',
                            text1: 'Đã cập nhật chu kỳ thành công',
                            topOffset: 0,
                        });
                        navigation.goBack();
                    },
                    onError: error => {
                        console.error('Update cycle error:', error);
                        Toast.show({
                            type: 'error',
                            text1: 'Có lỗi xảy ra',
                            text2: (error as any)?.message || 'Vui lòng thử lại',
                            position: 'top',
                        });
                    },
                }
            );
            return;
        }

        createCycle(
            { pondId, data: command },
            {
                onSuccess: result => {
                    // Find breed name
                    const selectedBreed = breedOptions.find(
                        b => b.value === command.warehouseItemId
                    );

                    // Convert result/input to CycleData for store
                    // Note: usage of saveActiveCycle might need review if API returns different structure
                    // but for now we map what we have to keep UI working until refactor
                    const fullCycleData: CycleData = {
                        ...cycleData,
                        id: result.id || `${pondId}-${Date.now()}`,
                        cycleName: command.name,
                        breedSource: command.warehouseItemId,
                        breedName: selectedBreed?.label, // Save the breed name
                        season: command.seasonId,
                        stockingDate: cycleData.stockingDate || formatDateWithTime(new Date()),
                        stockingQuantity: command.totalStocking,
                        age: command.ageDays,
                        density: cycleData.density || 0, // Should be calculated or returned by API
                        estimatedCost: cycleData.estimatedCost || 0,
                        sourcePonds: [pondId],
                    } as CycleData;

                    // Lưu vào FarmContext
                    saveActiveCycle(pondId, fullCycleData);

                    Toast.show({
                        type: 'success',
                        text1: isEdit
                            ? 'Đã cập nhật chu kỳ thành công'
                            : 'Đã tạo chu kỳ nuôi thành công',
                        topOffset: 0,
                    });
                    navigation.goBack();
                },
                onError: error => {
                    console.error('Create cycle error:', error);
                    Toast.show({
                        type: 'error',
                        text1: 'Có lỗi xảy ra',
                        text2: (error as any)?.message || 'Vui lòng thử lại',
                        position: 'top',
                    });
                },
            }
        );
    };

    const deleteCycleMutation = useDeleteCycle();

    const onConfirmDelete = async () => {
        if (pondId && initialData?.id) {
            try {
                await deleteCycleMutation.mutateAsync({
                    pondId,
                    cycleId: initialData.id,
                });
                deleteActiveCycle(pondId);
                deleteCycle(initialData.id);
                setShowDeleteModal(false);
                navigation.navigate('PondDetail', { pondId } as any);
            } catch (error: any) {
                const normalizedError = normalizeApiError(error);
                Toast.show({
                    type: 'error',
                    text1: 'Xóa thất bại',
                    text2: normalizedError.message,
                    visibilityTime: 4000,
                });
            }
        }
    };

    return (
        <View style={styles.container}>
            <HeaderFarm
                title={isEdit ? 'Chỉnh sửa chu kỳ nuôi' : 'Tạo chu kỳ nuôi'}
                onBack={() => navigation.goBack()}
                type="simple"
                rightAction={
                    isEdit ? (
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
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    automaticallyAdjustKeyboardInsets={true}
                >
                    <CreateCycleForm
                        formData={cycleData}
                        setFormData={setCycleData}
                        pondId={pondId}
                        zoneId={zoneId}
                        isEdit={isEdit}
                        breedOptions={breedOptions}
                        seasonOptions={seasonOptions}
                    />
                </ScrollView>
            </View>

            <ButtonBarFarm
                primaryTitle={isEdit ? 'Cập nhật thông tin' : 'Bắt đầu chu kỳ nuôi'}
                secondaryTitle="Hủy"
                onPrimaryPress={handleCreate}
                onSecondaryPress={() => navigation.goBack()}
                primaryDisabled={
                    (isEdit &&
                        JSON.stringify(cycleData) ===
                            JSON.stringify(initialData ? getInitialFormData(initialData) : {})) ||
                    isCreating ||
                    isUpdating
                }
            />

            <ConfirmationDeleteModal
                visible={showDeleteModal}
                onConfirm={onConfirmDelete}
                onCancel={() => setShowDeleteModal(false)}
                title="Xác nhận xóa chu kỳ nuôi"
                message="Bạn sẽ không thể truy cập lại chu kỳ đã xóa. Các vật tư đã xuất kho cho chu kỳ này sẽ có thể bị ảnh hưởng. Bạn có chắc chắn muốn xóa chu kỳ này không?"
                confirmText="Xóa chu kỳ"
                cancelText="Không"
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
