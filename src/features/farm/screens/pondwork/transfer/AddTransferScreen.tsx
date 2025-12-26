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
import { useFarm } from '@/features/farm/context/FarmContext';
import { TransferMeta } from '@/features/farm/types/farm.types';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { formatDate, parseDate } from '@/features/farm/utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'AddTransferScreen'>;

export const AddTransferScreen: React.FC = () => {
    // ========== HOOKS ==========
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const insets = useSafeAreaInsets();
    const { setTabBarVisible } = useTabBarVisibility();
    const {
        getPondJobItems,
        updatePondJob,
        ponds,
        getCurrentCycleForPond,
        breedOptions,
        handleTransferPond,
        calculateTotalEstimatedShrimp,
        activeCycles,
        getCyclesByPondId,
        deleteCycle,
        deleteActiveCycle,
    } = useFarm();

    // ========== ROUTE PARAMS ==========
    const {
        pond,
        itemToEdit,
        latestShrimpSize: latestShrimpSizeFromParams,
        cycleData: cycleDataFromParams,
    } = route.params || {};

    // ========== COMPUTED VALUES ==========
    // Meta data from itemToEdit
    const meta = useMemo(() => (itemToEdit?.meta as TransferMeta) || {}, [itemToEdit?.meta]);

    // ========== STATE ==========
    const [selectedDate, setSelectedDate] = useState<Date>(
        itemToEdit?.date ? parseDate(itemToEdit.date) : new Date()
    );
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

    // Pond options for receiving ponds dropdown (exclude current pond)
    const pondOptions = useMemo(() => {
        if (!pond?.id) return [];
        return ponds
            .filter(p => p.id !== pond.id)
            .map(p => ({
                id: p.id,
                label: p.name,
            }));
    }, [ponds, pond?.id]);

    // Get cycle data from params or calculate if not provided (fallback for edit mode)
    const cycleData = useMemo(() => {
        if (cycleDataFromParams !== undefined) {
            return cycleDataFromParams; // Data provided from parent
        }
        if (!pond?.id) return null;
        return getCurrentCycleForPond(pond.id);
    }, [cycleDataFromParams, pond?.id, getCurrentCycleForPond]);

    const shrimpBreed = cycleData?.breedSource
        ? breedOptions.find(b => b.value === cycleData.breedSource)?.label
        : undefined;

    const actualStockingQuantity = cycleData?.stockingQuantity ?? 0;

    // Calculate total estimated shrimp (kg): (Số lượng thả thực tế × Tỉ lệ sống dự kiến) / Cỡ tôm (con/kg)
    const totalEstimatedShrimp = useMemo(() => {
        return calculateTotalEstimatedShrimp(actualStockingQuantity, shrimpSize, pond?.id);
    }, [actualStockingQuantity, shrimpSize, pond?.id, calculateTotalEstimatedShrimp]);

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
        if (!itemToEdit || !initialData) return true;

        const currentDateStr = selectedDate.toDateString();
        const initialDateStr = initialData.date.toDateString();
        if (currentDateStr !== initialDateStr) return true;
        if (notes !== initialData.notes) return true;
        if (shrimpSize !== initialData.shrimpSize) return true;
        if (transferMethod !== initialData.transferMethod) return true;
        if (JSON.stringify(receivingPonds) !== JSON.stringify(initialData.receivingPonds))
            return true;

        return false;
    }, [itemToEdit, initialData, selectedDate, notes, shrimpSize, transferMethod, receivingPonds]);

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
                if (prev.length === 1 && prev[0].quantity === '') {
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

    const handleSave = () => {
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
            // Update existing TRANSFER_POND job
            const updatedItems = currentItems.map(item =>
                item.id === itemToEdit.id ? { ...item, ...baseData } : item
            );
            updatePondJob(pondId, 'TRANSFER_POND', updatedItems);
            showEditJobSuccessToast('TRANSFER_POND');
        } else {
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
            };

            updatePondJob(pondId, 'TRANSFER_POND', [...currentItems, newItem]);
            showAddJobSuccessToast('TRANSFER_POND');

            // Handle transfer: create cycles for receiving ponds
            handleTransferPond(
                pondId,
                receivingPonds.map(p => ({
                    receivingPond: p.receivingPond,
                    quantity: p.quantity,
                })),
                formatDate(selectedDate)
            );

            // Close source cycle (delete from cycles and activeCycles) - same logic as harvest
            const currentCycle = activeCycles[pondId];
            const cyclesForPond = getCyclesByPondId(pondId);

            // Ưu tiên cycle từ activeCycles, nếu không có thì tìm trong cycles
            const cycleToDelete =
                currentCycle ||
                cyclesForPond.find(cycle => cycle.sourcePonds?.includes(pondId)) ||
                cyclesForPond[0];

            if (cycleToDelete && cycleToDelete.id) {
                // Xóa cycle khỏi cycles array
                console.log('Xóa cycle khỏi cycles array:', cycleToDelete.id);
                deleteCycle(cycleToDelete.id);

                // Tìm tất cả các ponds có cycle này trong activeCycles và xóa chúng
                Object.keys(activeCycles).forEach(pondIdKey => {
                    const cycleInActive = activeCycles[pondIdKey];
                    if (cycleInActive && cycleInActive.id === cycleToDelete.id) {
                        deleteActiveCycle(pondIdKey);
                    }
                });
            }
        }

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
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <GeneralInfoBox type="default" date={selectedDate} onDateChange={setSelectedDate} />

                <CurrentPondInfoBox
                    shrimpBreed={shrimpBreed}
                    actualStockingQuantity={actualStockingQuantity}
                    shrimpSize={shrimpSize}
                    onShrimpSizeChange={setShrimpSize}
                    totalEstimatedShrimp={totalEstimatedShrimp}
                />

                <TransferInfoBox
                    transferMethod={transferMethod}
                    onTransferMethodPress={() => {
                        console.log('Select transfer method');
                    }}
                    receivingPonds={receivingPonds}
                    onReceivingPondsChange={setReceivingPonds}
                    onReceivingPondPress={id => {
                        console.log('Select receiving pond for id:', id);
                    }}
                    totalEstimatedShrimp={totalEstimatedShrimp}
                    pondOptions={pondOptions}
                />

                <SelectionNotesBox notes={notes} onNotesChange={setNotes} />
            </ScrollView>

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
