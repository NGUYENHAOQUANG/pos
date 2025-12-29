import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { colors, spacing } from '@/styles';
import { DatePickerModal } from '@/features/home/components/DatePickerModal';
import { InventoryGeneralInfo } from '@/features/material/components/inventory/InventoryGeneralInfo';
import { InventoryMaterialInput } from '@/features/material/components/inventory/InventoryMaterialInput';
import { IInventoryTicket } from '../../types/material.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '../../navigation/MaterialNavigator';

interface AddInventoryScreenProps {
    // onBack: () => void;
    // onSave: (data: IInventoryTicket) => void;
}

export const AddInventoryScreen: React.FC<AddInventoryScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<MaterialStackParamList, 'AddInventory'>>();
    const params = route.params;
    const onSave = params?.onSave;

    const { setTabBarVisible } = useTabBarVisibility();

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // --- States ---
    const [date, setDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [note, setNote] = useState('');

    // State vật tư
    const [materialName, setMaterialName] = useState('');
    const [oldStock, setOldStock] = useState(0);
    const [newStock, setNewStock] = useState('');

    // --- Handlers ---

    const handleDateConfirm = (selectedDate: Date) => {
        setDate(selectedDate);
        setDatePickerVisible(false);
    };

    const handleMaterialSelect = (val: string) => {
        setMaterialName(val);
        // Giả lập logic lấy tồn kho cũ
        if (val === 'CP 09 – Thức ăn tôm giai đoạn 2') setOldStock(4);
        else if (val === 'Vật tư B') setOldStock(10);
        else setOldStock(0);

        setNewStock('');
    };

    const handleSave = () => {
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
        navigation.goBack();
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <HeaderMeterial
                    title="Tạo Phiếu Điều Chỉnh Tồn Kho"
                    onBackPress={() => navigation.goBack()}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Thông tin chung */}
                    <InventoryGeneralInfo
                        date={formatDate(date)}
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
                        />
                    </View>
                </ScrollView>

                {/* Nút Gửi Phiếu */}
                <ButtonBarMaterial
                    mode="single"
                    primaryTitle="Gửi Phiếu"
                    onPrimaryPress={handleSave}
                    primaryButtonDisabled={!materialName || newStock === ''}
                    containerStyle={{
                        borderTopWidth: 1,
                        borderTopColor: colors.gray[200],
                        // Add shadow via generic View styles if needed, but ButtonBar usually simpler
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.md,
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
