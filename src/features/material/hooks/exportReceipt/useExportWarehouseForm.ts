import { useCallback } from 'react';

import { useExportFormState } from './useExportFormState';
import { useExportMaterials } from './useExportMaterials';
import { useExportSubmit } from './useExportSubmit';

/**
 * Main hook for export warehouse form
 * Composes useExportFormState, useExportMaterials, and useExportSubmit
 */
export const useExportWarehouseForm = () => {
    // Form state (header info, files, modals)
    const formState = useExportFormState();

    // Materials management
    const materials = useExportMaterials({
        selectedZone: formState.selectedZone,
        isEditMode: formState.isEditMode,
        exportReceiptItems: formState.exportReceiptItems,
    });

    // Submit/Delete operations
    const submit = useExportSubmit({
        selectedPond: formState.selectedPond,
        note: formState.note,
        date: formState.date,
        files: formState.files,
        formMaterials: materials.formMaterials,
        warehouseId: materials.warehouseId,
        isEditMode: formState.isEditMode,
        exportReceiptId: formState.exportReceiptId,
        fileUploaderRef: formState.fileUploaderRef,
        setDeleteModalVisible: formState.setDeleteModalVisible,
    });

    // Destructure setters for stable references in callbacks
    const { setIsConfirmModalVisible, setDeleteModalVisible, scrollViewRef } = formState;

    // Handler: Scroll to end when dropdown opens
    const handleDropdownOpen = useCallback(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200);
    }, [scrollViewRef]);

    // Modal helpers
    const openConfirmModal = useCallback(
        () => setIsConfirmModalVisible(true),
        [setIsConfirmModalVisible]
    );
    const closeConfirmModal = useCallback(
        () => setIsConfirmModalVisible(false),
        [setIsConfirmModalVisible]
    );
    const closeDeleteModal = useCallback(
        () => setDeleteModalVisible(false),
        [setDeleteModalVisible]
    );

    return {
        // Navigation
        navigation: submit.navigation,
        isEditMode: formState.isEditMode,

        // State values
        date: formState.date,
        selectedZone: formState.selectedZone,
        selectedPond: formState.selectedPond,
        note: formState.note,
        creatorName: formState.creatorName,
        files: formState.files,
        formMaterials: materials.formMaterials,
        isConfirmModalVisible: formState.isConfirmModalVisible,
        deleteModalVisible: formState.deleteModalVisible,

        // Refs
        fileUploaderRef: formState.fileUploaderRef,
        scrollViewRef: formState.scrollViewRef,

        // Loading states
        isSubmitting: submit.isSubmitting,
        isLoadingDetail: formState.isLoadingDetail,

        // Options
        materialOptions: materials.materialOptions,

        // Calculated values
        totalAmount: materials.totalAmount,

        // Setters
        setDate: formState.setDate,
        setSelectedZone: formState.setSelectedZone,
        setSelectedPond: formState.setSelectedPond,
        setNote: formState.setNote,
        setFiles: formState.setFiles,

        // Handlers
        handleAddMaterial: materials.handleAddMaterial,
        handleUpdateMaterial: materials.handleUpdateMaterial,
        handleDropdownOpen,
        handleDeletePress: submit.handleDeletePress,
        handleConfirmDelete: submit.handleConfirmDelete,
        handleSubmitFlow: submit.handleSubmitFlow,
        openConfirmModal,
        closeConfirmModal,
        closeDeleteModal,
    };
};
