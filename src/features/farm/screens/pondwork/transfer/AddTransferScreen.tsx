import React, { useEffect, useMemo, useState, useRef } from 'react';
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
import { CurrentPondInfoBox } from '@/features/farm/components/pondwork/transfer/CurrentPondInfoBox';
import {
    TransferInfoBox,
    ReceivingPondItem,
} from '@/features/farm/components/pondwork/transfer/TransferInfoBox';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { useFarmStore } from '@/features/farm/store/farmStore';
import type { TransferMeta } from '@/features/farm/types/farm.types';
import { PondData } from '@/features/farm/types/pond.types';
import { showEditJobSuccessToast } from '@/features/farm/utils/toastMessages';
import { useCreateStockTransfer } from '@/features/farm/hooks/useStockTransfer';
import { usePondsByZone, usePondMasterData } from '@/features/farm/hooks/usePonds';
import { useCyclesByPond } from '@/features/farm/hooks/useCycle';
import { useSizeMeasurements } from '@/features/farm/hooks/useSizeMeasurement';
import type { CreateStockTransferRequest } from '@/features/farm/types/stockTransfer.types';
import Toast from 'react-native-toast-message';
import { formatDate, parseDate } from '@/features/farm/utils/dateUtils';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'AddTransferScreen'>;

