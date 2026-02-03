import React, { useEffect } from 'react';
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
import { AddWarehouseMaterial } from '@/features/material/components/warehouse/AddWarehouseMaterial';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { colors, spacing, borderRadius } from '@/styles';
import { ConfirmSubmiss } from '@/features/material/components/warehouse/ConfirmSubmiss';
import { useAddImportReceipt } from '@/features/material/hooks/importReceipt/useAddImportReceipt';
import { FileUploader } from '@/shared/components/forms/FileUploader';
import { IconTrashOutlined } from '@/assets/icons';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';

interface AddWarehouseScreenProps {}

export const AddWarehouseScreen: React.FC<AddWarehouseScreenProps> = () => {
    const { setTabBarVisible } = useTabBarVisibility();

    const {
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

        // Delete (from hook)
        isDeleting,
        canDelete,
        deleteModalVisible,
        handleDeletePress,
        handleConfirmDelete,
        handleCancelDelete,
    } = useAddImportReceipt();

    // Delete Button Component
    const deleteButton = (
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeletePress}
            activeOpacity={0.7}
        >
            <IconTrashOutlined width={20} height={20} />
        </TouchableOpacity>
    );

    const formatCurrency = (value: number) => {
        return (
            <>
                {formatCurrencyValue(value)}{' '}
                <Text style={{ textDecorationLine: 'underline' }}>đ</Text>
            </>
        );
    };

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <Loading isLoading={isCreating || isUploading || isUpdating || isDeleting}>
                <View style={styles.container}>
                    <HeaderMeterial
                        title={isEditMode ? 'Chỉnh sửa phiếu nhập kho' : 'Tạo Phiếu Nhập Kho'}
                        onBackPress={() => navigation.goBack()}
                        rightComponent={canDelete ? deleteButton : undefined}
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
                                onRemoveMaterial={handleRemoveMaterial}
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
                        onConfirm={() => {
                            setIsConfirmModalVisible(false);
                            setTimeout(() => {
                                handleConfirmSubmit();
                            }, 500);
                        }}
                    />

                    {/* Confirmation Delete Modal */}
                    <ConfirmationDeleteModal
                        visible={deleteModalVisible}
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCancelDelete}
                        title="Xóa phiếu nhập kho"
                        message="Bạn có chắc chắn muốn xóa phiếu nhập kho này không?"
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
