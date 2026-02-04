import React from 'react';
import { View, StyleSheet, ScrollView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { ButtonBarMaterial } from '@/features/material/components/ButtonBarMaterial';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { colors, spacing, borderRadius } from '@/styles';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';
import { InventoryGeneralInfo } from '@/features/material/components/inventory/InventoryGeneralInfo';
import { InventoryMaterialList } from '@/features/material/components/inventory/InventoryMaterialList';
import { formatMaterialDate, formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import { IconTrashOutlined } from '@/assets/icons';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { useAddInventoryLogic } from '@/features/material/hooks/inventory/useAddInventoryLogic';

const HEADER_HEIGHT = 250;
const ITEM_HEIGHT = 380;

interface AddInventoryScreenProps {}

export const AddInventoryScreen: React.FC<AddInventoryScreenProps> = () => {
    const {
        isEditMode,
        date,
        isDatePickerVisible,
        deleteModalVisible,
        note,
        items,
        warehouseName,
        creatorName,
        materialOptions,
        setDatePickerVisible,
        setNote,
        handleDateConfirm,
        handleDeletePress,
        handleConfirmDelete,
        handleCancelDelete,
        handleAddItem,
        handleRemoveItem,
        handleUpdateItem,
        handleSaveDraft,
        handleSubmit,
        goBack,
    } = useAddInventoryLogic();

    // UI Refs
    const scrollViewRef = React.useRef<ScrollView>(null);

    const handleDropdownOpen = (itemIndex: number) => {
        setTimeout(() => {
            const scrollY = HEADER_HEIGHT + itemIndex * ITEM_HEIGHT;
            scrollViewRef.current?.scrollTo({
                y: Math.max(0, scrollY - 50),
                animated: true,
            });
        }, 100);
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
            <Loading isLoading={false}>
                <View style={styles.container}>
                    <HeaderMeterial
                        title={
                            isEditMode
                                ? 'Chỉnh Sửa Phiếu Điều Chỉnh Tồn Kho'
                                : 'Tạo Phiếu Điều Chỉnh Tồn Kho'
                        }
                        onBackPress={goBack}
                        rightComponent={isEditMode ? deleteButton : undefined}
                    />

                    <SafeInputLayout>
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.scrollView}
                            contentContainerStyle={styles.contentContainer}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Thông tin chung */}
                            <InventoryGeneralInfo
                                date={formatMaterialDate(date)}
                                createdDate={formatMaterialDateTime(date)}
                                note={note}
                                onDatePress={() => setDatePickerVisible(true)}
                                onNoteChange={setNote}
                                warehouseName={warehouseName}
                                creatorName={creatorName}
                            />

                            {/* Nhập liệu vật tư */}
                            <View style={styles.dropdownSection}>
                                <InventoryMaterialList
                                    items={items}
                                    onUpdateItem={handleUpdateItem}
                                    onAddItem={handleAddItem}
                                    onRemoveItem={handleRemoveItem}
                                    materialOptions={materialOptions}
                                    onDropdownOpen={handleDropdownOpen}
                                />
                            </View>
                        </ScrollView>
                    </SafeInputLayout>

                    {/* Nút Gửi Phiếu */}
                    <ButtonBarMaterial
                        mode="double"
                        primaryTitle="Gửi Phiếu"
                        secondaryTitle="Lưu Nháp"
                        onPrimaryPress={handleSubmit}
                        onSecondaryPress={handleSaveDraft}
                        containerStyle={{
                            borderTopWidth: 1,
                            borderTopColor: colors.gray[200],
                        }}
                        secondaryButtonStyle={{
                            flex: 1,
                            minWidth: 0,
                            borderColor: colors.blue[600],
                        }}
                        secondaryButtonTextStyle={{ color: colors.blue[600] }}
                        primaryButtonStyle={{ flex: 1 }}
                    />
                    {/* Modal Chọn Ngày */}
                    <DatePickerModal
                        visible={isDatePickerVisible}
                        onClose={() => setDatePickerVisible(false)}
                        date={date}
                        onSelectDate={handleDateConfirm}
                    />
                    {/* Confirmation Delete Modal */}
                    <ConfirmationDeleteModal
                        visible={deleteModalVisible}
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCancelDelete}
                        title="Xóa phiếu kiểm kho"
                        message="Bạn có chắc chắn muốn xóa phiếu kiểm kho này không?"
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
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: spacing.md,
        paddingBottom: 100,
    },
    dropdownSection: {
        zIndex: 100,
        ...Platform.select({
            android: { elevation: 5 },
            ios: { zIndex: 100 },
        }),
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
