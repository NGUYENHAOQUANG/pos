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
import { ExportWarehouseInformation } from '@/features/material/components/warehouse/ExportWarehouseInformation';
import {
    AddWarehouseMaterial,
    MaterialItem,
} from '@/features/material/components/warehouse/AddWarehouseMaterial';

import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { colors, spacing, borderRadius } from '@/styles';
import { ConfirmSubmiss } from '@/features/material/components/warehouse/ConfirmSubmiss';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { showValidationError } from '@/features/material/utils/validationToast';
import {
    useCreateExportReceipt,
    useUpdateExportReceipt,
    useDeleteExportReceipt,
    useExportReceipt,
} from '@/features/material/hooks/exportReceipt/useExportReceipt';
import { useWarehouseItems } from '@/features/material/hooks/useWarehouseItems';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { Input } from '@/shared/components/forms/Input';
import { FileUploader, FileUploaderRef } from '@/shared/components/forms/FileUploader';
import { useFileSubmit } from '@/shared/hooks/useFileSubmit';
import { DocumentPickerResponse } from '@react-native-documents/picker';
import { IconTrashOutlined } from '@/assets/icons';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';

interface AddExportWarehouseScreenProps {}

export const AddExportWarehouseScreen: React.FC<AddExportWarehouseScreenProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<AppStackParamList, 'AddExportWarehouse'>>();
    const params = route.params;
    const exportReceiptId = params?.exportReceiptId;
    const isEditMode = !!exportReceiptId;

    const { setTabBarVisible } = useTabBarVisibility();

    // Get selected zone from farmStore (for initial value only)
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    // Data State - for UI (selectedZone is controlled by dropdown)
    const [date, setDate] = useState(new Date());
    const [selectedZone, setSelectedZone] = useState(selectedZoneId || '');
    const [selectedPond, setSelectedPond] = useState('');
    const [note, setNote] = useState('');
    const [creatorName, setCreatorName] = useState<string>('');

    // Files and Materials State
    const [files, setFiles] = useState<DocumentPickerResponse[]>([]);
    const [formMaterials, setFormMaterials] = useState<MaterialItem[]>([
        { id: '1', materialId: '', materialName: '', quantity: '', price: '' },
    ]);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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

    // Material options with stock info (using useMemo like AddWarehouseScreen)
    const materialOptions = React.useMemo(() => {
        if (warehouseItems.length > 0) {
            return warehouseItems.map(
                (m: {
                    materialName?: string;
                    materialId?: string;
                    unitName?: string;
                    quantity?: number;
                }) => ({
                    label: m.materialName || '',
                    value: String(m.materialId || ''),
                    unit: m.unitName || '',
                    quantity: m.quantity || 0, // Stock
                })
            );
        }
        return [
            {
                label: 'Hiện tại không có vật tư',
                value: '__no_materials__',
                unit: '',
                quantity: 0,
                disabled: true,
            },
        ];
    }, [warehouseItems]);

    // API Hooks
    const { mutate: addExportWarehouseReceipt, isPending: isAdding } = useCreateExportReceipt();
    const { mutate: updateExportReceipt, isPending: isUpdating } = useUpdateExportReceipt();
    const { mutate: deleteExportReceipt, isPending: isDeleting } = useDeleteExportReceipt();
    const { data: exportReceiptDetail, isLoading: isLoadingDetail } = useExportReceipt(
        exportReceiptId || ''
    );

    const { submitWithFiles, isUploading } = useFileSubmit();
    const isSubmitting = isAdding || isUpdating || isDeleting || isUploading;

    const fileUploaderRef = React.useRef<FileUploaderRef>(null);
    const scrollViewRef = React.useRef<ScrollView>(null);

    // Initial Load for Edit Mode
    useEffect(() => {
        if (isEditMode && exportReceiptDetail && warehouseItems.length > 0) {
            if (exportReceiptDetail.createdAt) {
                setDate(new Date(exportReceiptDetail.createdAt));
            }
            if (exportReceiptDetail.note) {
                setNote(exportReceiptDetail.note); // Fix: setNote instead of setDate
            }
            // Temporarily not setting zone/pond from detail as API might not return them directly or structure matches differently
            // But if detail has them we should:
            // if (exportReceiptDetail.pondId) setSelectedPond(exportReceiptDetail.pondId);
            // Wait, exportReceiptDetail might just return items. need to check response structure.
            // Assuming detail matches specific structure.
            if (exportReceiptDetail.creator) {
                setCreatorName(exportReceiptDetail.creator.fullname || '');
            }
            if (exportReceiptDetail.pondId) {
                setSelectedPond(exportReceiptDetail.pondId);
            }

            // Map items
            // Need to check exact structure of items in detail
            // @ts-ignore
            const detailItems = exportReceiptDetail.items?.items || exportReceiptDetail.items || [];
            if (Array.isArray(detailItems) && detailItems.length > 0) {
                const mappedMaterials: MaterialItem[] = detailItems.map(
                    (item: any, index: number) => {
                        // Check if item has materialId or similar
                        const matId = item.materialId;
                        const matName = item.materialName || '';
                        const qty = item.quantity || item.actualQty || 0;
                        // Find in warehouse items to get unit/price if needed?
                        // Current MaterialItem needs: id, materialId, materialName, quantity, price
                        // Price might not be returned by detail?
                        return {
                            id: String(index + 1),
                            materialId: matId,
                            materialName: matName,
                            quantity: String(qty),
                            price: '',
                        };
                    }
                );
                setFormMaterials(mappedMaterials);
            }
        }
    }, [isEditMode, exportReceiptDetail, warehouseItems]);

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

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

    const handleDropdownOpen = (_itemIndex: number) => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200);
    };

    const totalAmount = calculateTotal();

    // Delete Handlers
    const handleDeletePress = () => setDeleteModalVisible(true);
    const handleConfirmDelete = () => {
        if (!exportReceiptId) return;
        deleteExportReceipt(exportReceiptId, {
            onSuccess: () => {
                setDeleteModalVisible(false);
                navigation.goBack();
            },
        });
    };

    const handleSubmitFlow = async (isAutoSubmit: boolean) => {
        // Validation
        if (!selectedPond) {
            showValidationError('Vui lòng chọn ao nuôi');
            return;
        }
        if (formMaterials.length === 0 || !formMaterials[0].materialId) {
            showValidationError('Vui lòng chọn ít nhất một vật tư');
            return;
        }
        // Check detailed items if submitting (strict) or allow partial if draft?
        // Inventory logic: strict for submit.
        if (isAutoSubmit) {
            const invalidItemIndex = formMaterials.findIndex(m => !m.materialName || !m.quantity);
            if (invalidItemIndex !== -1) {
                showValidationError(
                    `Vui lòng điền đầy đủ thông tin vật tư (Dòng ${invalidItemIndex + 1})`
                );
                return;
            }
        }

        await submitWithFiles(files, async documentIds => {
            const payload = {
                warehouseId: warehouseId || '',
                pondId: selectedPond,
                documentIds: documentIds,
                items: formMaterials
                    .filter(item => item.materialId)
                    .map(item => ({
                        materialId: item.materialId || '',
                        quantity: parseFloat(item.quantity) || 0,
                    })),
                note: note,
                date: date.toISOString(),
                autoSubmit: isAutoSubmit,
            };

            if (isEditMode && exportReceiptId) {
                updateExportReceipt(
                    {
                        receiptId: exportReceiptId,
                        ...payload,
                    },
                    {
                        onSuccess: () => {
                            fileUploaderRef.current?.markAsSaved();
                            navigation.goBack();
                        },
                    }
                );
            } else {
                addExportWarehouseReceipt(payload, {
                    onSuccess: () => {
                        fileUploaderRef.current?.markAsSaved();
                        navigation.goBack();
                    },
                });
            }
        });
    };

    // Custom Delete Button
    const deleteButton = (
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeletePress}
            activeOpacity={0.7}
        >
            <IconTrashOutlined width={20} height={20} />
        </TouchableOpacity>
    );

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <Loading isLoading={isSubmitting || isLoadingDetail}>
                <View style={styles.container}>
                    <HeaderMeterial
                        title={isEditMode ? 'Chỉnh Sửa Phiếu Xuất Kho' : 'Tạo Phiếu Xuất Kho'}
                        onBackPress={() => navigation.goBack()}
                        rightComponent={isEditMode ? deleteButton : null}
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
                                {/* Show creator name if edit mode */}
                                {isEditMode && creatorName ? (
                                    <Input
                                        label="Người tạo phiếu"
                                        value={creatorName}
                                        editable={false}
                                    />
                                ) : null}

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

                    {/* Custom Footer with Total + 2 Buttons */}
                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Tổng tiền:</Text>
                            <Text style={styles.totalValue}>
                                {formatCurrencyValue(totalAmount)}{' '}
                                <Text style={{ textDecorationLine: 'underline' }}>đ</Text>
                            </Text>
                        </View>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.draftButton}
                                onPress={() => handleSubmitFlow(false)} // Save Draft
                            >
                                <Text style={styles.draftButtonText}>Lưu Nháp</Text>
                            </TouchableOpacity>
                            <View style={{ width: spacing.md }} />
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={() => setIsConfirmModalVisible(true)} // Trigger modal for submit
                            >
                                <Text style={styles.submitButtonText}>Gửi Phiếu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ConfirmSubmiss
                        visible={isConfirmModalVisible}
                        onClose={() => setIsConfirmModalVisible(false)}
                        onConfirm={() => {
                            setIsConfirmModalVisible(false);
                            handleSubmitFlow(true); // Submit
                        }}
                    />

                    <ConfirmationDeleteModal
                        visible={deleteModalVisible}
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setDeleteModalVisible(false)}
                        title="Xóa phiếu xuất kho"
                        message="Bạn có chắc chắn muốn xóa phiếu xuất kho này không?"
                        showSuccessToast={false}
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
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: spacing.sm,
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
        fontSize: 15,
        fontWeight: '600',
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
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error,
    },
});
