import { useState, useRef, useMemo, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DocumentPickerResponse } from '@react-native-documents/picker';
import { useQueryClient } from '@tanstack/react-query';

import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useMaterials } from '@/features/material/hooks/useMaterials';
import { useSuppliers } from '@/features/material/hooks/useSuppliers';
import { useMaterialOptions } from '@/features/material/hooks/inventory';
import {
    useCreateImportReceipt,
    useUpdateImportReceipt,
    useImportReceiptDetail,
    useImportReceiptItems,
    useDeleteImportReceipt,
    useDeleteImportReceiptItem,
    importReceiptKeys,
} from '@/features/material/hooks/useImportReceipts';
import { useFileSubmit } from '@/shared/hooks/useFileSubmit';
import { showValidationError, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';
import {
    ImportSourceEnum,
    ImportReceiptStatus,
} from '@/features/material/types/importReceipt.types';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';
import { MaterialItem } from '@/features/material/components/warehouse/AddWarehouseMaterial';
import { FileUploaderRef } from '@/shared/components/forms/FileUploader';

export const useAddImportReceipt = () => {
    // Refs to track initial data load
    const detailLoadedRef = useRef(false);
    const itemsLoadedRef = useRef(false);

    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();
    const route = useRoute<RouteProp<AppStackParamList, 'AddWarehouse'>>();
    const importReceiptId = route.params?.importReceiptId;
    const isEditMode = !!importReceiptId;

    // Data Fetching
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const { data: warehouses = [] } = useWarehouses({
        ZoneId: selectedZoneId || undefined,
    });

    // Get ALL materials for selection
    const { data: materialsData = [] } = useMaterials({
        PageSize: 1000,
        OrderBy: 'CreatedAt desc',
    });

    const queryClient = useQueryClient();

    const { data: suppliers = [] } = useSuppliers();

    // Fetch Detail for Edit Mode - Using reusable hooks
    const { data: importReceiptDetail } = useImportReceiptDetail(
        isEditMode ? importReceiptId! : ''
    );

    const { data: importReceiptItems } = useImportReceiptItems(isEditMode ? importReceiptId! : '', {
        PageSize: 1000,
    });

    // Mutations & Actions
    const { submitWithFiles, isUploading } = useFileSubmit();
    const { mutate: createImportReceipt, isPending: isCreating } = useCreateImportReceipt();
    const { mutate: updateImportReceipt, isPending: isUpdating } = useUpdateImportReceipt();
    const { mutate: deleteImportReceipt, isPending: isDeleting } = useDeleteImportReceipt();
    const { mutate: deleteReceiptItem, isPending: isDeletingItem } = useDeleteImportReceiptItem();

    // Delete Modal State
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // Check if delete is allowed (show button when in edit mode)
    const status = importReceiptDetail?.items?.[0]?.status || '';
    const canDelete = isEditMode;

    const handleDeletePress = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (!importReceiptId) return;

        deleteImportReceipt(importReceiptId, {
            onSuccess: () => {
                setDeleteModalVisible(false);
                navigation.goBack();
            },
        });
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
    };

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
        return materialsData.map((m: any) => ({
            id: m.id,
            materialId: m.id,
            materialName: m.name,
            unit: m.unitName,
            // currentStock is not available in master data list, set to 0 or undefined
            remaining: 0,
        })) as unknown as IWarehouseItem[]; // Casting to IWarehouseItem to satisfy useMaterialOptions
    }, [materialsData]);

    const materialOptions = useMaterialOptions(availableMaterials);

    // Form State
    const [date, setDate] = useState(new Date());
    const [supplier, setSupplier] = useState('');
    const [files, setFiles] = useState<DocumentPickerResponse[]>([]);
    const [warehouseItems, setWarehouseItems] = useState<MaterialItem[]>([
        { id: '1', materialName: '', quantity: '', price: '' },
    ]);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    // Populate Form Data (Detail) in Edit Mode
    useEffect(() => {
        if (isEditMode && importReceiptDetail && !detailLoadedRef.current) {
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

            detailLoadedRef.current = true;
        }
    }, [importReceiptDetail, isEditMode, suppliers]);

    // Populate Items in Edit Mode - Only run once to allow local edits (add/remove)
    useEffect(() => {
        if (isEditMode && importReceiptItems && !itemsLoadedRef.current) {
            // Temporary type casting as IApiResponse structure requires verification
            const itemsData =
                (importReceiptItems as any).items || (importReceiptItems as any).data?.items || [];

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

            // Mark as loaded so subsequent refetches (e.g. after background sync)
            // don't overwrite local changes (like deleted items)
            itemsLoadedRef.current = true;
        }
    }, [importReceiptItems, isEditMode]);

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

    const handleRemoveMaterial = (id: string) => {
        const isTempId = !id.includes('-');

        // Backup current state for rollback if needed
        const previousItems = [...warehouseItems];

        // OPTIMISTIC UPDATE: Remove immediately from UI
        setWarehouseItems(prevItems => prevItems.filter(item => item.id !== id));

        // In edit mode AND is a real server item (has GUID), call API to delete
        if (isEditMode && importReceiptId && !isTempId) {
            deleteReceiptItem(
                { receiptId: importReceiptId, itemId: id },
                {
                    onSuccess: () => {
                        // Success - do nothing, item already removed locally
                        // Query invalidation will sync consistency later
                    },
                    onError: (error: any) => {
                        const errorMessage = getErrorMessage(error, 'Lỗi xóa vật tư');

                        // If error is NOT "not found", rollback the change
                        // If it IS "not found", we consider it a success (item already gone)
                        if (
                            !errorMessage.toLowerCase().includes('không tồn tại') &&
                            !errorMessage.toLowerCase().includes('not found')
                        ) {
                            showErrorToast(errorMessage);
                            setWarehouseItems(previousItems);
                        }
                    },
                }
            );
        }
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
                `Vui lòng điền đầy đủ thông tin vật tư (Vật tư ${invalidItemIndex + 1})`
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
                            // Invalidate to update inventory list and receipt details
                            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
                            queryClient.invalidateQueries({ queryKey: importReceiptKeys.lists() });
                            // Use raw key prefix to fuzzy match any params (e.g. { PageSize: 1000 })
                            queryClient.invalidateQueries({
                                queryKey: ['importReceipts', 'items', importReceiptId!],
                            });
                            queryClient.invalidateQueries({
                                queryKey: importReceiptKeys.detail(importReceiptId!),
                            });
                            navigation.goBack();
                        },
                    }
                );
            } else {
                createImportReceipt(payload, {
                    onSuccess: () => {
                        fileUploaderRef.current?.markAsSaved();
                        // Invalidate to update inventory list and receipt lists
                        queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
                        queryClient.invalidateQueries({ queryKey: importReceiptKeys.lists() });
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
        isDeletingItem,

        // Handlers
        handleAddMaterial,
        handleUpdateMaterial,
        handleRemoveMaterial,
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
        importReceiptId,
        status,

        // Delete
        isDeleting,
        canDelete,
        deleteModalVisible,
        setDeleteModalVisible,
        handleDeletePress,
        handleConfirmDelete,
        handleCancelDelete,
    };
};
