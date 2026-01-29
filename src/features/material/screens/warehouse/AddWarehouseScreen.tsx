import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    ScrollView,
    Text,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { formatCurrencyValue } from '@/shared/utils/formatters';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { WarehouseInformation } from '@/features/material/components/warehouse/WarehouseInformation';
import {
    AddWarehouseMaterial,
    MaterialItem,
} from '@/features/material/components/warehouse/AddWarehouseMaterial';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { colors, spacing } from '@/styles';
import { ConfirmSubmiss } from '@/features/material/components/warehouse/ConfirmSubmiss';
import { IWarehouseItem } from '@/features/material/types/material.types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { showValidationError } from '@/features/material/utils/validationToast';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useSuppliers } from '@/features/material/hooks/useSuppliers';
import { useWarehouseItems } from '@/features/material/hooks/useWarehouseItems';
import { useMaterialOptions } from '@/features/material/hooks/inventory';
import { useCreateImportReceipt } from '@/features/material/hooks/useImportReceipts';
import {
    ImportSourceEnum,
    ImportReceiptStatus,
} from '@/features/material/types/importReceipt.types';

import { FileUploader, FileUploaderRef } from '@/shared/components/forms/FileUploader';
import { useFileSubmit } from '@/shared/hooks/useFileSubmit';
import { DocumentPickerResponse } from '@react-native-documents/picker';

interface AddWarehouseScreenProps {}

export const AddWarehouseScreen: React.FC<AddWarehouseScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const { setTabBarVisible } = useTabBarVisibility();

    // Data Fetching
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const { data: warehouses = [] } = useWarehouses({
        ZoneId: selectedZoneId || undefined,
    });
    const { data: warehouseItemsData } = useWarehouseItems(
        warehouses[0]?.id,
        { PageSize: 1000 },
        { enabled: !!warehouses.length }
    );
    const { data: suppliers = [] } = useSuppliers();

    // Mutations & Actions
    const { submitWithFiles, isUploading } = useFileSubmit();
    const { mutate: createImportReceipt, isPending: isCreating } = useCreateImportReceipt();

    // Derived Data
    const supplierOptions = suppliers.map(s => ({
        label: s.name,
        value: s.name,
    }));

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const availableMaterials = React.useMemo(() => {
        const rawMaterials = warehouseItemsData?.items || [];
        return rawMaterials.map((m: any) => ({
            ...m,
            materialName: m.materialName || m.name || 'Unknown Material',
            materialId: m.materialId || m.id,
        })) as IWarehouseItem[];
    }, [warehouseItemsData?.items]);
    const materialOptions = useMaterialOptions(availableMaterials);

    const [date, setDate] = useState(new Date());
    const [supplier, setSupplier] = useState('');
    const [files, setFiles] = useState<DocumentPickerResponse[]>([]);
    const [warehouseItems, setWarehouseItems] = useState<MaterialItem[]>([
        { id: '1', materialName: '', quantity: '', price: '' },
    ]);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const fileUploaderRef = React.useRef<FileUploaderRef>(null);

    const handleAddMaterial = () => {
        setWarehouseItems([
            ...warehouseItems,
            { id: Date.now().toString(), materialName: '', quantity: '', price: '' },
        ]);
    };

    const handleUpdateMaterial = (id: string, field: keyof MaterialItem, value: string) => {
        setWarehouseItems(prevItems =>
            prevItems.map(item => {
                if (item.id !== id) return item;

                const updates: Partial<MaterialItem> = { [field]: value };
                if (field === 'materialId') {
                    updates.materialName =
                        availableMaterials.find(m => m.materialId === value)?.materialName || '';
                }

                return { ...item, ...updates };
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

    const handleSubmit = () => {
        const invalidItemIndex = warehouseItems.findIndex(
            m => !m.materialName || !m.quantity || !m.price
        );
        if (invalidItemIndex !== -1) {
            showValidationError(
                `Vui lòng điền đầy đủ thông tin vật tư (Dòng ${invalidItemIndex + 1})`
            );
            return;
        }

        setIsConfirmModalVisible(true);
    };

    const processSubmit = async (isDraft: boolean) => {
        const selectedSupplier = suppliers.find(s => s.name === supplier);
        if (!selectedSupplier) {
            showValidationError('Vui lòng chọn nhà cung cấp hợp lệ');
            return;
        }

        await submitWithFiles(files, async documentIds => {
            createImportReceipt(
                {
                    supplierId: selectedSupplier.id,
                    warehouseId: warehouses[0]?.id || '',
                    items: warehouseItems.map(m => ({
                        materialId: m.materialId || '',
                        quantity: parseFloat(m.quantity) || 0,
                        unitPrice: parseFloat(m.price) || 0,
                    })),
                    notes: '',
                    autoSubmit: !isDraft,
                    importSourceEnum: ImportSourceEnum.Supplier,
                    documentIds,
                    status: isDraft ? ImportReceiptStatus.Draft : ImportReceiptStatus.Pending,
                },
                {
                    onSuccess: () => {
                        fileUploaderRef.current?.markAsSaved();
                        navigation.goBack();
                    },
                }
            );
        });
    };

    const handleConfirmSubmit = async () => {
        setIsConfirmModalVisible(false);
        await processSubmit(false);
    };

    const handleSaveDraft = async () => {
        await processSubmit(true);
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <Loading isLoading={isCreating || isUploading}>
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
                                supplierOptions={supplierOptions}
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

                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Tổng tiền:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(totalAmount)} </Text>
                        </View>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft}>
                                <Text style={styles.draftButtonText}>Lưu Nháp</Text>
                            </TouchableOpacity>
                            <View style={{ width: spacing.md }} />
                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                <Text style={styles.submitButtonText}>Gửi Phiếu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ConfirmSubmiss
                        visible={isConfirmModalVisible}
                        onClose={() => setIsConfirmModalVisible(false)}
                        onConfirm={handleConfirmSubmit}
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
    footer: {
        backgroundColor: colors.white,
        paddingTop: 16,
        paddingHorizontal: spacing.md,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    totalLabel: {
        fontSize: 14,
        color: colors.text,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.error,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    draftButton: {
        flex: 1,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.blue[600],
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    draftButtonText: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.blue[600],
    },
    submitButton: {
        flex: 1,
        height: 40,
        borderRadius: 8,
        backgroundColor: colors.blue[600],
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.white,
    },
});
