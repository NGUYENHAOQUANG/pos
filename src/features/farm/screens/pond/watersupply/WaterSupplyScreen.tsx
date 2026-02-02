import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius } from '@/styles';
// import { HeaderFarm } from '@/features/farm/components/HeaderFarm'; // Replaced with custom header like Siphon
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    GeneralInfoBox,
    GeneralInfoBoxRef,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { WaterSupplyInfoBox } from '@/features/farm/components/pondwork/watersupply/WaterSupplyInfoBox';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import {
    MaterialSelectionBox,
    SelectedMaterialItem,
} from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
// import { useFarmStore } from '@/features/farm/store/farmStore'; // Removed
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { WaterSupplyMeta } from '@/features/farm/types/farm.types';
import { IMaterial } from '@/features/material/types/material.types';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

// API & Hooks
import { waterSupplyApi } from '@/features/farm/api/waterSupplyApi';
import {
    useCreateWaterSupplyRecord,
    useUpdateWaterSupplyRecord,
    useDeleteWaterSupplyRecord,
} from '@/features/farm/hooks/useWaterSupplyRecords';
import { CreateWaterSupplyCommand } from '@/features/farm/types/waterSupply.types';
import { useMaterials } from '@/features/material/hooks/useMaterials';
import { useWarehouses, useWarehouseItems } from '@/features/material/hooks/useWarehouses';
import { documentApi } from '@/features/material/api/documentApi';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'WaterSupply'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const WaterSupplyScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const insets = useSafeAreaInsets();
    const { setTabBarVisible } = useTabBarVisibility();

    const { pond, item } = route.params || {};

    const createMutation = useCreateWaterSupplyRecord();
    const updateMutation = useUpdateWaterSupplyRecord();
    const deleteMutation = useDeleteWaterSupplyRecord();

    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // Initial Data
    const meta = useMemo(() => (item?.meta as WaterSupplyMeta) || {}, [item?.meta]);

    const [selectedDate, setSelectedDate] = useState(new Date());

    // Thông số nước
    const [targetLevel, setTargetLevel] = useState(meta.targetLevel?.toString() || ''); // H_target
    const [supplyLevel, setSupplyLevel] = useState(meta.supplyLevel?.toString() || ''); // H_add

    // Vật tư & Ghi chú
    const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
    const [note, setNote] = useState(item?.note || '');

    // Images
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [documentIds, setDocumentIds] = useState<string[]>([]);

    // Modal Delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // --- Hide Tab Bar ---
    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    // --- Fetch Materials (Warehouse) ---
    const { data: allMaterials = [] } = useMaterials();
    const { data: warehouses = [] } = useWarehouses({ ZoneId: pond?.zoneId });
    const warehouseId = warehouses?.[0]?.id; // Assume first warehouse
    const { data: warehouseItemsData } = useWarehouseItems(warehouseId, undefined, {
        enabled: !!warehouseId,
    });
    const warehouseItems = useMemo(() => warehouseItemsData?.items || [], [warehouseItemsData]);

    // Filter appropriate materials (Logic from Siphon or generic?)
    // User didn't specify material type restriction for Water Supply, but usually treatments use minerals/chemicals.
    // I will list all available items from warehouse for flexibility unless specified.
    // Siphon filtered for TOOLS, but Water Supply might need chemicals.
    // Let's allow all non-feed items or just all items?
    // Existing code used mock: Zeolite, Chlorine, Vôi nóng (Minerals/Chemicals).
    // Let's enable all items for now, or filter by Group if needed.
    // Usually 'Khoáng', 'Diệt khuẩn', 'Xử lý' are common.

    const materials = useMemo(() => {
        if (!warehouseItems.length || !allMaterials.length) return [];

        return warehouseItems.map(item => {
            const materialDef = allMaterials.find(m => m.id === item.materialId);
            return {
                id: item.id, // warehouseItemId (dùng làm key cho UI)
                materialDefId: item.materialId, // ID định danh vật tư (dùng để gửi API)
                name: item.materialName || materialDef?.name,
                group: materialDef?.group,
                unit: item.unitId,
                unitName: item.unitName || materialDef?.unitName,
                remaining: item.quantity,
            } as IMaterial & { materialDefId: string }; // Mở rộng type tạm thời
        });
    }, [warehouseItems, allMaterials]);

    // --- Load Data khi Edit ---
    useEffect(() => {
        const fetchDetail = async () => {
            if (pond?.id && item?.id) {
                try {
                    const response = await waterSupplyApi.getDetail(pond.id, item.id);
                    if (response && response.data) {
                        const detail = response.data; // IWaterSupplyRecord
                        console.log('API Detail Response:', JSON.stringify(detail, null, 2));

                        // Date
                        if (detail.createdAt) {
                            setSelectedDate(new Date(detail.createdAt));
                        }

                        // Detail fields
                        if (detail.waterChangeDetail) {
                            setTargetLevel(
                                detail.waterChangeDetail.targetWaterLevel?.toString() ||
                                    detail.waterChangeDetail.TargetWaterLevel?.toString() ||
                                    ''
                            );
                            setSupplyLevel(
                                detail.waterChangeDetail.waterAdded?.toString() ||
                                    detail.waterChangeDetail.WaterAdded?.toString() ||
                                    ''
                            );

                            // Check both 'note' and 'notes'
                            setNote(
                                detail.waterChangeDetail.note ||
                                    detail.waterChangeDetail.notes ||
                                    ''
                            );

                            // Load Images
                            const docIds =
                                detail.waterChangeDetail.documentIds || detail.documentIds;
                            if (docIds && docIds.length > 0) {
                                setDocumentIds(docIds);
                                documentApi
                                    .getUrls(docIds)
                                    .then(urls => setImageUris(urls))
                                    .catch(err => console.error('Fetch image URLs failed', err));
                            }

                            // Materials
                            if (detail.waterChangeDetail.materials && warehouseItems.length > 0) {
                                const mappedMaterials: SelectedMaterialItem[] =
                                    detail.waterChangeDetail.materials
                                        .map((m: any) => {
                                            // API trả về materialId hoặc warehouseItemId
                                            const foundItem = warehouseItems.find(
                                                wi =>
                                                    wi.materialId === m.materialId ||
                                                    wi.id === m.warehouseItemId ||
                                                    wi.id === m.materialId ||
                                                    wi.materialId === m.MaterialId // PascalCase check (m.MaterialId)
                                            );
                                            const def = allMaterials.find(
                                                amd => amd.id === foundItem?.materialId
                                            );

                                            if (foundItem) {
                                                return {
                                                    material: {
                                                        id: foundItem.id,
                                                        materialDefId: foundItem.materialId,
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
                                setSelectedMaterials(mappedMaterials);
                            }
                        }
                        // ...
                        // ...
                    }
                } catch (e) {
                    console.error('Fetch detail error:', e);
                }
            }
        };

        fetchDetail();
    }, [pond?.id, item?.id, warehouseItems, allMaterials]);
    // ---LOGIC TÍNH TOÁN THEO CÔNG THỨC---
    const calculateInfo = useMemo(() => {
        // 1. Kiểm tra nếu chưa nhập liệu thì trả về '-'
        if (targetLevel === '' || supplyLevel === '') {
            return {
                drainLevel: '-',
                volumeAfterDrain: '-',
                volumeSupply: '-',
                volumeAfterSupply: '-',
            };
        }

        // 2. Lấy dữ liệu đầu vào
        const H_target = parseFloat(targetLevel);
        const H_add = parseFloat(supplyLevel);

        // Xác định Diện tích ao (S)
        let S = 1000; // Giá trị mặc định
        if (pond?.area) {
            const areaStr = String(pond.area).replace(/[^0-9.]/g, '');
            const parsedArea = parseFloat(areaStr);
            if (!isNaN(parsedArea) && parsedArea > 0) {
                S = parsedArea;
            }
        }

        // 3. Áp dụng công thức
        // H_base = H_target - H_add
        const H_base = H_target - H_add;

        // V_base = S * (H_base / 100)
        const V_base = S * (H_base / 100);

        // V_add = S * (H_add / 100)
        const V_add = S * (H_add / 100);

        // V_total = S * (H_target / 100)
        const V_total = S * (H_target / 100);

        return {
            // Mực nước xả xuống (cm)
            drainLevel: H_base >= 0 ? H_base.toString() : '0',

            // Thể tích sau xả (m3)
            volumeAfterDrain: V_base > 0 ? V_base.toFixed(0) : '0',

            // Thể tích nước cấp vào (m3)
            volumeSupply: V_add.toFixed(0),

            // Thể tích nước sau cấp (m3)
            volumeAfterSupply: V_total.toFixed(0),
        };
    }, [targetLevel, supplyLevel, pond]);

    const handleSave = async () => {
        if (!targetLevel || !supplyLevel) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập đầy đủ thông tin mực nước',
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

        if (!pond?.id) return;

        const currentDocumentIds = generalInfoBoxRef.current?.getUploadedIds() || [];

        // Payload
        // Payload chuẩn theo Swagger
        const payload: CreateWaterSupplyCommand = {
            waterChangeDetail: {
                documentIds: currentDocumentIds, // Array string
                targetWaterLevel: parseFloat(targetLevel),
                waterAdded: parseFloat(supplyLevel),
                waterRemoved: 0, // Default 0
                previousVolume: 0, // Default 0
                finalVolume: 0, // Default 0
                addedVolume: 0, // Default 0
                note: note, // "note" (số ít)
                materials: selectedMaterials.map(m => ({
                    materialId: (m.material as any).materialDefId || m.material.id,
                    quantity: m.quantity,
                })),
            },
        };

        // console.log('HandleSave WaterSupply - Payload:', payload); // Cleaned up to avoid noise, API will log request body

        try {
            if (item) {
                // UPDATE
                await updateMutation.mutateAsync({
                    pondId: pond.id,
                    id: item.id,
                    data: payload,
                });
                generalInfoBoxRef.current?.markAsSaved();
                showEditJobSuccessToast('WATER_CHANGE');
            } else {
                // CREATE
                await createMutation.mutateAsync({
                    pondId: pond.id,
                    data: payload,
                });
                generalInfoBoxRef.current?.markAsSaved();
                showAddJobSuccessToast('WATER_CHANGE');
            }
            navigation.goBack();
        } catch (error) {
            console.error('Save error', error);
            Toast.show({
                type: 'error',
                text1: 'Lưu thất bại',
                text2: 'Vui lòng thử lại',
            });
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (pond?.id && item?.id) {
            try {
                await deleteMutation.mutateAsync({ pondId: pond.id, id: item.id });
                setShowDeleteModal(false);
                navigation.goBack();
                Toast.show({ type: 'success', text1: 'Xóa thành công' });
            } catch (error) {
                console.error('Delete error', error);
                Toast.show({ type: 'error', text1: 'Xóa thất bại' });
            }
        }
    };

    const handleBack = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {item ? 'Chỉnh sửa Thay/Cấp nước' : 'Thay/Cấp nước'}
                </Text>
                {item ? (
                    <DeleteButton onPress={handleDelete} />
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </View>

            <View style={styles.contentContainer}>
                <SafeInputLayout>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* 1. Thông tin chung */}
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

                        {/* 2. Mực nước & Thể tích */}
                        <WaterSupplyInfoBox
                            targetLevel={targetLevel}
                            onTargetLevelChange={setTargetLevel}
                            supplyLevel={supplyLevel}
                            onSupplyLevelChange={setSupplyLevel}
                            // Truyền các giá trị đã tính toán
                            drainLevel={calculateInfo.drainLevel}
                            volumeAfterDrain={calculateInfo.volumeAfterDrain}
                            volumeSupply={calculateInfo.volumeSupply}
                            volumeAfterSupply={calculateInfo.volumeAfterSupply}
                        />

                        {/* 3. Chọn vật tư */}
                        <MaterialSelectionBox
                            selectedMaterials={selectedMaterials}
                            onMaterialsChange={setSelectedMaterials}
                            materials={materials}
                        />

                        {/* 4. Ghi chú */}
                        <SelectionNotesBox
                            notes={note}
                            onNotesChange={setNote}
                            scrollViewRef={scrollViewRef}
                        />

                        <View style={styles.spacer} />
                    </ScrollView>
                </SafeInputLayout>
            </View>

            {/* Footer */}
            <ButtonBarFarm
                primaryTitle={item ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSave}
                onSecondaryPress={() => navigation.goBack()}
                style={{ borderTopWidth: 1, borderTopColor: colors.border }}
            />

            <ConfirmationDeleteModal
                visible={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
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
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    spacer: {
        height: 80,
    },
});
