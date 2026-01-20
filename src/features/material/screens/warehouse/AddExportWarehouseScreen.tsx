import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, Text } from 'react-native';
import { formatCurrencyValue } from '@/shared/utils/formatters';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { ExportWarehouseInformation } from '@/features/material/components/warehouse/ExportWarehouseInformation';
import {
    AddWarehouseMaterial,
    MaterialItem,
} from '@/features/material/components/warehouse/AddWarehouseMaterial';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { colors, spacing } from '@/styles';
import { ConfirmSubmiss } from '@/features/material/components/warehouse/ConfirmSubmiss';
import { IMaterial } from '@/features/material/types/material.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { showValidationError } from '@/features/material/utils/validationToast';
import { useMaterials, useAddExportWarehouseReceipt } from '@/features/material/hooks';

interface AddExportWarehouseScreenProps {}

export const AddExportWarehouseScreen: React.FC<AddExportWarehouseScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<MaterialStackParamList, 'AddExportWarehouse'>>();
    const { setTabBarVisible } = useTabBarVisibility();

    // Use React Query for materials data
    const { data: materialsData = [] } = useMaterials();
    const { mutate: addExportWarehouseReceipt } = useAddExportWarehouseReceipt();

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const params = route.params as
        | {
              availableMaterials?: IMaterial[];
          }
        | undefined;
    const availableMaterials = params?.availableMaterials || materialsData;
    // Combine mock materials with passed available materials
    const materialOptions = availableMaterials.map((m: IMaterial) => ({
        label: m.name,
        value: m.name,
        unit: typeof m.unit === 'number' ? String(m.unit) : m.unitName || String(m.unit || ''),
    }));

    const [date, setDate] = useState(new Date());
    const [selectedZone, setSelectedZone] = useState('');
    const [selectedPond, setSelectedPond] = useState('');
    const [warehouseItems, setWarehouseItems] = useState<MaterialItem[]>([
        { id: '1', materialName: '', quantity: '', price: '' },
    ]);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddMaterial = () => {
        setWarehouseItems([
            ...warehouseItems,
            { id: Date.now().toString(), materialName: '', quantity: '', price: '' },
        ]);
    };

    const handleUpdateMaterial = (id: string, field: keyof MaterialItem, value: string) => {
        setWarehouseItems(
            warehouseItems.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    return updatedItem;
                }
                return item;
            })
        );
    };

    const calculateTotal = () => {
        return warehouseItems.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return sum + qty * price;
        }, 0);
    };

    const scrollViewRef = React.useRef<ScrollView>(null);

    const handleDropdownOpen = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
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
            <Loading isLoading={isSubmitting}>
                <View style={styles.container}>
                    <HeaderMeterial
                        title="Tạo Phiếu Xuất Kho"
                        onBackPress={() => navigation.goBack()}
                        rightComponent={null}
                    />

                    <SafeInputLayout>
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.content}
                            contentContainerStyle={styles.contentContainer}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            keyboardShouldPersistTaps="handled"
                        >
                            <ExportWarehouseInformation
                                date={date}
                                onDateChange={setDate}
                                selectedZone={selectedZone}
                                onZoneChange={setSelectedZone}
                                selectedPond={selectedPond}
                                onPondChange={setSelectedPond}
                            />

                            <AddWarehouseMaterial
                                materials={warehouseItems}
                                onUpdateMaterial={handleUpdateMaterial}
                                onAddMaterial={handleAddMaterial}
                                materialOptions={materialOptions}
                                onDropdownOpen={handleDropdownOpen}
                            />
                        </ScrollView>
                    </SafeInputLayout>

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
                            if (!selectedPond) {
                                showValidationError('Vui lòng chọn ao nuôi');
                                return;
                            }
                            if (warehouseItems.length === 0) {
                                showValidationError('Vui lòng thêm ít nhất một vật tư');
                                return;
                            }
                            // Check detailed items
                            const invalidItemIndex = warehouseItems.findIndex(
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
                            setIsSubmitting(true);
                            addExportWarehouseReceipt({
                                date,
                                farm: selectedPond,
                                materials: warehouseItems.map(m => ({
                                    id: m.id,
                                    materialName: m.materialName,
                                    quantity: m.quantity,
                                    price: m.price,
                                    total: parseFloat(m.quantity) * parseFloat(m.price),
                                })),
                                totalAmount,
                            });
                            // Delay to show loading before navigating back
                            setTimeout(() => {
                                setIsSubmitting(false);
                                navigation.goBack();
                            }, 500);
                        }}
                    />
                </View>
            </Loading>
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
        paddingBottom: 100,
    },
});
