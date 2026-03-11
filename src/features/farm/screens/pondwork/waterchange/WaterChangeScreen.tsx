import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

import { colors } from '@/styles';
// import { HeaderFarm } from '@/features/farm/components/HeaderFarm'; // Replaced with custom header like Siphon
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';
import {
    GeneralInfoBox,
    GeneralInfoBoxRef,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { WaterSupplyInfoBox } from '@/features/farm/components/pondwork/waterchange/WaterChangeInfoBox';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import {
    MaterialSelectionBox,
    SelectedMaterialItem,
} from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
// import { useFarmStore } from '@/features/farm/store/farmStore'; // Removed
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { WaterSupplyMeta } from '@/features/farm/types/farm.types';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

// API & Hooks
import { waterSupplyApi } from '@/features/farm/api/waterChangeApi';
import {
    useCreateWaterSupplyRecord,
    useUpdateWaterSupplyRecord,
    useDeleteWaterSupplyRecord,
} from '@/features/farm/hooks/useWaterChangeRecords';
import { CreateWaterSupplyCommand } from '@/features/farm/types/waterChange.types';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';

import { documentApi } from '@/features/material/api/documentApi';
import { IWaterSupplyRecord } from '@/features/farm/types/waterChange.types';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'WaterSupply'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const WaterSupplyScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { setTabBarVisible } = useTabBarVisibility();

    const { pond, item } = route.params || {};

    const createMutation = useCreateWaterSupplyRecord();
    const updateMutation = useUpdateWaterSupplyRecord();
    const deleteMutation = useDeleteWaterSupplyRecord();

    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);
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
    const [detailData, setDetailData] = useState<IWaterSupplyRecord | null>(null);

    // Modal Delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // --- Hide Tab Bar ---
    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    // --- Fetch Materials (Warehouse) ---
    const { materials: allMaterials } = useFarmMaterials();

    const materials = useMemo(() => {
        if (!allMaterials.length) return [];

        return allMaterials.filter(m => {
            if (!m.group) return false;
            const name = m.group.toLowerCase();
            return name.includes('thiết bị điện') || name.includes('công cụ');
        });
    }, [allMaterials]);

    // --- Load Data khi Edit ---
    useEffect(() => {
        const fetchDetail = async () => {
            if (pond?.id && item?.id) {
                try {
                    const response = await waterSupplyApi.getDetail(pond.id, item.id);
                    if (response && response.data) {
                        setDetailData(response.data);
                    }
                } catch (e) {
                    console.error('Fetch detail error:', e);
                }
            }
        };
        fetchDetail();
    }, [pond?.id, item?.id]);

    // Bind Basic Data
    useEffect(() => {
        if (!detailData) return;

        if (detailData.createdAt) setSelectedDate(new Date(detailData.createdAt));

        if (detailData.waterChangeDetail) {
            const detailAny = detailData.waterChangeDetail as any;
            setTargetLevel(
                detailAny.targetWaterLevel?.toString() ||
                    detailAny.TargetWaterLevel?.toString() ||
                    ''
            );
            setSupplyLevel(
                detailAny.waterAdded?.toString() || detailAny.WaterAdded?.toString() || ''
            );
            setNote(detailAny.note || detailAny.notes || '');

            // Images
            const docIds = detailData.waterChangeDetail.documentIds || detailData.documentIds;
            if (docIds && docIds.length > 0) {
                setDocumentIds(docIds);
                documentApi.getUrls(docIds).then(setImageUris).catch(console.error);
            }
        }
    }, [detailData, setImageUris]);

    // Bind Materials (Wait for materials from warehouse)
    useEffect(() => {
        if (!detailData?.waterChangeDetail?.materials || materials.length === 0) return;

        const mapped = detailData.waterChangeDetail.materials
            .map((m: any) => {
                // Try to find in warehouse items
                // Priority: warehouseItemId, then materialId
                const targetId = m.warehouseItemId || m.materialId;

                let found = materials.find(
                    mat => mat.id === targetId || mat.materialDefId === targetId
                );

                if (found) {
                    return {
                        material: found,
                        quantity: m.quantity,
                        unit: found.unitName,
                    } as SelectedMaterialItem;
                }
                return null;
            })
            .filter(Boolean) as SelectedMaterialItem[];

        // Only set if we found something, to avoid clearing valid user selection if re-runs?
        // Actually for Edit mode, we want to set initial.
        // If user already changed selectedMaterials, this might overwrite?
        // But this only runs when detailData changes or materials loads.
        // detailData changes once. materials might change once.
        // To be safe, checking if selectedMaterials is empty might start initial load only.
        if (mapped.length > 0) {
            setSelectedMaterials(prev => (prev.length === 0 ? mapped : prev));
        }
    }, [detailData, materials]);
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
            drainLevel: H_base >= 0 ? parseFloat(H_base.toFixed(5)).toString() : '0',

            // Thể tích sau xả (m3)
            volumeAfterDrain: V_base > 0 ? V_base.toFixed(0) : '0',

            // Thể tích nước cấp vào (m3)
            volumeSupply: V_add.toFixed(0),

            // Thể tích nước sau cấp (m3)
            volumeAfterSupply: V_total.toFixed(0),
        };
    }, [targetLevel, supplyLevel, pond]);

    const hasChanges = useMemo(() => {
        if (!item) {
            // Creation mode
            return (
                targetLevel !== '' ||
                supplyLevel !== '' ||
                selectedMaterials.length > 0 ||
                note !== '' ||
                imageUris.length > 0
            );
        }

        if (!detailData) return false;

        // Edit mode comparison
        const detailAny = detailData.waterChangeDetail as any;
        const originalTarget =
            detailAny?.targetWaterLevel?.toString() ||
            detailAny?.TargetWaterLevel?.toString() ||
            '';
        const originalSupply =
            detailAny?.waterAdded?.toString() || detailAny?.WaterAdded?.toString() || '';
        const originalNote = detailAny?.note || detailAny?.notes || '';

        if (targetLevel !== originalTarget) return true;
        if (supplyLevel !== originalSupply) return true;
        if (note !== originalNote) return true;

        // Materials comparison
        const originalMaterials = detailData.waterChangeDetail?.materials || [];
        if (selectedMaterials.length !== originalMaterials.length) return true;

        const materialsChanged = selectedMaterials.some(sm => {
            const om = originalMaterials.find(
                (o: any) =>
                    (o.warehouseItemId || o.materialId) === sm.material.id ||
                    (o.warehouseItemId || o.materialId) === sm.material.materialDefId
            );
            if (!om) return true;
            return parseFloat(sm.quantity.toString()) !== parseFloat(om.quantity.toString());
        });

        if (materialsChanged) return true;

        // Image check (simplified comparison)
        const originalDocIds =
            detailData.waterChangeDetail?.documentIds || detailData.documentIds || [];
        if (documentIds.length !== originalDocIds.length) return true;

        return false;
    }, [
        item,
        detailData,
        targetLevel,
        supplyLevel,
        selectedMaterials,
        note,
        imageUris,
        documentIds,
    ]);

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasChanges);

    const handleSave = async () => {
        if (!targetLevel || !supplyLevel) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập đầy đủ thông tin mực nước',
                visibilityTime: 3000,
            });
            return;
        }

        if (selectedMaterials.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn vật tư',
                visibilityTime: 3000,
            });
            return;
        }

        if (!pond?.id) return;

        const currentDocumentIds = generalInfoBoxRef.current?.getUploadedIds() || [];

        // Payload
        // Payload chuẩn theo Swagger
        const payload: CreateWaterSupplyCommand = {
            documentIds: currentDocumentIds, // Array string (Root level)
            waterChangeDetail: {
                // documentIds: currentDocumentIds, // Removed
                targetWaterLevel: parseFloat(targetLevel),
                waterAdded: parseFloat(supplyLevel),
                waterRemoved: parseFloat(calculateInfo.drainLevel) || 0,
                previousVolume: parseFloat(calculateInfo.volumeAfterDrain) || 0,
                finalVolume: parseFloat(calculateInfo.volumeAfterSupply) || 0,
                addedVolume: parseFloat(calculateInfo.volumeSupply) || 0,
                note: note, // "note" (số ít)
                materials: selectedMaterials.map(m => ({
                    warehouseItemId: m.material.id, // warehouseItemId
                    quantity: m.quantity,
                })),
            },
        };

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
            allowNavigation();
            navigation.goBack();
        } catch (error: any) {
            let message = getErrorMessage(error, 'Vui lòng thử lại');

            Toast.show({
                type: 'error',
                text1: 'Lưu thất bại',
                text2: message,
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
                allowNavigation();
                setShowDeleteModal(false);
                navigation.goBack();
                Toast.show({ type: 'success', text1: 'Xóa thành công' });
            } catch (error: any) {
                console.error('Delete error', error);
                Toast.show({
                    type: 'error',
                    text1: 'Xóa thất bại',
                    text2: error?.message || 'Vui lòng thử lại',
                });
            }
        }
    };

    const handleBack = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <HeaderSection
                title={item ? 'Chỉnh sửa Thay/Cấp nước' : 'Thay/Cấp nước'}
                onBack={handleBack}
                rightComponent={item ? <DeleteButton onPress={handleDelete} /> : undefined}
            />

            <View style={styles.contentContainer}>
                <SafeInputLayout
                    contentContainerStyle={styles.scrollContent}
                    extraScrollHeight={100}
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
                    <SelectionNotesBox notes={note} onNotesChange={setNote} />

                    <View style={styles.spacer} />
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

            {UnsavedChangesModal}

            <ConfirmationModalUI
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
