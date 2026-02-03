import { useState, useRef, useMemo, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DocumentPickerResponse } from '@react-native-documents/picker';
import { useQuery } from '@tanstack/react-query';

import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useWarehouses, useWarehouseItems } from '@/features/material/hooks/useWarehouses';
import { useSuppliers } from '@/features/material/hooks/useSuppliers';
import { useMaterialOptions } from '@/features/material/hooks/inventory';
import {
    useCreateImportReceipt,
    useUpdateImportReceipt,
} from '@/features/material/hooks/useImportReceipts';
import { useFileSubmit } from '@/shared/hooks/useFileSubmit';
import { showValidationError } from '@/features/material/utils/validationToast';
import {
    ImportSourceEnum,
    ImportReceiptStatus,
} from '@/features/material/types/importReceipt.types';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';
import { MaterialItem } from '@/features/material/components/warehouse/AddWarehouseMaterial';
import { FileUploaderRef } from '@/shared/components/forms/FileUploader';
import { importReceiptApi } from '@/features/material/api/importReceiptApi';

export const useAddImportReceipt = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<AppStackParamList, 'AddWarehouse'>>();
    const importReceiptId = route.params?.importReceiptId;
    const isEditMode = !!importReceiptId;

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

    // Fetch Detail for Edit Mode
    const { data: importReceiptDetail } = useQuery({
        queryKey: ['importReceipt', importReceiptId],
        queryFn: () => importReceiptApi.getDetail(importReceiptId!),
        enabled: isEditMode,
    });

    const { data: importReceiptItems } = useQuery({
        queryKey: ['importReceiptItems', importReceiptId],
        queryFn: () => importReceiptApi.getItems(importReceiptId!),
        enabled: isEditMode,
    });

    // Mutations & Actions
    const { submitWithFiles, isUploading } = useFileSubmit();
    const { mutate: createImportReceipt, isPending: isCreating } = useCreateImportReceipt();
    const { mutate: updateImportReceipt, isPending: isUpdating } = useUpdateImportReceipt();

    // Derived Data
    const supplierOptions = useMemo(
        () =>
            suppliers.map(s => ({
                label: s.name,
                value: s.name,
            })),
        [suppliers]
    );

    const availableMaterials = useMemo(() => {
        const rawMaterials = warehouseItemsData?.items || [];
        return rawMaterials.map((m: any) => ({
            ...m,
            materialName: m.materialName || m.name || 'Unknown Material',
            materialId: m.materialId || m.id,
        })) as IWarehouseItem[];
    }, [warehouseItemsData?.items]);

    const materialOptions = useMaterialOptions(availableMaterials);

    // Form State
    const [date, setDate] = useState(new Date());
    const [supplier, setSupplier] = useState('');
    const [files, setFiles] = useState<DocumentPickerResponse[]>([]);
    const [warehouseItems, setWarehouseItems] = useState<MaterialItem[]>([
        { id: '1', materialName: '', quantity: '', price: '' },
    ]);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    // Populate Form Data in Edit Mode
    useEffect(() => {
        if (isEditMode && importReceiptDetail && importReceiptItems) {
            const detail = (importReceiptDetail as any).data || importReceiptDetail;

            if (detail.createdAt) {
                setDate(new Date(detail.createdAt));
            }

            if (detail.supplierId && suppliers.length > 0) {
                const foundSupplier = suppliers.find(s => s.id === detail.supplierId);
                if (foundSupplier) {
                    setSupplier(foundSupplier.name);
                } else if (detail.supplierName) {
                    setSupplier(detail.supplierName);
                }
            } else if (detail.supplierName) {
                setSupplier(detail.supplierName);
            }

            // Populate Items
            if (importReceiptItems) {
                // Temporary type casting as IApiResponse structure requires verification
                const itemsData =
                    (importReceiptItems as any).items ||
                    (importReceiptItems as any).data?.items ||
                    [];

                if (itemsData && itemsData.length > 0) {
                    const mappedItems = itemsData.map((item: any) => ({
                        id: item.id || Date.now().toString() + Math.random(),
                        materialName: item.materialName || '',
                        materialId: item.materialId,
                        quantity: item.quantity?.toString() || '0',
                        price: item.unitPrice?.toString() || '0',
                    }));
                    setWarehouseItems(mappedItems);
                }
            }
        }
    }, [importReceiptDetail, importReceiptItems, isEditMode, suppliers]);

    // Refs
    const fileUploaderRef = useRef<FileUploaderRef>(null);
    const scrollViewRef = useRef<ScrollView>(null);

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

    const totalAmount = calculateTotal();

    const handleDropdownOpen = (itemIndex: number) => {
        const HEADER_HEIGHT = 280;
        const FILE_ROW_HEIGHT = 40;
        const ITEM_HEIGHT = 280;

        setTimeout(() => {
            const fileSectionHeight = files.length * FILE_ROW_HEIGHT;
            const scrollY = HEADER_HEIGHT + fileSectionHeight + itemIndex * ITEM_HEIGHT;
            scrollViewRef.current?.scrollTo({
                y: Math.max(0, scrollY - 50),
                animated: true,
            });
        }, 100);
    };

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
            const payload = {
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
            };

            if (isEditMode) {
                updateImportReceipt(
                    { id: importReceiptId!, data: payload },
                    {
                        onSuccess: () => {
                            fileUploaderRef.current?.markAsSaved();
                            navigation.goBack();
                        },
                    }
                );
            } else {
                createImportReceipt(payload, {
                    onSuccess: () => {
                        fileUploaderRef.current?.markAsSaved();
                        navigation.goBack();
                    },
                });
            }
        });
    };

    const handleConfirmSubmit = async () => {
        await processSubmit(false);
    };

    const handleSaveDraft = async () => {
        await processSubmit(true);
    };

    return {
        // State
        date,
        setDate,
        supplier,
        setSupplier,
        files,
        setFiles,
        warehouseItems,
        isConfirmModalVisible,
        setIsConfirmModalVisible,

        // Derived
        supplierOptions,
        materialOptions,
        totalAmount,
        isCreating,
        isUploading,

        // Handlers
        handleAddMaterial,
        handleUpdateMaterial,
        handleSubmit,
        handleConfirmSubmit,
        handleSaveDraft,
        handleDropdownOpen,

        // Refs
        fileUploaderRef,
        scrollViewRef,

        // Misc
        navigation,
        isEditMode,
        isUpdating,
    };
};
