import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { ExportWarehouseInformation } from '@/features/material/components/exportwarehouse/ExportWarehouseInformation';
import { AddWarehouseMaterial } from '@/features/material/components/warehouse/AddWarehouseMaterial';
import { ExportWarehouseFooter } from '@/features/material/components/exportwarehouse/ExportWarehouseFooter';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { colors, borderRadius } from '@/styles';
import { ConfirmSubmiss } from '@/features/material/components/warehouse/ConfirmSubmiss';
import { Input } from '@/shared/components/forms/Input';
import { FileUploader } from '@/shared/components/forms/FileUploader';
import { IconTrashOutlined } from '@/assets/icons';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { useExportWarehouseForm } from '@/features/material/hooks/exportReceipt/useExportWarehouseForm';

export const AddExportWarehouseScreen: React.FC = () => {
    const { setTabBarVisible } = useTabBarVisibility();

    const {
        // Navigation
        navigation,
        isEditMode,

        // State values
        date,
        selectedZone,
        selectedPond,
        note,
        creatorName,
        files,
        formMaterials,
        isConfirmModalVisible,
        deleteModalVisible,

        // Refs
        fileUploaderRef,
        scrollViewRef,

        // Loading states
        isSubmitting,
        isLoadingDetail,

        // Options
        materialOptions,

        // Calculated values
        totalAmount,

        // Setters
        setDate,
        setSelectedZone,
        setSelectedPond,
        setNote,
        setFiles,

        // Handlers
        handleAddMaterial,
        handleUpdateMaterial,
        handleDropdownOpen,
        handleDeletePress,
        handleConfirmDelete,
        handleSubmitFlow,
        openConfirmModal,
        closeConfirmModal,
        closeDeleteModal,
    } = useExportWarehouseForm();

    // Hide tab bar when screen is focused
    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // Custom Delete Button for header
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
                                title="Vật tư xuất kho"
                            />
                        </ScrollView>
                    </SafeInputLayout>

                    <ExportWarehouseFooter
                        totalAmount={totalAmount}
                        onSaveDraft={() => handleSubmitFlow(false)}
                        onSubmit={openConfirmModal}
                    />

                    <ConfirmSubmiss
                        visible={isConfirmModalVisible}
                        onClose={closeConfirmModal}
                        onConfirm={() => {
                            closeConfirmModal();
                            handleSubmitFlow(true);
                        }}
                    />

                    <ConfirmationDeleteModal
                        visible={deleteModalVisible}
                        onConfirm={handleConfirmDelete}
                        onCancel={closeDeleteModal}
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
        paddingVertical: 8,
        paddingBottom: 100,
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
