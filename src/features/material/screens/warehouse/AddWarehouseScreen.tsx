import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, Text } from 'react-native';
import { formatCurrencyValue } from '@/shared/utils/formatters';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '../../components/HeaderMaterial';
import { WarehouseInformation } from '../../components/warehouse/WarehouseInformation';
import {
    AddWarehouseMaterial,
    MaterialItem,
} from '../../components/warehouse/AddWarehouseMaterial';
import { ButtonBarMaterial } from '../../components/ButtonBarMaterial';
import { colors, spacing } from '@/styles';
import { ConfirmSubmiss } from '../../components/warehouse/ConfirmSubmiss';
import { IMaterial, IWarehouseReceipt } from '../../types/material.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '../../navigation/MaterialNavigator';
import { showValidationError } from '../../utils/validationToast';

interface AddWarehouseScreenProps {
    // onBack?: () => void;
    // onSave?: (data: Omit<IWarehouseReceipt, 'id'>) => void;
    // availableMaterials?: IMaterial[];
}

export const AddWarehouseScreen: React.FC<AddWarehouseScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<MaterialStackParamList, 'AddWarehouse'>>();
    const { setTabBarVisible } = useTabBarVisibility();

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);
    const params = route.params as
        | {
              onSave?: (data: Omit<IWarehouseReceipt, 'id'>) => void;
              availableMaterials?: IMaterial[];
          }
        | undefined;
    const onSave = params?.onSave;
    const availableMaterials = params?.availableMaterials || [];
    // Combine mock materials with passed available materials
    const materialOptions = availableMaterials.map((m: IMaterial) => ({
        label: m.name,
        value: m.name,
        unit: m.unit,
    }));

    const [date, setDate] = useState(new Date());
    const [supplier, setSupplier] = useState('');
    const [materials, setMaterials] = useState<MaterialItem[]>([
        { id: '1', materialName: '', quantity: '', price: '' },
    ]);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const handleAddMaterial = () => {
        setMaterials([
            ...materials,
            { id: Date.now().toString(), materialName: '', quantity: '', price: '' },
        ]);
    };

    const handleUpdateMaterial = (id: string, field: keyof MaterialItem, value: string) => {
        setMaterials(
            materials.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };

                    // Auto-fill unit when material name is selected
                    if (field === 'materialName') {
                        // const selectedMaterial = materialOptions.find(m => m.value === value);
                        // Note: unit is not currently stored in MaterialItem state in this component,
                        // but if we wanted to display it, we could add it to the state.
                        // For now, we just ensure the selection works.
                    }

                    return updatedItem;
                }
                return item;
            })
        );
    };

    const calculateTotal = () => {
        return materials.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return sum + qty * price;
        }, 0);
    };

    const formatCurrency = (value: number) => {
        return (
            <>
                {formatCurrencyValue(value)}{' '}
                <Text style={{ textDecorationLine: 'underline' }}>đ</Text>
            </>
        );
    };

    const totalAmount = calculateTotal();

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.container}>
                <HeaderMeterial
                    title="Tạo Phiếu Nhập Kho"
                    onBackPress={() => navigation.goBack()}
                    rightComponent={null}
                />

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                >
                    <WarehouseInformation
                        date={date}
                        onDateChange={setDate}
                        supplier={supplier}
                        onSupplierChange={setSupplier}
                    />

                    <AddWarehouseMaterial
                        materials={materials}
                        onUpdateMaterial={handleUpdateMaterial}
                        onAddMaterial={handleAddMaterial}
                        materialOptions={materialOptions}
                    />
                </ScrollView>

                <ButtonBarMaterial
                    mode="total"
                    totalLabel="Tổng tiền:"
                    totalValue={formatCurrency(totalAmount)}
                    primaryTitle="Gửi Phiếu"
                    containerStyle={{
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                    }}
                    onPrimaryPress={() => {
                        // Validation
                        if (!supplier) {
                            showValidationError('Vui lòng chọn nhà cung cấp');
                            return;
                        }
                        if (materials.length === 0) {
                            showValidationError('Vui lòng thêm ít nhất một vật tư');
                            return;
                        }
                        // Check detailed items
                        const invalidItemIndex = materials.findIndex(
                            m => !m.materialName || !m.quantity || !m.price
                        );
                        if (invalidItemIndex !== -1) {
                            showValidationError(
                                `Vui lòng điền đầy đủ thông tin vật tư (Dòng ${
                                    invalidItemIndex + 1
                                })`
                            );
                            return;
                        }

                        setIsConfirmModalVisible(true);
                    }}
                />

                <ConfirmSubmiss
                    visible={isConfirmModalVisible}
                    onClose={() => setIsConfirmModalVisible(false)}
                    onConfirm={() => {
                        setIsConfirmModalVisible(false);
                        onSave?.({
                            date,
                            supplier,
                            materials,
                            totalAmount,
                        });
                        navigation.goBack();
                    }}
                />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F5FF',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: spacing.md,
        paddingBottom: spacing.xl,
    },
});
