import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Platform, StatusBar } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { colors, spacing } from '@/styles';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';
import { InventoryGeneralInfo } from '@/features/material/components/inventory/InventoryGeneralInfo';
import { InventoryMaterialInput } from '@/features/material/components/inventory/InventoryMaterialInput';
import { IInventoryTicket, IMaterial } from '@/features/material/types/material.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { showValidationError } from '@/features/material/utils/validationToast';
import { useMaterials, useAddInventoryTicket } from '@/features/material/hooks';
import { formatMaterialDate, formatMaterialDateTime } from '@/features/material/utils/dateUtils';

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

    // Use React Query for materials data
    const { data: materialsData = [] } = useMaterials();
    const { mutate: addInventoryTicket } = useAddInventoryTicket();

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Derive options from materials data
    const materialOptions = materialsData.map((m: IMaterial) => m.name);

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
            setMaterialName(val);

            // Find material in materials data
            const selectedMaterial = materialsData.find((m: IMaterial) => m.name === val);

            if (selectedMaterial) {
                setOldStock(selectedMaterial.remaining || 0);
                setMaterialGroup(selectedMaterial.group);
            } else {
                setOldStock(0);
                setMaterialGroup('');
            }

            setNewStock('');
        },
        [materialsData]
    );

    // Handle initial material selection
    useEffect(() => {
        if (initialMaterialName) {
            handleMaterialSelect(initialMaterialName);
        }
    }, [initialMaterialName, handleMaterialSelect]);

    const handleSave = () => {
        // Validation
        if (!note.trim()) {
            showValidationError('Vui lòng nhập ghi chú lý do điều chỉnh');
            return;
        }
        if (!materialName) {
            showValidationError('Vui lòng chọn vật tư');
            return;
        }
        if (!newStock.trim()) {
            showValidationError('Vui lòng nhập tồn kho mới');
            return;
        }

        setIsSubmitting(true);

        const newTicket: IInventoryTicket = {
            id: Date.now().toString(),
            checkerName: 'Nguyễn Phương Duy',
            date: formatMaterialDateTime(date),
            note: note || 'Phiếu mới',
            totalDifference: Number(newStock) - oldStock,
            items: [
                {
                    id: '1',
                    materialName: materialName,
                    beforeQuantity: oldStock,
                    afterQuantity: Number(newStock),
                },
            ],
        };
        addInventoryTicket(newTicket);
        // Delay to show loading before navigating back
        setTimeout(() => {
            setIsSubmitting(false);
            // Return to Inventory tab
            navigation.navigate('MainTabs', {
                screen: 'Material',
                params: { selectedTab: 'inventory' },
            });
        }, 500);
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
                            />

                            {/* Nhập liệu vật tư */}
                            <View style={styles.dropdownSection}>
                                <InventoryMaterialInput
                                    materialName={materialName}
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
                        mode="single"
                        primaryTitle="Gửi Phiếu"
                        onPrimaryPress={handleSave}
                        containerStyle={{
                            borderTopWidth: 1,
                            borderTopColor: colors.gray[200],
                        }}
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
});
