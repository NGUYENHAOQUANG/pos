import { useCallback, RefObject } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DocumentPickerResponse } from '@react-native-documents/picker';

import { MaterialStackParamList } from '@/features/material/navigation/MaterialNavigator';
import { MaterialItem } from '@/features/material/components/warehouse/AddWarehouseMaterial';
import { showValidationError } from '@/features/material/utils/validationToast';
import {
    useCreateExportReceipt,
    useUpdateExportReceipt,
    useDeleteExportReceipt,
} from '@/features/material/hooks/exportReceipt/useExportReceipt';
import { useFileSubmit } from '@/shared/hooks/useFileSubmit';
import { FileUploaderRef } from '@/shared/components/forms/FileUploader';

interface UseExportSubmitParams {
    // Form data
    selectedPond: string;
    note: string;
    date: Date;
    files: DocumentPickerResponse[];
    formMaterials: MaterialItem[];
    warehouseId?: string;

    // Edit mode
    isEditMode: boolean;
    exportReceiptId?: string;

    // Refs
    fileUploaderRef: RefObject<FileUploaderRef | null>;

    // Callbacks
    onReceiptCreated?: (receiptId: string) => void;

    // Modal controls
    setDeleteModalVisible: (visible: boolean) => void;
}

/**
 * Hook to handle submit, delete operations for export warehouse form
 */
export const useExportSubmit = ({
    selectedPond,
    note,
    date,
    files,
    formMaterials,
    warehouseId,
    isEditMode,
    exportReceiptId,
    fileUploaderRef,
    onReceiptCreated,
    setDeleteModalVisible,
}: UseExportSubmitParams) => {
    const navigation = useNavigation<NativeStackNavigationProp<MaterialStackParamList>>();

    // API Hooks
    const { mutate: addExportWarehouseReceipt, isPending: isAdding } = useCreateExportReceipt();
    const { mutate: updateExportReceipt, isPending: isUpdating } = useUpdateExportReceipt();
    const { mutate: deleteExportReceipt, isPending: isDeleting } = useDeleteExportReceipt();
    const { submitWithFiles, isUploading } = useFileSubmit();

    const isSubmitting = isAdding || isUpdating || isDeleting || isUploading;

    // Handler: Delete receipt
    const handleDeletePress = useCallback(
        () => setDeleteModalVisible(true),
        [setDeleteModalVisible]
    );

    const handleConfirmDelete = useCallback(() => {
        if (!exportReceiptId) return;
        deleteExportReceipt(exportReceiptId, {
            onSuccess: () => {
                setDeleteModalVisible(false);
                navigation.goBack();
            },
        });
    }, [exportReceiptId, deleteExportReceipt, navigation, setDeleteModalVisible]);

    // Validation function
    const validateForm = useCallback(
        (_isAutoSubmit: boolean) => {
            if (!selectedPond) {
                showValidationError('Vui lòng chọn ao nuôi');
                return false;
            }
            if (formMaterials.length === 0 || !formMaterials[0].materialId) {
                showValidationError('Vui lòng chọn ít nhất một vật tư');
                return false;
            }

            return true;
        },
        [selectedPond, formMaterials]
    );

    // Handler: Submit form (draft or final)
    const handleSubmitFlow = useCallback(
        async (isAutoSubmit: boolean) => {
            // Run validation
            if (!validateForm(isAutoSubmit)) {
                return;
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
                        onSuccess: response => {
                            fileUploaderRef.current?.markAsSaved();
                            // Save the receipt ID so subsequent saves use update instead of create
                            if (response?.data?.id && onReceiptCreated) {
                                onReceiptCreated(response.data.id);
                            }
                            navigation.goBack();
                        },
                    });
                }
            });
        },
        [
            validateForm,
            files,
            warehouseId,
            selectedPond,
            formMaterials,
            note,
            date,
            isEditMode,
            exportReceiptId,
            submitWithFiles,
            updateExportReceipt,
            addExportWarehouseReceipt,
            navigation,
            fileUploaderRef,
            onReceiptCreated,
        ]
    );

    return {
        navigation,
        isSubmitting,
        handleDeletePress,
        handleConfirmDelete,
        validateForm,
        handleSubmitFlow,
    };
};
