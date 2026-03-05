import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '@/styles';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import {
    GeneralInformation,
    GeneralInformationData,
} from '@/features/menu/components/devices/GeneralInformation';
import {
    MaintenancePeriod,
    MaintenancePeriodData,
} from '@/features/menu/components/devices/MaintenancePeriod';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { useMenuContext } from '@/features/menu/store/menuStore';
import { DeviceData } from '@/features/menu/types/menu.types';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import DeleteIcon from '@/assets/Icon/Delete.svg';

// Route params - deviceId is optional; if present => Edit mode, else => Add mode
type ParamList = {
    AddDevice: { deviceId?: string };
    EditDevice: { deviceId: string };
};

/** Parse date string dd/mm/yyyy back to Date object */
const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
};

export const AddDeviceScreens = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<ParamList, 'AddDevice'>>();
    const deviceId = route.params?.deviceId;
    const isEditMode = Boolean(deviceId);

    const { devices, addDevice, updateDevice, deleteDevice } = useMenuContext();

    // Device to edit (populated in Edit mode)
    const [device, setDevice] = useState<DeviceData | null>(null);

    // Form state
    const [generalInfo, setGeneralInfo] = useState<GeneralInformationData | null>(null);
    const [maintenanceInfo, setMaintenanceInfo] = useState<MaintenancePeriodData | null>(null);
    const [triggerValidation, setTriggerValidation] = useState(false);

    // Delete modal
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // Load device data in Edit mode
    useEffect(() => {
        if (!isEditMode) return;
        const found = devices.find(d => d.id === deviceId);
        if (found) {
            setDevice(found);
        } else {
            Toast.show(ToastMessages.Device.NOT_FOUND);
            navigation.goBack();
        }
    }, [deviceId, devices, isEditMode, navigation]);

    const handleBack = () => navigation.goBack();

    const handleGeneralInfoChange = useCallback((data: GeneralInformationData) => {
        setGeneralInfo(data);
    }, []);

    const handleMaintenanceInfoChange = useCallback((data: MaintenancePeriodData) => {
        setMaintenanceInfo(data);
    }, []);

    const handleSubmit = () => {
        setTriggerValidation(true);
        setTimeout(() => setTriggerValidation(false), 500);

        if (!generalInfo?.isValid || !maintenanceInfo?.isValid) return;

        if (isEditMode && device) {
            // --- Edit mode ---
            const updatedDevice: Partial<DeviceData> = {
                name: generalInfo.deviceName,
                type: generalInfo.deviceType?.label || '',
                status: generalInfo.condition === 'new' ? 'warehouse' : 'installed',
                importDate: generalInfo.importDate
                    ? generalInfo.importDate.toLocaleDateString('vi-VN')
                    : '',
                maintenance: {
                    operatingTime: {
                        current: device.maintenance.operatingTime.current,
                        limit: parseInt(maintenanceInfo.operatingTime) || 0,
                    },
                    usageTime: {
                        current: device.maintenance.usageTime.current,
                        limit: parseInt(maintenanceInfo.usageTime) || 0,
                    },
                },
            };
            updateDevice(device.id, updatedDevice);
            Toast.show(ToastMessages.Device.UPDATE_SUCCESS);
        } else {
            // --- Add mode ---
            const newDevice: Omit<DeviceData, 'id'> = {
                name: generalInfo.deviceName,
                type: generalInfo.deviceType?.label || '',
                status: generalInfo.condition === 'new' ? 'warehouse' : 'installed',
                importDate: generalInfo.importDate
                    ? generalInfo.importDate.toLocaleDateString('vi-VN')
                    : '',
                totalRunTime: '0 giờ',
                maintenance: {
                    operatingTime: {
                        current: 0,
                        limit: parseInt(maintenanceInfo.operatingTime) || 0,
                    },
                    usageTime: {
                        current: 0,
                        limit: parseInt(maintenanceInfo.usageTime) || 0,
                    },
                },
            };
            addDevice(newDevice);
            Toast.show(ToastMessages.Device.ADD_SUCCESS);
        }

        navigation.goBack();
    };

    const handleDelete = () => {
        if (device) {
            deleteDevice(device.id);
            setDeleteModalVisible(false);
            navigation.goBack();
        }
    };

    // Skip render until device is loaded in Edit mode
    if (isEditMode && !device) return null;

    // Initial data for forms (only in Edit mode)
    const initialGeneralData =
        isEditMode && device
            ? {
                  deviceName: device.name,
                  deviceType: { id: '99', label: device.type },
                  quantity: '1',
                  importDate: device.importDate ? parseDate(device.importDate) : null,
                  condition: (device.status === 'warehouse' ? 'new' : 'used') as 'new' | 'used',
              }
            : undefined;

    const initialMaintenanceData =
        isEditMode && device
            ? {
                  operatingTime: device.maintenance.operatingTime.limit.toString(),
                  usageTime: device.maintenance.usageTime.limit.toString(),
              }
            : undefined;

    // Delete button shown only in Edit mode
    const renderRightAction = () =>
        isEditMode ? (
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setDeleteModalVisible(true)}
            >
                <DeleteIcon width={20} height={20} />
            </TouchableOpacity>
        ) : null;

    return (
        <View style={styles.container}>
            <HeaderMenu
                title={isEditMode ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị'}
                onBack={handleBack}
                rightAction={renderRightAction()}
            />

            <SafeInputLayout>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <GeneralInformation
                        onDataChange={handleGeneralInfoChange}
                        triggerValidation={triggerValidation}
                        initialData={initialGeneralData}
                    />

                    <MaintenancePeriod
                        onDataChange={handleMaintenanceInfoChange}
                        triggerValidation={triggerValidation}
                        initialData={initialMaintenanceData}
                    />
                </ScrollView>
            </SafeInputLayout>

            <ButtonBarMenu
                primaryTitle={isEditMode ? 'Cập nhật thông tin' : 'Thêm thiết bị'}
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSubmit}
                onSecondaryPress={handleBack}
                secondaryType="default"
                style={styles.footer}
            />

            {/* Confirmation delete modal - only shown in Edit mode */}
            <ConfirmationDeleteModal
                visible={deleteModalVisible}
                onConfirm={handleDelete}
                onCancel={() => setDeleteModalVisible(false)}
                title="Xoá thiết bị"
                message="Bạn có chắc chắn muốn xoá thiết bị này không?"
                successMessage="Đã xóa thiết bị thành công"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    scrollContent: {
        paddingTop: spacing.md,
        paddingHorizontal: spacing.md,
        paddingBottom: 100,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    deleteButton: {
        backgroundColor: colors.white,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.full,
    },
});
