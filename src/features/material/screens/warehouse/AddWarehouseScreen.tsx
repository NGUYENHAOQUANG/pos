import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Platform,
    ScrollView,
} from 'react-native';
import { HeaderMeterial } from '../../components/HeaderMeterial';
import { WarehouseInformation } from '../../components/warehouse/WarehouseInformation';
import { WarehouseMaterialList, MaterialItem } from '../../components/warehouse/WarehouseMaterialList';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing } from '@/styles';

interface AddWarehouseScreenProps {
    onBack?: () => void;
    onSave?: (data: any) => void;
}

export const AddWarehouseScreen: React.FC<AddWarehouseScreenProps> = ({
    onBack,
    onSave,
}) => {
    const [date, setDate] = useState(new Date());
    const [supplier, setSupplier] = useState('');
    const [materials, setMaterials] = useState<MaterialItem[]>([
        { id: '1', materialName: '', quantity: '', price: '' },
    ]);

    const handleAddMaterial = () => {
        setMaterials([
            ...materials,
            { id: Date.now().toString(), materialName: '', quantity: '', price: '' },
        ]);
    };

    const handleUpdateMaterial = (id: string, field: keyof MaterialItem, value: string) => {
        setMaterials(materials.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const calculateTotal = () => {
        return materials.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return sum + (qty * price);
        }, 0);
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('vi-VN') + 'đ';
    };

    const totalAmount = calculateTotal();

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.container}>
                <HeaderMeterial
                    title="Tạo Phiếu Nhập Kho"
                    onBackPress={onBack}
                    rightComponent={null}
                />

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <WarehouseInformation
                        date={date}
                        onDateChange={setDate}
                        supplier={supplier}
                        onSupplierChange={setSupplier}
                    />

                    <WarehouseMaterialList
                        materials={materials}
                        onUpdateMaterial={handleUpdateMaterial}
                        onAddMaterial={handleAddMaterial}
                    />
                </ScrollView>

                <View style={styles.footer}>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalLabel}>Tổng tiền:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
                    </View>
                    <Button
                        title="Gửi Phiếu"
                        onPress={() => {
                            onSave?.({
                                date,
                                supplier,
                                materials,
                                totalAmount,
                            });
                        }}
                        variant="primary"
                        style={styles.submitButton}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F0F5FF',
    },
    container: {
        flex: 1,
        backgroundColor: '#F0F5FF',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    },
    totalContainer: {
        justifyContent: 'center',
    },
    totalLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF4D4F', // Red color for total amount
    },
    submitButton: {
        minWidth: 120,
        paddingHorizontal: spacing.xl,
    },
});
