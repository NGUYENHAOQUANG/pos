import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { colors, spacing, borderRadius } from '@/styles';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';
import { InventoryGeneralInfo } from '@/features/material/components/inventory/InventoryGeneralInfo';
import { InventoryMaterialList } from '@/features/material/components/inventory/InventoryMaterialList';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { useWarehouses, useWarehouseItems } from '@/features/material/hooks/useWarehouses';
import {
    useCreateInventoryCheck,
    useInventoryForm,
    useMaterialOptions,
    useInventorySubmit,
    useDeleteInventoryTicket,
} from '@/features/material/hooks/inventory';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { formatMaterialDate, formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import { useUserProfile } from '@/features/menu/hooks/useUserProfile';
import { IconTrashOutlined } from '@/assets/icons';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { materialApi } from '@/features/material/api/materialApi';

interface AddInventoryScreenProps {}

type MainTabParams = {
    screen: 'Material';
    params: { selectedTab: 'inventory' };
};

type LocalNavigationProp = NativeStackNavigationProp<
    Omit<MaterialStackParamList, 'MainTabs'> & {
        MainTabs: MainTabParams;
    }
>;

export const AddInventoryScreen: React.FC<AddInventoryScreenProps> = () => {
    const navigation = useNavigation<LocalNavigationProp>();
    const route = useRoute<RouteProp<MaterialStackParamList, 'AddInventory'>>();
    const params = route.params;
    const initialMaterialName = params?.initialMaterialName;
    const inventoryId = params?.inventoryId;
    const isEditMode = !!inventoryId;

    // Get current user
    const { userData } = useUserProfile();

    // Get warehouse data
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const { data: warehouses } = useWarehouses({ ZoneId: selectedZoneId || undefined });
    const warehouseId = warehouses?.[0]?.id;

    // Fetch warehouse items
    const { data: warehouseItemsResponse } = useWarehouseItems(warehouseId, undefined, {
        enabled: !!warehouseId,
    });
    const warehouseItems = React.useMemo(
        () => warehouseItemsResponse?.items || [],
        [warehouseItemsResponse]
    );

    // API Hooks
    const { mutate: createInventoryCheck, isPending: isCreating } = useCreateInventoryCheck();

    const { mutate: deleteInventoryCheck, isPending: isDeleting } = useDeleteInventoryTicket();
    const isSubmitting = isCreating || isDeleting;

    // Tab bar visibility
    const { setTabBarVisible } = useTabBarVisibility();
    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // Custom hooks for form management
    const { formState, setters } = useInventoryForm({ inventoryId });
    const {
        date,
        note,

        isLoadingDetail,
        status,
    } = formState;

    // Use creator name from API if available (in edit mode), otherwise use current user name
    const creatorName = formState.creatorName || userData.name || '---';

    // Material options
    const materialOptions = useMaterialOptions(warehouseItems);

    // Form submission handlers
    const { handleSaveDraft, handleSubmit } = useInventorySubmit({
        isEditMode,
        inventoryId,
        warehouseId,
        note: formState.note,
        items: formState.items,
        createInventoryCheck,
    });

    // Delete Logic
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const handleDeletePress = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (!inventoryId) return;

        deleteInventoryCheck(inventoryId, {
            onSuccess: () => {
                setDeleteModalVisible(false);
                navigation.goBack();
            },
        });
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
    };

    // UI state
    const scrollViewRef = React.useRef<ScrollView>(null);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    // Handle initial material selection
    useEffect(() => {
        if (initialMaterialName && warehouseItems.length > 0) {
            const materialToSelect = warehouseItems.find(
                m => m.materialName === initialMaterialName
            );
            if (materialToSelect) {
                setters.setItems([
                    {
                        id: Date.now().toString(),
                        materialId: materialToSelect.materialId,
                        materialName: materialToSelect.materialName,
                        oldStock: materialToSelect.quantity || 0,
                        newStock: '',
                        difference: 0,
                        unit: materialToSelect.unitName,
                    },
                ]);
            }
        }
    }, [initialMaterialName, warehouseItems, setters]);

    // Handlers
    // Scroll handling constants
    const HEADER_HEIGHT = 280; // Estimated height of InventoryInformation
    const ITEM_HEIGHT = 280; // Estimated height of each item card

    const handleDropdownOpen = (itemIndex: number) => {
        setTimeout(() => {
            const scrollY = HEADER_HEIGHT + itemIndex * ITEM_HEIGHT;
            scrollViewRef.current?.scrollTo({
                y: Math.max(0, scrollY - 50),
                animated: true,
            });
        }, 100);
    };

    const handleDateConfirm = (selectedDate: Date) => {
        setters.setDate(selectedDate);
        setDatePickerVisible(false);
    };

    // Custom Delete Button
    const deleteButton = (
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeletePress}
            activeOpacity={0.7}
        >
            <IconTrashOutlined width={20} height={20} />
        </TouchableOpacity>
    );

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <Loading isLoading={isSubmitting || isLoadingDetail}>
                <View style={styles.container}>
                    <HeaderMeterial
                        title={
                            isEditMode
                                ? 'Chỉnh Sửa Phiếu Điều Chỉnh Tồn Kho'
                                : 'Tạo Phiếu Điều Chỉnh Tồn Kho'
                        }
                        onBackPress={() => navigation.goBack()}
                        rightComponent={
                            isEditMode && ['Draft', 'Rejected'].includes(status)
                                ? deleteButton
                                : undefined
                        }
                    />

                    <SafeInputLayout>
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.scrollView}
                            contentContainerStyle={styles.contentContainer}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Thông tin chung */}
                            <InventoryGeneralInfo
                                date={formatMaterialDate(date)}
                                createdDate={formatMaterialDateTime(date)}
                                note={note}
                                onDatePress={() => setDatePickerVisible(true)}
                                onNoteChange={setters.setNote}
                                warehouseName={warehouses?.[0]?.name}
                                creatorName={creatorName}
                            />

                            {/* Nhập liệu vật tư */}
                            <View style={styles.dropdownSection}>
                                <InventoryMaterialList
                                    items={formState.items}
                                    onUpdateItem={async (id, field, value) => {
                                        if (field === 'materialId') {
                                            const selectedMat = warehouseItems.find(
                                                m => m.materialId === value
                                            );

                                            let unitName =
                                                selectedMat?.unitName ||
                                                (selectedMat as any)?.UnitName ||
                                                '';

                                            // If unit name is missing from warehouse item, fetch it from detail API
                                            if (!unitName && value) {
                                                try {
                                                    const res = await materialApi.getById(value);
                                                    if (res.success && res.data) {
                                                        unitName =
                                                            res.data.unitName ||
                                                            (res.data as any).UnitName ||
                                                            '';
                                                    }
                                                } catch (err) {
                                                    console.warn(
                                                        'Failed to fetch material unit',
                                                        err
                                                    );
                                                }
                                            }

                                            setters.setItems(prev =>
                                                prev.map(item => {
                                                    if (item.id === id) {
                                                        const updated = { ...item, [field]: value };
                                                        if (selectedMat) {
                                                            updated.materialName =
                                                                selectedMat.materialName;
                                                            updated.oldStock =
                                                                selectedMat.quantity || 0;
                                                            updated.unit = unitName;
                                                        }
                                                        // Clear ID to force Add (and Delete old via diff)
                                                        updated.inventoryCheckItemId = undefined;
                                                        return updated;
                                                    }
                                                    return item;
                                                })
                                            );
                                        } else {
                                            setters.setItems(prev =>
                                                prev.map(item =>
                                                    item.id === id
                                                        ? { ...item, [field]: value }
                                                        : item
                                                )
                                            );
                                        }
                                    }}
                                    onAddItem={() => {
                                        setters.setItems(prev => [
                                            ...prev,
                                            {
                                                id: Date.now().toString(),
                                                materialId: '',
                                                materialName: '',
                                                oldStock: 0,
                                                newStock: '',
                                                difference: 0,
                                                unit: '',
                                            },
                                        ]);
                                    }}
                                    onRemoveItem={id => {
                                        setters.setItems(prev =>
                                            prev.filter(item => item.id !== id)
                                        );
                                    }}
                                    materialOptions={materialOptions}
                                    onDropdownOpen={handleDropdownOpen}
                                />
                            </View>
                        </ScrollView>
                    </SafeInputLayout>

                    {/* Nút Gửi Phiếu */}
                    <ButtonBarMaterial
                        mode="double"
                        primaryTitle="Gửi Phiếu"
                        secondaryTitle="Lưu Nháp"
                        onPrimaryPress={handleSubmit}
                        onSecondaryPress={handleSaveDraft}
                        containerStyle={{
                            borderTopWidth: 1,
                            borderTopColor: colors.gray[200],
                        }}
                        secondaryButtonStyle={{
                            flex: 1,
                            minWidth: 0,
                            borderColor: colors.blue[600],
                        }}
                        secondaryButtonTextStyle={{ color: colors.blue[600] }}
                        primaryButtonStyle={{ flex: 1 }}
                    />
                    {/* Modal Chọn Ngày */}
                    <DatePickerModal
                        visible={isDatePickerVisible}
                        onClose={() => setDatePickerVisible(false)}
                        date={date}
                        onSelectDate={handleDateConfirm}
                    />
                    {/* Confirmation Delete Modal */}
                    <ConfirmationDeleteModal
                        visible={deleteModalVisible}
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCancelDelete}
                        title="Xóa phiếu kiểm kho"
                        message="Bạn có chắc chắn muốn xóa phiếu kiểm kho này không?"
                        showSuccessToast={false}
                    />
                </View>
            </Loading>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: spacing.md,
        paddingBottom: 100,
    },
    dropdownSection: {
        zIndex: 100,
        ...Platform.select({
            android: { elevation: 5 },
            ios: { zIndex: 100 },
        }),
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error,
    },
});