export const AddTransferScreen: React.FC = () => {
    // ========== HOOKS ==========
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const insets = useSafeAreaInsets();
    const { setTabBarVisible } = useTabBarVisibility();

    // Use individual selectors instead of useFarm() to prevent unnecessary re-renders
    const getPondJobItems = useFarmStore(state => state.getPondJobItems);
    const updatePondJob = useFarmStore(state => state.updatePondJob);
    const breedOptions = useFarmStore(state => state.breedOptions);
    const ponds = useFarmStore(state => state.ponds); // Fallback for dropdown when zoneId unavailable

    // API mutation hook
    const { mutateAsync: createStockTransfer, isPending: _isCreating } = useCreateStockTransfer();

    // ========== ROUTE PARAMS ==========
    const {
        pond,
        itemToEdit,
        latestShrimpSize: latestShrimpSizeFromParams,
        cycleData: cycleDataFromParams,
    } = route.params || {};

    // Fetch ponds by zone from API for dropdown
    const { data: pondsByZoneData } = usePondsByZone(pond?.zoneId || null);

    // Fetch pond master data to map category IDs to types
    const { data: pondMasterData } = usePondMasterData();

    // Fetch cycle data from API
    const { data: cyclesData } = useCyclesByPond(pond?.id || '');

    // Fetch size measurements from API to get survivalRatePercentage
    const { data: sizeMeasurementsData } = useSizeMeasurements(pond?.id || '');

    // ========== COMPUTED VALUES ==========
    // Meta data from itemToEdit
    const meta = useMemo(() => (itemToEdit?.meta as TransferMeta) || {}, [itemToEdit?.meta]);

    // ========== STATE ==========
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [notes, setNotes] = useState<string>(itemToEdit?.note || '');
    const [shrimpSize, setShrimpSize] = useState<string>(
        meta.shrimpSize?.toString() || latestShrimpSizeFromParams || '60'
    );
    const [transferMethod] = useState<string>(meta.transferMethod || 'Sang hết');
    const [receivingPonds, setReceivingPonds] = useState<ReceivingPondItem[]>(() => {
        if (meta.receivingPonds && meta.receivingPonds.length > 0) {
            return meta.receivingPonds;
        }
        return [{ id: Date.now().toString(), quantity: '' }];
    });
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
    const hasInitialized = useRef(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Callback to scroll up when dropdown opens
    const handleDropdownOpen = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    const pondOptions = useMemo(() => {
        if (!pond?.id) return [];

        let availablePonds: PondData[] = [];

        // Priority 1: API data (by zone)
        if (pondsByZoneData && pondsByZoneData.length > 0) {
            availablePonds = pondsByZoneData;
        }
        // Priority 2: Fallback to farmStore ponds
        else if (ponds && ponds.length > 0) {
            availablePonds = ponds;
        }

        if (availablePonds.length === 0) return [];

        // Determine source pond type (handle both string and object)
        const sourceType = typeof pond.type === 'string' ? pond.type : pond.type?.name;

        // Determine allowed target pond types based on source pond type
        let targetTypes: string[] = [];
        if (sourceType === 'Ao vèo' || sourceType === 'Ao nuôi' || sourceType === 'Ao sẵn sàng') {
            targetTypes = ['Ao nuôi', 'Ao sẵn sàng'];
        }

        // Map pond types by ID for easier lookup
        const pondTypesMap = new Map<string, string>();
        if (pondMasterData?.types) {
            pondMasterData.types.forEach(t => {
                if (t.id) pondTypesMap.set(t.id, t.name);
            });
        }

        return availablePonds
            .filter(p => {
                // Exclude current pond
                if (p.id === pond.id) return false;

                // Filter by allowed target types if logic applies
                if (targetTypes.length > 0) {
                    let pType = typeof p.type === 'string' ? p.type : p.type?.name;
                    // Fallback to pondCategoryId mapping if type is missing
                    if (!pType && p.pondCategoryId) {
                        pType = pondTypesMap.get(p.pondCategoryId);
                    }
                    return pType ? targetTypes.includes(pType) : false;
                }

                return true;
            })
            .map(p => ({
                id: p.id,
                label: p.name,
            }));
    }, [pondsByZoneData, pond?.id, pond?.type, ponds, pondMasterData]);

    // Get cycle data with priority: 1. params (from navigation), 2. API, 3. local store
    const cycleData = useMemo(() => {
        // Priority 1: From route params (navigation passes this correctly)
        if (cycleDataFromParams !== undefined && cycleDataFromParams !== null) {
            return cycleDataFromParams;
        }
        // Priority 2: API data (get active cycle)
        if (cyclesData && Array.isArray(cyclesData) && cyclesData.length > 0) {
            // Find the active cycle (InProgress/Active status) or get the first one
            const activeCycle =
                cyclesData.find(
                    (c: { status?: string }) => c.status === 'InProgress' || c.status === 'Active'
                ) || cyclesData[0];
            return activeCycle;
        }
        return null;
    }, [cycleDataFromParams, cyclesData]);

    const shrimpBreed = cycleData?.breedSource
        ? breedOptions.find(b => b.value === cycleData.breedSource)?.label
        : undefined;

    const actualStockingQuantity = cycleData?.stockingQuantity ?? cycleData?.totalStocking ?? 0;

    // Get the latest survival rate and totalShrimpCount from size measurements API
    const { latestSurvivalRate, latestTotalShrimpCount } = useMemo(() => {
        const items = sizeMeasurementsData?.data?.items;
        if (!items || items.length === 0)
            return { latestSurvivalRate: null, latestTotalShrimpCount: null };
        // Sort by createdAt descending to get the latest
        const sorted = [...items].sort((a: { createdAt?: string }, b: { createdAt?: string }) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
        });
        const latest = sorted[0] as {
            sizeMeasurementDetail?: { survivalRatePercentage?: number; totalShrimpCount?: number };
            sizeMeasurement?: { survivalRatePercentage?: number; totalShrimpCount?: number };
        };
        const detail = latest?.sizeMeasurementDetail || latest?.sizeMeasurement;
        return {
            latestSurvivalRate: detail?.survivalRatePercentage ?? null,
            latestTotalShrimpCount: detail?.totalShrimpCount ?? null,
        };
    }, [sizeMeasurementsData]);

    // Calculate total estimated shrimp (con): Use server value (totalShrimpCount) first, then calculate from survivalRate
    // Backend validates totalStocking against this value from size measurement
    const totalEstimatedShrimp = useMemo(() => {
        // Priority 1: Use totalShrimpCount from size measurement API (backend uses this for validation)
        if (latestTotalShrimpCount !== null && latestTotalShrimpCount > 0) {
            return latestTotalShrimpCount;
        }
        // Priority 2: Calculate from survivalRate
        if (!actualStockingQuantity || actualStockingQuantity === 0) return 0;
        if (latestSurvivalRate !== null && latestSurvivalRate > 0) {
            return Math.round(actualStockingQuantity * (latestSurvivalRate / 100));
        }
        // Fallback: assume 100% survival rate (return full stocking quantity)
        return actualStockingQuantity;
    }, [latestTotalShrimpCount, actualStockingQuantity, latestSurvivalRate]);

    // Initial data for comparison when editing
    const initialData = useMemo(() => {
        if (!itemToEdit) return null;
        return {
            date: itemToEdit.date ? parseDate(itemToEdit.date) : new Date(),
            notes: itemToEdit?.note || '',
            shrimpSize: meta.shrimpSize || '60',
            transferMethod: meta.transferMethod || 'Sang hết',
            receivingPonds: meta.receivingPonds || [],
        };
    }, [itemToEdit, meta]);

    // Check if data has changed from initial (when editing)
    const hasChanges = useMemo(() => {
        if (!itemToEdit) {
            // Creation mode: check if any meaningful data is entered
            return (
                notes !== '' ||
                receivingPonds.some(
                    p => p.quantity !== '' && p.quantity !== totalEstimatedShrimp.toString()
                )
            );
        }

        if (!initialData) return false;

        const currentDateStr = selectedDate.toDateString();
        const initialDateStr = initialData.date.toDateString();
        if (currentDateStr !== initialDateStr) return true;
        if (notes !== initialData.notes) return true;
        if (shrimpSize !== initialData.shrimpSize) return true;
        if (transferMethod !== initialData.transferMethod) return true;
        if (JSON.stringify(receivingPonds) !== JSON.stringify(initialData.receivingPonds))
            return true;

        return false;
    }, [
        itemToEdit,
        initialData,
        selectedDate,
        notes,
        shrimpSize,
        transferMethod,
        receivingPonds,
        totalEstimatedShrimp,
    ]);

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasChanges);

    const isButtonDisabled = itemToEdit && !hasChanges;

    // ========== EFFECTS ==========
    // Hide tab bar when this screen is mounted
    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    // Initialize first row with totalEstimatedShrimp when component mounts
    useEffect(() => {
        if (!hasInitialized.current && totalEstimatedShrimp > 0) {
            setReceivingPonds(prev => {
                if (prev.length === 1 && (prev[0].quantity === '' || prev[0].quantity === '0')) {
                    hasInitialized.current = true;
                    return [{ ...prev[0], quantity: totalEstimatedShrimp.toString() }];
                }
                return prev;
            });
        }
    }, [totalEstimatedShrimp]);

    // ========== HANDLERS ==========
    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const handleSavePress = () => {
        if (!itemToEdit) {
            setIsConfirmationModalVisible(true);
        } else {
            handleSave();
        }
    };

    const handleConfirmSave = () => {
        setIsConfirmationModalVisible(false);
        handleSave();
    };

    const handleCancelConfirmation = () => {
        setIsConfirmationModalVisible(false);
    };

    const handleSave = async () => {
        if (!shrimpSize) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập cỡ tôm hiện tại',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        const validReceivingPonds = receivingPonds.filter(p => p.quantity.trim() !== '');
        if (validReceivingPonds.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập số lượng cho ít nhất một ao nhận',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        // Check if all receiving ponds with quantity have selected a pond
        const pondsWithoutSelection = validReceivingPonds.filter(p => !p.receivingPond);
        if (pondsWithoutSelection.length > 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn ao nhận cho tất cả các dòng có số lượng',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        if (!pond?.id) {
            navigation.goBack();
            return;
        }

        const pondId = pond.id;
        const currentItems = getPondJobItems(pondId, 'TRANSFER_POND');

        // Time & date formatting (reuse pattern from feeding)
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
                shrimpSize,
                transferMethod,
                receivingPonds,
            } as TransferMeta,
        };

        if (itemToEdit) {
            // Update existing TRANSFER_POND job (local only, API doesn't support update)
            const updatedItems = currentItems.map(item =>
                item.id === itemToEdit.id ? { ...item, ...baseData } : item
            );
            updatePondJob(pondId, 'TRANSFER_POND', updatedItems);
            showEditJobSuccessToast('TRANSFER_POND');
        } else {
            // Prepare API request data - map receivingPonds to API format
            const toPondsData = validReceivingPonds.map(p => ({
                toPondId: p.receivingPond || '',
                // Remove formatting (dots, commas) before parsing - p.quantity may be "300.006" formatted
                quantity: parseInt(p.quantity.replace(/\D/g, ''), 10) || 0,
            }));
            // Backend validates: totalStocking must match the measured value (DB value)
            // Using totalEstimatedShrimp ensures we send the DB-derived value if available
            const apiRequestData: CreateStockTransferRequest = {
                toPonds: toPondsData,
                totalStocking: totalEstimatedShrimp, // Use DB value (Measured)
                shrimpSizePcsPerKg: parseInt(shrimpSize, 10) || 0,
                notes: notes || undefined,
            };

            try {
                // Call API to create stock transfer
                await createStockTransfer({
                    pondId,
                    data: apiRequestData,
                    zoneId: pond.zoneId?.toString(),
                });

                // Create new TRANSFER_POND job with proper next index
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

                updatePondJob(pondId, 'TRANSFER_POND', [...currentItems, newItem]);
                allowNavigation();
            } catch {
                return;
            }
        }
        allowNavigation();
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sang ao</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <SafeInputLayout contentContainerStyle={styles.scrollContent} extraScrollHeight={150}>
                <GeneralInfoBox
                    type="default"
                    date={selectedDate}
                    onDateChange={setSelectedDate}
                    disabledDate={true}
                />

                <CurrentPondInfoBox
                    shrimpBreed={shrimpBreed}
                    actualStockingQuantity={actualStockingQuantity}
                    shrimpSize={shrimpSize}
                    onShrimpSizeChange={setShrimpSize}
                    totalEstimatedShrimp={totalEstimatedShrimp}
                />

                <TransferInfoBox
                    transferMethod={transferMethod}
                    onTransferMethodPress={() => {}}
                    receivingPonds={receivingPonds}
                    onReceivingPondsChange={setReceivingPonds}
                    onReceivingPondPress={_id => {}}
                    totalEstimatedShrimp={totalEstimatedShrimp}
                    pondOptions={pondOptions}
                    onDropdownOpen={handleDropdownOpen}
                />

                <SelectionNotesBox notes={notes} onNotesChange={setNotes} />
            </SafeInputLayout>

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

            {UnsavedChangesModal}
            {/* Confirmation Modal */}
            <ConfirmationModal
                visible={isConfirmationModalVisible}
                onConfirm={handleConfirmSave}
                onCancel={handleCancelConfirmation}
                type="transfer"
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
    scrollContent: {
        padding: 0,
        paddingBottom: 150,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
