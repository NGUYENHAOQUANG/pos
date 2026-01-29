import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, Text } from 'react-native';
import { formatCurrencyValue } from '@/shared/utils/formatters';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { WarehouseInformation } from '@/features/material/components/warehouse/WarehouseInformation';
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
import { useMaterials, useAddWarehouseReceipt } from '@/features/material/hooks';

import { FileUploader, FileUploaderRef } from '@/shared/components/forms/FileUploader';
import { useFileSubmit } from '@/shared/hooks/useFileSubmit';
import { DocumentPickerResponse } from '@react-native-documents/picker';

interface AddWarehouseScreenProps {}

export const AddWarehouseScreen: React.FC<AddWarehouseScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<MaterialStackParamList, 'AddWarehouse'>>();
    const { setTabBarVisible } = useTabBarVisibility();

    // Use React Query for materials data
    const { data: materialsData = [] } = useMaterials();
    const { mutate: addWarehouseReceipt } = useAddWarehouseReceipt();
    const { submitWithFiles, isUploading } = useFileSubmit();

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
    const [supplier, setSupplier] = useState('');
    const [files, setFiles] = useState<DocumentPickerResponse[]>([]);
    const [warehouseItems, setWarehouseItems] = useState<MaterialItem[]>([
        { id: '1', materialName: '', quantity: '', price: '' },
    ]);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileUploaderRef = React.useRef<FileUploaderRef>(null);

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
        return warehouseItems.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return sum + qty * price;
        }, 0);
    };

    const scrollViewRef = React.useRef<ScrollView>(null);

    // Smooth scroll based on item index - more stable than measuring position
    const HEADER_HEIGHT = 280;
    const FILE_ROW_HEIGHT = 40;
    const ITEM_HEIGHT = 280;

    const handleDropdownOpen = (itemIndex: number) => {
        setTimeout(() => {
            const fileSectionHeight = files.length * FILE_ROW_HEIGHT;
            const scrollY = HEADER_HEIGHT + fileSectionHeight + itemIndex * ITEM_HEIGHT;
            scrollViewRef.current?.scrollTo({
                y: Math.max(0, scrollY - 50), // Small offset to show context
                animated: true,
            });
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
            <Loading isLoading={isSubmitting || isUploading}>
                <View style={styles.container}>
                    <HeaderMeterial
                        title="Tạo Phiếu Nhập Kho"
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
                            <WarehouseInformation
                                date={date}
                                onDateChange={setDate}
                                supplier={supplier}
                                onSupplierChange={setSupplier}
                            >
                                <FileUploader
                                    ref={fileUploaderRef}
                                    files={files}
                                    onFilesSelected={setFiles}
                                    maxFiles={5}
                                />
                            </WarehouseInformation>

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
                            if (!supplier) {
                                showValidationError('Vui lòng chọn nhà cung cấp');
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
                        onConfirm={async () => {
                            setIsConfirmModalVisible(false);
                            await submitWithFiles(files, async documentIds => {
                                setIsSubmitting(true);
                                addWarehouseReceipt(
                                    {
                                        date,
                                        supplier,
                                        materials: warehouseItems.map(m => ({
                                            id: m.id,
                                            materialName: m.materialName,
                                            quantity: m.quantity,
                                            price: m.price,
                                            total: parseFloat(m.quantity) * parseFloat(m.price),
                                        })),
                                        totalAmount,
                                        documentIds,
                                    },
                                    {
                                        onSuccess: () => {
                                            // Mark files as saved so they aren't deleted on unmount
                                            fileUploaderRef.current?.markAsSaved();

                                            // Delay to show loading before navigating back
                                            setTimeout(() => {
                                                setIsSubmitting(false);
                                                navigation.goBack();
                                            }, 500);
                                        },
                                        onError: () => {
                                            setIsSubmitting(false);
                                        },
                                    }
                                );
                            });
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
        marginTop: spacing.sm,
        paddingBottom: 100,
    },
});
