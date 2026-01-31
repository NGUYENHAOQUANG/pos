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
import {
    useCreateSiphonRecord,
    useUpdateSiphonRecord,
    useDeleteSiphonRecord,
} from '@/features/farm/hooks/useSiphonRecords';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { SiphonLossBox } from '@/features/farm/components/pondwork/xyphon/SiphonLossBox';
import {
    MaterialSelectionBox,
    SelectedMaterialItem,
} from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { IMaterial, MaterialGroupType } from '@/features/material/types/material.types';
import { useMaterials } from '@/features/material/hooks/useMaterials';
import { useWarehouses, useWarehouseItems } from '@/features/material/hooks/useWarehouses';
import { documentApi } from '@/features/material/api/documentApi';
import { SiphonMeta } from '@/features/farm/types/farm.types';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { parseDate } from '@/features/farm/utils/dateUtils';
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

    const createMutation = useCreateSiphonRecord();
    const updateMutation = useUpdateSiphonRecord();
    const deleteMutation = useDeleteSiphonRecord();

    // Initialize state from itemToEdit if available
    const meta = useMemo(() => (itemToEdit?.meta as SiphonMeta) || {}, [itemToEdit?.meta]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [lossAmount, setLossAmount] = useState<string>(meta.lossAmount || '');
    const [notes, setNotes] = useState<string>(itemToEdit?.note || '');
    const [imageUris, setImageUris] = useState<string[]>(meta.images || []);
    const [documentIds, setDocumentIds] = useState<string[]>(itemToEdit?.images || []);
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

    // Fetch detail when editing
    useEffect(() => {
        const fetchDetail = async () => {
            if (pond?.id && itemToEdit?.id) {
                try {
                    const response = await siphonApi.getDetail(pond.id, itemToEdit.id);
                    if (response && response.data) {
                        const detail = response.data;

                        // Update Date
                        if (detail.createdAt) {
                            setSelectedDate(new Date(detail.createdAt));
                        }

                        // Update Siphon Detail
                        if (detail.siphonDetail) {
                            setLossAmount(detail.siphonDetail.shrimpLossKg?.toString() || '');
                            setNotes(detail.siphonDetail.notes || '');

                            // Update Materials
                            if (detail.siphonDetail.materials && warehouseItems.length > 0) {
                                const mappedMaterials: SelectedMaterialItem[] =
                                    detail.siphonDetail.materials
                                        .map((m: any) => {
                                            // Find material in warehouseItems
                                            const foundItem = warehouseItems.find(
                                                wi => wi.id === m.warehouseItemId
                                            );
                                            if (foundItem) {
                                                // Find definition for unit name fallback
                                                const def = allMaterials.find(
                                                    amd => amd.id === foundItem.materialId
                                                );
                                                return {
                                                    material: {
                                                        id: foundItem.id,
                                                        name:
                                                            foundItem.materialName ||
                                                            def?.name ||
                                                            '',
                                                        unitName:
                                                            foundItem.unitName ||
                                                            def?.unitName ||
                                                            '',
                                                        remaining: foundItem.quantity,
                                                    } as any,
                                                    quantity: m.quantity,
                                                    unit: foundItem.unitName || def?.unitName || '',
                                                };
                                            }
                                            return null;
                                        })
                                        .filter((m: any) => m !== null);

                                if (mappedMaterials.length > 0) {
                                    setSelectedMaterials(mappedMaterials);
                                }
                            }
                        }

                        // Update Images
                        if (detail.documentIds && detail.documentIds.length > 0) {
                            try {
                                // Fetch URLs for document IDs
                                const results = await Promise.all(
                                    detail.documentIds.map(async (id: string) => {
                                        try {
                                            const url = await documentApi.getUrl(id);
                                            return { id, url };
                                        } catch (e) {
                                            console.error('Error fetching document URL:', e);
                                            return { id, url: null };
                                        }
                                    })
                                );
                                const validResults = results.filter(
                                    (r): r is { id: string; url: string } => !!r.url
                                );
                                setImageUris(validResults.map(r => r.url));
                                setDocumentIds(validResults.map(r => r.id));
                            } catch (e) {
                                console.error('Error fetching image URLs:', e);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Fetch siphon detail error:', error);
                }
            }
        };

        if (itemToEdit) {
            fetchDetail();
        }
    }, [pond?.id, itemToEdit, warehouseItems, allMaterials]);

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

    const handleConfirmDelete = async () => {
        if (pond?.id && itemToEdit?.id) {
            try {
                await deleteMutation.mutateAsync({ pondId: pond.id, id: itemToEdit.id });
                setDeleteModalVisible(false);
                navigation.goBack();
                Toast.show({
                    type: 'success',
                    text1: 'Xóa thành công',
                });
            } catch (error) {
                console.error('Delete error:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Xóa thất bại',
                    text2: 'Vui lòng thử lại',
                });
            }
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

        // Prepare payload
        const documentIds = generalInfoBoxRef.current?.getUploadedIds() || [];
        const payload = {
            value: 0,
            documentIds,
            siphonDetail: {
                shrimpLossKg: parseFloat(lossAmount) || 0,
                notes: notes,
                materials: selectedMaterials.map(m => ({
                    warehouseItemId: m.material.id,
                    quantity: m.quantity,
                })),
            },
        };

        try {
            if (itemToEdit) {
                // UPDATE
                await updateMutation.mutateAsync({
                    pondId,
                    id: itemToEdit.id,
                    data: payload,
                });

                generalInfoBoxRef.current?.markAsSaved(); // Prevent cleanup
                showEditJobSuccessToast('SIPHON');
                navigation.goBack();
            } else {
                // CREATE
                await createMutation.mutateAsync({
                    pondId,
                    data: payload,
                });

                generalInfoBoxRef.current?.markAsSaved(); // Prevent cleanup
                showAddJobSuccessToast('SIPHON');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Save siphon error:', error);
            Toast.show({
                type: 'error',
                text1: 'Lưu thất bại',
                text2: 'Có lỗi xảy ra khi gọi API',
            });
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
                        documentIds={documentIds}
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
