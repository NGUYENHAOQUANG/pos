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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { showValidationError } from '@/features/material/utils/validationToast';
import { useAddExportWarehouseReceipt } from '@/features/material/hooks';
import { useWarehouseItems } from '@/features/material/hooks/useWarehouseItems';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useFarmStore } from '@/features/farm/store/farmStore';

// New Imports
import { Input } from '@/shared/components/forms/Input';
import { FileUploader, FileUploaderRef } from '@/shared/components/forms/FileUploader';
import { useFileSubmit } from '@/shared/hooks/useFileSubmit';
import { DocumentPickerResponse } from '@react-native-documents/picker';

interface AddExportWarehouseScreenProps {}

export const AddExportWarehouseScreen: React.FC<AddExportWarehouseScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const { setTabBarVisible } = useTabBarVisibility();

    // Get selected zone from farmStore (for initial value only)
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    // Data State - for UI (selectedZone is controlled by dropdown)
    const [date, setDate] = useState(new Date());
    const [selectedZone, setSelectedZone] = useState(selectedZoneId || '');
    const [selectedPond, setSelectedPond] = useState('');
    const [note, setNote] = useState('');

    // Sync selectedZone when farmStore changes (initial load or external change)
    useEffect(() => {
        if (selectedZoneId && !selectedZone) {
            setSelectedZone(selectedZoneId);
        }
    }, [selectedZoneId, selectedZone]);

    // Get warehouse for the selected zone - use LOCAL state so it reacts to dropdown changes
    const { data: warehouses } = useWarehouses({ ZoneId: selectedZone || undefined });
    const warehouseId = warehouses?.[0]?.id;

    // Fetch warehouse items using the warehouse ID
    const { data: warehouseData } = useWarehouseItems(warehouseId, undefined, {
        enabled: !!warehouseId,
    });
    const warehouseItems = React.useMemo(() => warehouseData?.items || [], [warehouseData]);

    const materialOptions =
        warehouseItems.length > 0
            ? warehouseItems.map((m: any) => ({
                  label: m.materialName || '',
                  value: String(m.materialId || ''),
                  unit: m.unitName || '',
                  quantity: m.quantity || 0, // Stock
              }))
            : [
                  {
                      label: 'Hiện tại không có vật tư',
                      value: '__no_materials__',
                      unit: '',
                      quantity: 0,
                      disabled: true,
                  },
              ];

    const { mutate: addExportWarehouseReceipt } = useAddExportWarehouseReceipt();
    const { submitWithFiles, isUploading } = useFileSubmit();

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const [files, setFiles] = useState<DocumentPickerResponse[]>([]);
    const [formMaterials, setFormMaterials] = useState<MaterialItem[]>([
        { id: '1', materialId: '', materialName: '', quantity: '', price: '' },
    ]);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileUploaderRef = React.useRef<FileUploaderRef>(null);

    const handleAddMaterial = () => {
        setFormMaterials([
            ...formMaterials,
            {
                id: Date.now().toString(),
                materialId: '',
                materialName: '',
                quantity: '',
                price: '',
            },
        ]);
    };

    const handleUpdateMaterial = (id: string, field: keyof MaterialItem, value: any) => {
        setFormMaterials(
            formMaterials.map(item => {
                if (item.id === id) {
                    if (field === 'materialId') {
                        const selectedMaterial = warehouseItems.find(
                            (m: any) => String(m.materialId || '') === String(value)
                        );
                        return {
                            ...item,
                            materialId: value,
                            materialName: selectedMaterial?.materialName || '',
                            availableQuantity: selectedMaterial?.quantity || 0,
                            unit: selectedMaterial?.unitName || '',
                        };
                    }
                    const updatedItem = { ...item, [field]: value };
                    return updatedItem;
                }
                return item;
            })
        );
    };

    const calculateTotal = () => {
        return formMaterials.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return sum + qty * price;
        }, 0);
    };

    const scrollViewRef = React.useRef<ScrollView>(null);

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
                            >
                                <Input
                                    label="Ghi chú"
                                    placeholder="Nhập ghi chú xuất kho"
                                    value={note}
                                    onChangeText={setNote}
                                    multiline={true}
                                    numberOfLines={3}
                                    inputContainerStyle={{ height: 100, alignItems: 'flex-start' }}
                                    inputStyle={{ textAlignVertical: 'top', paddingTop: 8 }}
                                />

                                <FileUploader
                                    ref={fileUploaderRef}
                                    files={files}
                                    onFilesSelected={setFiles}
                                    maxFiles={5}
                                />
                            </ExportWarehouseInformation>

                            <AddWarehouseMaterial
                                materials={formMaterials}
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
                            if (formMaterials.length === 0) {
                                showValidationError('Vui lòng thêm ít nhất một vật tư');
                                return;
                            }
                            // Check detailed items
                            const invalidItemIndex = formMaterials.findIndex(
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
                                addExportWarehouseReceipt(
                                    {
                                        warehouseId: warehouseId || '',
                                        pondId: selectedPond,
                                        documentIds: documentIds,
                                        items: formMaterials.map(item => ({
                                            materialId: item.materialId || '',
                                            quantity: parseFloat(item.quantity),
                                        })),
                                        note: note,
                                        date: date.toISOString(),
                                        autoSubmit: true,
                                    },
                                    {
                                        onSuccess: () => {
                                            // Mark files as saved so they aren't deleted on unmount
                                            fileUploaderRef.current?.markAsSaved();
                                            setIsSubmitting(false);
                                            navigation.goBack();
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
        paddingVertical: spacing.md,
        paddingBottom: 100,
    },
});
