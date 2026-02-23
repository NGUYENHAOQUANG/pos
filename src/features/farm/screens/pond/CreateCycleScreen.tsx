import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { warehouseApi } from '@/features/material/api/warehouseApi';
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
import {
    useCreateCycle,
    useUpdateCycle,
    useDeleteCycle,
    useCycleDetail,
} from '@/features/farm/hooks/useCycle';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { formatDateWithTime } from '@/features/farm/utils/dateUtils';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { normalizeApiError } from '@/core/api/errorHandler';
import { useSeasonsByZone } from '@/features/menu/hooks/useSeasons';
import { IShrimpSeed } from '@/features/material/types/warehouse.types';
import { useQuery } from '@tanstack/react-query';

import { pondApi } from '@/features/farm/api/pondApi';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'CreateCycle'>;
type Nav = NativeStackNavigationProp<FarmStackParamList, 'CreateCycle'>;

export const CreateCycleScreen: React.FC = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<ScreenRouteProp>();

    // Lấy các hàm từ useFarmStore với selectors
    const ponds = useFarmStore(state => state.ponds);

    const { mutate: createCycle, isPending: isCreating } = useCreateCycle();

    const { pondId, initialData, zoneId, aiCount } = route.params;
    const isEdit = !!initialData;

    // Listen for AI Count from CountingShrimpScreen
    React.useEffect(() => {
        if (aiCount !== undefined) {
            setCycleData(prev => ({
                ...prev,
                stockingQuantity: aiCount,
            }));
        }
    }, [aiCount]);

    // --- Data Fetching Logic (Lifted from CreateCycleForm) ---
    // 1. Determine Context
    // const ponds = useFarmStore(state => state.ponds); // Removed redeclaration
    const storePond = ponds.find(p => p.id === pondId);

    // Prefer passed zoneId, fallback to pond from store, then initialData
    const effectiveZoneId =
        zoneId ||
        storePond?.zoneId?.toString() ||
        (initialData?.pond as any)?.zoneId ||
        (initialData?.season as any)?.zoneId;

    // Fallback: Fetch ponds if not in store and we have zoneId
    const { data: fetchedPondsData } = useQuery({
        queryKey: ['ponds', effectiveZoneId],
        queryFn: () => pondApi.getPondsByZone(effectiveZoneId!, { PageSize: 100 }),
        enabled: !storePond && !!effectiveZoneId,
    });

    const fetchedPond = fetchedPondsData?.items?.find((p: any) => p.id === pondId);
    const pond = storePond || fetchedPond;

    // 2. Fetch Warehouses filtered by the current Zone
    const { data: warehouses } = useWarehouses({
        PageSize: 100,
        ZoneId: effectiveZoneId,
    });

    // 3. Fetch Shrimp Seeds from ALL warehouses to ensure we find the cycle's seed
    // (Cycle might use seed from a warehouse that isn't the first one)
    const { data: shrimpSeeds } = useQuery({
        queryKey: ['shrimp-seeds-all-warehouses', warehouses],
        queryFn: async () => {
            if (!warehouses || warehouses.length === 0) return [];

            // Loop through all warehouses and fetch seeds
            try {
                // Determine which warehouses to check.
                // If we have many, this might be slow, but typically there are few.
                const promises = warehouses.map(w =>
                    warehouseApi.getShrimpSeeds(w.id).catch(() => ({ data: { items: [] } } as any))
                );

                const results = await Promise.all(promises);

                // Flatten results using reduce for compatibility
                const allItems = results.reduce<any[]>((acc, r: any) => {
                    if (r?.data?.items) {
                        return acc.concat(r.data.items);
                    }
                    return acc;
                }, []);

                // Deduplicate by ID just in case (though IDs should be unique)
                const seen = new Set();
                return allItems.filter((item: any) => {
                    if (seen.has(item.id)) return false;
                    seen.add(item.id);
                    return true;
                });
            } catch (error) {
                console.warn('Failed to fetch seeds from warehouses', error);
                return [];
            }
        },
        enabled: !!warehouses && warehouses.length > 0,
    });

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
                remainingQuantity: seed.quantity ?? 0,
            }));
        } else {
            options = [];
        }

        // --- Fallback for Edit Mode ---
        // Check both breedSource and warehouseItemId (depending on API response structure)
        const currentBreedId = initialData?.breedSource || (initialData as any)?.warehouseItemId;

        if (currentBreedId) {
            const exists = options.some(o => o.value === currentBreedId);

            if (!exists) {
                options = [
                    {
                        label: initialData?.breedName || 'Giống hiện tại',
                        value: currentBreedId,
                        materialCode: '', // Unknown if not in list
                        price: 0, // Unknown
                        supplier: '',
                        remainingQuantity: 0,
                    },
                    ...options,
                ];
            }
        }

        return options;
    }, [shrimpSeeds, initialData]);

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

    // Try to fetch detail if ID exists (to handle missing fields in summary)
    const { data: detailData } = useCycleDetail(pondId, initialData?.id || '');

    // Update form when detail data arrives
    React.useEffect(() => {
        if (detailData) {
            setCycleData(prev => {
                const newData = { ...prev };
                let hasChanges = false;

                // Sync Breed/WarehouseItem
                const backendBreed = detailData.breedSource || detailData.warehouseItemId;
                if (backendBreed && backendBreed !== prev.breedSource) {
                    newData.breedSource = backendBreed;
                    // Try to find name in options or use backend name
                    const opt = breedOptions.find(b => b.value === backendBreed);
                    newData.breedName = opt?.label || detailData.breedName || prev.breedName;
                    hasChanges = true; // Mark as changed
                }

                // Sync Season
                // detailData.season can be object { id, name } or string ID
                let backendSeasonId: string | undefined;
                if (detailData.season) {
                    backendSeasonId =
                        typeof detailData.season === 'object'
                            ? detailData.season.id
                            : detailData.season;
                }

                if (backendSeasonId && backendSeasonId !== prev.season) {
                    newData.season = backendSeasonId;
                    hasChanges = true;
                }

                return hasChanges ? newData : prev;
            });
        }
    }, [detailData, breedOptions]);

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
                // seasonId: cycleData.season!, // REMOVED for Edit per user request
                warehouseItemId: cycleData.breedSource!,
                name: cycleData.cycleName!,
                totalStocking: cycleData.stockingQuantity!,
                ageDays: cycleData.age!,
                notes: cycleData.notes,
            };

            updateCycle(
                { pondId, cycleId: initialData.id, data: updateCommand },
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
                onSuccess: () => {
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
                const response = await deleteCycleMutation.mutateAsync({
                    pondId,
                    cycleId: initialData.id,
                });
                setShowDeleteModal(false);
                const successMessage =
                    response?.success === true ||
                    response?.message?.toLowerCase() === 'success' ||
                    !response?.message
                        ? 'Đã xóa chu kỳ thành công'
                        : response.message;
                Toast.show({
                    type: 'success',
                    text1: successMessage,
                    position: 'top',
                });
                navigation.navigate('MainTabs', { screen: 'Farm' } as any);
            } catch (error: unknown) {
                setShowDeleteModal(false);
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
                        pond={pond as any}
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
