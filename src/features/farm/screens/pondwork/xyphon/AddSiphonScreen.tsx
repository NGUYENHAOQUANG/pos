import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    GeneralInfoBox,
    GeneralInfoBoxRef,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { siphonApi } from '@/features/farm/api/siphonApi';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { SiphonLossBox } from '@/features/farm/components/pondwork/xyphon/SiphonLossBox';
import {
    MaterialSelectionBox,
    SelectedMaterialItem,
} from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { IMaterial, MaterialGroupType } from '@/features/material/types/material.types';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useMaterials } from '@/features/material/hooks/useMaterials';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useWarehouseItems } from '@/features/material/hooks/useWarehouseItems';
import { SiphonMeta } from '@/features/farm/types/farm.types';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { formatDate, parseDate } from '@/features/farm/utils/dateUtils';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'AddSiphonScreen'>;

export const AddSiphonScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond, itemToEdit } = route.params || {};
    const insets = useSafeAreaInsets();
    const { setTabBarVisible } = useTabBarVisibility();
    const scrollViewRef = useRef<ScrollView>(null);
    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);

    // Use individual selectors instead of useFarm() to prevent unnecessary re-renders
    const getPondJobItems = useFarmStore(state => state.getPondJobItems);
    const updatePondJob = useFarmStore(state => state.updatePondJob);

    // Initialize state from itemToEdit if available
    const meta = useMemo(() => (itemToEdit?.meta as SiphonMeta) || {}, [itemToEdit?.meta]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [lossAmount, setLossAmount] = useState<string>(meta.lossAmount || '');
    const [notes, setNotes] = useState<string>(itemToEdit?.note || '');
    const [imageUris, setImageUris] = useState<string[]>(meta.images || []);
    const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>(
        itemToEdit?.materials || []
    );
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // Store initial data for comparison when editing
    const initialData = useMemo(() => {
        if (!itemToEdit) return null;
        return {
            date: (() => {
                const date = itemToEdit.date ? parseDate(itemToEdit.date) : new Date();
                if (itemToEdit.date && itemToEdit.time) {
                    const [hours, minutes] = itemToEdit.time.split(':').map(Number);
                    if (!isNaN(hours) && !isNaN(minutes)) {
                        date.setHours(hours, minutes);
                    }
                }
                return date;
            })(),
            lossAmount: meta.lossAmount || '',
            notes: itemToEdit?.note || '',
            images: meta.images || [],
            materials: itemToEdit.materials || [],
        };
    }, [itemToEdit, meta]);

    // Fetch all materials definitions to check for groups (Tools)
    const { data: allMaterials = [] } = useMaterials();

    // Fetch warehouse for the current farm (Zone)
    const { data: warehouses = [] } = useWarehouses({ ZoneId: pond?.zoneId });
    const warehouseId = warehouses?.[0]?.id; // Assume first warehouse of the zone

    // Fetch items in the warehouse
    const { data: warehouseItemsData } = useWarehouseItems(warehouseId, undefined, {
        enabled: !!warehouseId,
    });
    const warehouseItems = useMemo(() => warehouseItemsData?.items || [], [warehouseItemsData]);

    // Filter and Map: Get "Tools" from the warehouse items
    const materials = useMemo(() => {
        if (!warehouseItems.length || !allMaterials.length) return [];

        return warehouseItems
            .map(item => {
                // Find corresponding material definition to check Group
                const materialDef = allMaterials.find(m => m.id === item.materialId);

                if (materialDef && materialDef.group === MaterialGroupType.TOOLS) {
                    // Return IMaterial-like object, KEY: id must be warehouseItemId
                    return {
                        id: item.id, // Use WarehouseItemId unique to this stock
                        name: item.materialName || materialDef.name,
                        group: MaterialGroupType.TOOLS,
                        unit: item.unitId,
                        unitName: item.unitName || materialDef.unitName,
                        remaining: item.quantity,
                    } as IMaterial;
                }
                return null;
            })
            .filter((item): item is IMaterial => item !== null);
    }, [warehouseItems, allMaterials]);

    // Hide tab bar when this screen is mounted
    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const handleDeletePress = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (pond?.id && itemToEdit) {
            const currentItems = getPondJobItems(pond.id, 'SIPHON');
            const updatedItems = currentItems.filter(item => item.id !== itemToEdit.id);
            updatePondJob(pond.id, 'SIPHON', updatedItems);
            setDeleteModalVisible(false);
            navigation.goBack();
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
    };

    // Check if data has changed from initial (when editing)
    const hasChanges = useMemo(() => {
        if (!itemToEdit || !initialData) return true; // New item always has "changes"

        // Compare dates (only date part, not time)
        const currentDateStr = selectedDate.toDateString();
        const initialDateStr = initialData.date.toDateString();
        if (currentDateStr !== initialDateStr) return true;

        // Compare other fields
        if (lossAmount !== initialData.lossAmount) return true;
        if (notes !== initialData.notes) return true;

        // Compare images arrays
        if (JSON.stringify(imageUris) !== JSON.stringify(initialData.images)) return true;

        // Compare materials arrays
        if (JSON.stringify(selectedMaterials) !== JSON.stringify(initialData.materials))
            return true;

        return false;
    }, [itemToEdit, initialData, selectedDate, lossAmount, notes, imageUris, selectedMaterials]);

    const isButtonDisabled = itemToEdit && !hasChanges;

    const handleSave = async () => {
        if (!lossAmount.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập số tôm hao',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        if (selectedMaterials.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn vật tư',
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
        const currentItems = getPondJobItems(pondId, 'SIPHON');

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
            materials: selectedMaterials,
            meta: {
                ...(itemToEdit?.meta || {}),
                lossAmount,
                images: imageUris,
            } as SiphonMeta,
        };

        if (itemToEdit) {
            // Update existing SIPHON job - Keep local logic for now as only POST was requested
            const updatedItems = currentItems.map(item =>
                item.id === itemToEdit.id ? { ...item, ...baseData } : item
            );
            updatePondJob(pondId, 'SIPHON', updatedItems);
            showEditJobSuccessToast('SIPHON');
            navigation.goBack();
        } else {
            // Create new SIPHON job via API
            try {
                const documentIds = generalInfoBoxRef.current?.getUploadedIds() || [];

                const success = await siphonApi.create(pondId, {
                    value: 0, // Default value as not specified in UI
                    documentIds,
                    siphonDetail: {
                        shrimplossKg: parseFloat(lossAmount) || 0,
                        notes: notes,
                        materials: selectedMaterials.map(m => ({
                            warehouseItemId: m.material.id,
                            quantity: m.quantity,
                        })),
                    },
                });

                if (success) {
                    // Mark files as saved to prevent auto-cleanup
                    generalInfoBoxRef.current?.markAsSaved();

                    // Optimistically update store or fetch new data?
                    // For now, ensuring UI feedback
                    showAddJobSuccessToast('SIPHON');

                    // Also update local store to maintain "old logic" behavior of immediate update
                    // Note: This creates a temporary ID. Ideally we should refetch.
                    // But to "ensure old functional logic works normally" (which was immediate list update),
                    // we keep the local update as well, OR we assume list screen auto-refetches.
                    // Given previous conversations about "Migrate Farm API", auto-refetch might be in place.
                    // I will ADD the local update as a fallback/optimistic update to be safe and consistent with "old logic".
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
                        id: Date.now().toString(), // Helper ID, real one comes from server
                        ...baseData,
                        label: `Lần ${nextIndex}`,
                        pondId: pondId,
                    };
                    updatePondJob(pondId, 'SIPHON', [...currentItems, newItem]);

                    navigation.goBack();
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Lưu thất bại',
                        text2: 'Vui lòng thử lại sau',
                    });
                }
            } catch (error) {
                console.error('Save siphon error:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Lưu thất bại',
                    text2: 'Có lỗi xảy ra khi gọi API',
                });
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Xi-Phông</Text>
                {itemToEdit ? (
                    <DeleteButton onPress={handleDeletePress} />
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </View>

            {/* Content */}
            <SafeInputLayout>
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <GeneralInfoBox
                        ref={generalInfoBoxRef}
                        type="withImage"
                        date={selectedDate}
                        onDateChange={setSelectedDate}
                        imageUris={imageUris}
                        onImagesChange={setImageUris}
                        disabledDate={true}
                    />

                    <SiphonLossBox lossAmount={lossAmount} onLossAmountChange={setLossAmount} />

                    <MaterialSelectionBox
                        selectedMaterials={selectedMaterials}
                        onMaterialsChange={setSelectedMaterials}
                        materials={materials}
                    />

                    <SelectionNotesBox
                        notes={notes}
                        onNotesChange={setNotes}
                        scrollViewRef={scrollViewRef}
                    />
                </ScrollView>
            </SafeInputLayout>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleSave}
                    onSecondaryPress={handleCancel}
                    primaryDisabled={isButtonDisabled}
                />
            </View>

            {/* Delete Confirmation Modal */}
            <ConfirmationDeleteModal
                visible={deleteModalVisible}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
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
        paddingBottom: 100,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
