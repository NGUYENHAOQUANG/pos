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
import { InventoryMaterialInput } from '@/features/material/components/inventory/InventoryMaterialInput';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { useWarehouses, useWarehouseItems } from '@/features/material/hooks/useWarehouses';
import {
    useCreateInventoryCheck,
    useUpdateInventoryCheck,
    useInventoryForm,
    useMaterialSelection,
    useMaterialOptions,
    useInventorySubmit,
    useDeleteInventoryTicket,
} from '@/features/material/hooks/inventory';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { formatMaterialDate, formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import { useUserProfile } from '@/features/menu/hooks/useUserProfile';
import { IconTrashOutlined } from '@/assets/icons';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';

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
    const { mutate: updateInventoryCheck, isPending: isUpdating } = useUpdateInventoryCheck();
    const { mutate: deleteInventoryCheck, isPending: isDeleting } = useDeleteInventoryTicket();
    const isSubmitting = isCreating || isUpdating || isDeleting;

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
        materialName,
        oldStock,
        newStock,
        materialGroup,
        selectedMaterialId,
        isLoadingDetail,
        status,
    } = formState;

    // Use creator name from API if available (in edit mode), otherwise use current user name
    const creatorName = formState.creatorName || userData.name || '---';

    // Material options
    const materialOptions = useMaterialOptions(warehouseItems);

    // Material selection handler
    const { handleMaterialSelect } = useMaterialSelection({
        warehouseItems,
        setSelectedMaterialId: setters.setSelectedMaterialId,
        setMaterialName: setters.setMaterialName,
        setOldStock: setters.setOldStock,
        setMaterialGroup: setters.setMaterialGroup,
        setNewStock: setters.setNewStock,
    });

    // Form submission handlers
    const { handleSaveDraft, handleSubmit } = useInventorySubmit({
        isEditMode,
        inventoryId,
        itemId: formState.itemId,
        warehouseId,
        note: formState.note,
        selectedMaterialId: formState.selectedMaterialId,
        newStock: formState.newStock,
        warehouseItems,
        createInventoryCheck,
        updateInventoryCheck,
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
                handleMaterialSelect(materialToSelect.materialId);
            }
        }
    }, [initialMaterialName, warehouseItems, handleMaterialSelect]);

    // Handlers
    const handleDropdownOpen = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200);
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
                                materialGroup={materialGroup}
                                note={note}
                                onDatePress={() => setDatePickerVisible(true)}
                                onNoteChange={setters.setNote}
                                warehouseName={warehouses?.[0]?.name}
                                creatorName={creatorName}
                            />

                            {/* Nhập liệu vật tư */}
                            <View style={styles.dropdownSection}>
                                <InventoryMaterialInput
                                    materialName={materialName}
                                    selectedMaterialId={selectedMaterialId}
                                    oldStock={oldStock}
                                    newStock={newStock}
                                    onMaterialSelect={handleMaterialSelect}
                                    onNewStockChange={setters.setNewStock}
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
