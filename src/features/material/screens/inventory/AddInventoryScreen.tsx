import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { colors, spacing } from '@/styles';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';
import { InventoryGeneralInfo } from '@/features/material/components/inventory/InventoryGeneralInfo';
import { InventoryMaterialInput } from '@/features/material/components/inventory/InventoryMaterialInput';
import { IInventoryTicket } from '../../types/material.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '../../navigation/MaterialNavigator';
import { mockMaterialList } from '../../data/materialData';
import { showValidationError } from '../../utils/validationToast';

interface AddInventoryScreenProps {
    // onBack: () => void;
    // onSave: (data: IInventoryTicket) => void;
}

export const AddInventoryScreen: React.FC<AddInventoryScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<MaterialStackParamList, 'AddInventory'>>();
    const params = route.params;
    const onSave = params?.onSave;
    const initialMaterialName = params?.initialMaterialName;

    const { setTabBarVisible } = useTabBarVisibility();

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // Handle initial material selection
    useEffect(() => {
        if (initialMaterialName) {
            handleMaterialSelect(initialMaterialName);
        }
    }, [initialMaterialName]);

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

    // Derive options from mock data
    const materialOptions = mockMaterialList.map(m => m.name);

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

    const handleMaterialSelect = (val: string) => {
        setMaterialName(val);

        // Find material in mock list
        const selectedMaterial = mockMaterialList.find(m => m.name === val);

        if (selectedMaterial) {
            setOldStock(selectedMaterial.remaining || 0);
            setMaterialGroup(selectedMaterial.group);
        } else {
            setOldStock(0);
            setMaterialGroup('');
        }

        setNewStock('');
    };

    const formatDate = (d: Date) => {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateTime = (d: Date) => {
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${hours}:${minutes} ${day}/${month}/${year}`;
    };

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

        const newTicket: IInventoryTicket = {
            id: Date.now().toString(),
            checkerName: 'Nguyễn Phương Duy',
            date: formatDateTime(date),
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
        if (onSave) {
            onSave(newTicket);
        }
        // Return to Inventory tab
        navigation.navigate('MaterialList', { selectedTab: 'inventory' });
    };

    return (
        <View style={styles.container}>
            <HeaderMeterial
                title="Tạo Phiếu Điều Chỉnh Tồn Kho"
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Thông tin chung */}
                <InventoryGeneralInfo
                    date={formatDate(date)}
                    createdDate={formatDateTime(date)}
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
        paddingBottom: spacing.xl,
    },
    dropdownSection: {
        zIndex: 100,
        ...Platform.select({
            android: { elevation: 5 },
            ios: { zIndex: 100 },
        }),
    },
});
