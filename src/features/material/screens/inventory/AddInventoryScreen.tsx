import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Platform, StatusBar, Text } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { colors, spacing } from '@/styles';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';
import { InventoryGeneralInfo } from '@/features/material/components/inventory/InventoryGeneralInfo';
import { InventoryMaterialInput } from '@/features/material/components/inventory/InventoryMaterialInput';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { showValidationError } from '@/features/material/utils/validationToast';
import { useWarehouseItems } from '@/features/material/hooks/useWarehouseItems';
import { useCreateInventoryCheck } from '@/features/material/hooks/useCreateInventoryCheck';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { formatMaterialDate, formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import { IWarehouseItem } from '@/features/material/types/material.types';
import { useUserProfile } from '@/features/menu/hooks/useUserProfile';

interface AddInventoryScreenProps {}

// Define strict types for navigation targets locally since we cannot edit AppStack
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

    // Get current user from User Profile Hook (fetches fresh data from API)
    const { userData } = useUserProfile();
    const creatorName = userData.name || '---';

    // Use React Query for materials data
    // Auto-select warehouse
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const { data: warehouses } = useWarehouses({ ZoneId: selectedZoneId || undefined });
    const warehouseId = warehouses?.[0]?.id;

    // Fetch materials filtered by Warehouse
    // This ensures we only see items valid for this warehouse context
    const { data: warehouseItemsResponse } = useWarehouseItems(warehouseId, undefined, {
        enabled: !!warehouseId,
    });
    const warehouseItems = React.useMemo(
        () => warehouseItemsResponse?.items || [],
        [warehouseItemsResponse]
    );

    // Real API Hooks
    const { mutate: createInventoryCheck, isPending: isSubmitting } = useCreateInventoryCheck();

    const { setTabBarVisible } = useTabBarVisibility();

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // --- States ---
    const scrollViewRef = React.useRef<ScrollView>(null);
    const [date, setDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [note, setNote] = useState('');

    // State vật tư
    const [materialName, setMaterialName] = useState('');
    const [oldStock, setOldStock] = useState(0);
    const [newStock, setNewStock] = useState('');
    const [materialGroup, setMaterialGroup] = useState('');
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');

    // Auto-select warehouse
    // warehouseId is already defined at top of component for filtering
    // const warehouseId = warehouses?.[0]?.id; // Removed duplicate

    // Utilize DropdownOption[] for robust selection
    const materialOptions = warehouseItems.map((m: IWarehouseItem) => ({
        label: m.materialName || 'Unknown Material',
        value: m.materialId,
    }));

    // --- Handlers ---
    const handleDropdownOpen = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200);
    };

    const handleDateConfirm = (selectedDate: Date) => {
        setDate(selectedDate);
        setDatePickerVisible(false);
    };

    const handleMaterialSelect = useCallback(
        (val: string) => {
            // val is now the ID
            setSelectedMaterialId(val);
            // Find material by ID
            const selectedItem = warehouseItems.find((m: IWarehouseItem) => m.materialId === val);

            if (selectedItem) {
                setMaterialName(selectedItem.materialName || '');
                setOldStock(selectedItem.quantity || 0);
                setMaterialGroup(''); // WarehouseItem might not have group info directly
            } else {
                setMaterialName('');
                setOldStock(0);
                setMaterialGroup('');
            }
            setNewStock('');
        },
        [warehouseItems]
    );

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

    // Common validation logic
    const validateForm = () => {
        if (!note.trim()) {
            showValidationError('Vui lòng nhập ghi chú lý do điều chỉnh');
            return false;
        }
        if (!selectedMaterialId) {
            showValidationError('Vui lòng chọn vật tư');
            return false;
        }
        if (!newStock.trim()) {
            showValidationError('Vui lòng nhập tồn kho mới');
            return false;
        }
        if (!warehouseId) {
            showValidationError('Không tìm thấy kho cho trang trại hiện tại');
            return false;
        }

        const selectedItem = warehouseItems.find(
            (m: IWarehouseItem) => m.materialId === selectedMaterialId
        );
        if (!selectedItem) {
            showValidationError('Vật tư không hợp lệ hoặc không tìm thấy');
            return false;
        }
        return true;
    };

    // Handler for "Lưu Nháp" (Save Draft) - shouldSubmit = false
    const handleSaveDraft = () => {
        if (!validateForm()) return;

        const selectedItem = warehouseItems.find(
            (m: IWarehouseItem) => m.materialId === selectedMaterialId
        )!;

        const payload = {
            header: {
                warehouseId: warehouseId!,
                note: note || 'Phiếu mới',
            },
            items: [
                {
                    materialId: selectedItem.materialId,
                    expectedQty: oldStock,
                    actualQty: Number(newStock),
                },
            ],
            shouldSubmit: false, // Keep as Draft
        };

        createInventoryCheck(payload, {
            onSuccess: () => {
                setTimeout(() => {
                    navigation.navigate('MainTabs', {
                        screen: 'Material',
                        params: { selectedTab: 'inventory' },
                    });
                }, 500);
            },
        });
    };

    // Handler for "Gửi Phiếu" (Submit) - shouldSubmit = true
    const handleSubmit = () => {
        if (!validateForm()) return;

        const selectedItem = warehouseItems.find(
            (m: IWarehouseItem) => m.materialId === selectedMaterialId
        )!;

        const payload = {
            header: {
                warehouseId: warehouseId!,
                note: note || 'Phiếu mới',
            },
            items: [
                {
                    materialId: selectedItem.materialId,
                    expectedQty: oldStock,
                    actualQty: Number(newStock),
                },
            ],
            shouldSubmit: true, // Submit to Pending status
        };

        createInventoryCheck(payload, {
            onSuccess: () => {
                setTimeout(() => {
                    navigation.navigate('MainTabs', {
                        screen: 'Material',
                        params: { selectedTab: 'inventory' },
                    });
                }, 500);
            },
        });
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <Loading isLoading={isSubmitting}>
                <View style={styles.container}>
                    <HeaderMeterial
                        title="Tạo Phiếu Điều Chỉnh Tồn Kho"
                        onBackPress={() => navigation.goBack()}
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
                                onNoteChange={setNote}
                                warehouseName={warehouses?.[0]?.name}
                                creatorName={creatorName}
                            />

                            {/* Nhập liệu vật tư */}
                            <View style={styles.dropdownSection}>
                                {warehouseItems.length === 0 && (
                                    <Text style={styles.warningText}>
                                        Kho hiện tại chưa có vật tư nào. Vui lòng nhập kho trước.
                                    </Text>
                                )}
                                <InventoryMaterialInput
                                    materialName={materialName}
                                    selectedMaterialId={selectedMaterialId}
                                    oldStock={oldStock}
                                    newStock={newStock}
                                    onMaterialSelect={handleMaterialSelect}
                                    onNewStockChange={setNewStock}
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
                        secondaryButtonStyle={{ flex: 1, minWidth: 0 }}
                        primaryButtonStyle={{ flex: 1 }}
                    />
                    {/* Modal Chọn Ngày */}
                    <DatePickerModal
                        visible={isDatePickerVisible}
                        onClose={() => setDatePickerVisible(false)}
                        date={date}
                        onSelectDate={handleDateConfirm}
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
    warningText: {
        color: colors.orange[500],
        fontSize: 14,
        marginBottom: spacing.xs,
        fontStyle: 'italic',
    },
});
