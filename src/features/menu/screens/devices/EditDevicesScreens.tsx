import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '@/styles';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import {
    GeneralInformation,
    GeneralInformationData,
} from '../../components/devices/GeneralInformation';
import {
    MaintenancePeriod,
    MaintenancePeriodData,
} from '../../components/devices/MaintenancePeriod';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { useMenuContext } from '@/features/menu/store/menuStore';
import { DeviceData } from '@/features/menu/types/menu.types';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { IconTrashOutlined } from '@/assets/icons';

type ParamList = {
    EditDevice: {
        deviceId: string;
    };
};

export const EditDevicesScreens = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<ParamList, 'EditDevice'>>();
    const { deviceId } = route.params;
    const { devices, updateDevice, deleteDevice } = useMenuContext();

    const [device, setDevice] = useState<DeviceData | null>(null);

    // Form State
    const [generalInfo, setGeneralInfo] = useState<GeneralInformationData | null>(null);
    const [maintenanceInfo, setMaintenanceInfo] = useState<MaintenancePeriodData | null>(null);
    const [triggerValidation, setTriggerValidation] = useState(false);

    // Modal State
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    useEffect(() => {
        const foundDevice = devices.find(d => d.id === deviceId);
        if (foundDevice) {
            setDevice(foundDevice);
        } else {
            Toast.show(ToastMessages.Device.NOT_FOUND);
            navigation.goBack();
        }
    }, [deviceId, devices, navigation]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleGeneralInfoChange = useCallback((data: GeneralInformationData) => {
        setGeneralInfo(data);
    }, []);

    const handleMaintenanceInfoChange = useCallback((data: MaintenancePeriodData) => {
        setMaintenanceInfo(data);
    }, []);

    const handleUpdate = () => {
        setTriggerValidation(true);
        setTimeout(() => setTriggerValidation(false), 500);

        const isGeneralValid = generalInfo?.isValid;
        const isMaintenanceValid = maintenanceInfo?.isValid;

        if (isGeneralValid && isMaintenanceValid && generalInfo && maintenanceInfo && device) {
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
            navigation.goBack();
        }
    };

    const handleDelete = () => {
        if (device) {
            deleteDevice(device.id);
            setDeleteModalVisible(false);
            navigation.goBack();
            // Toast handled by Modal or we can show it here if we disable Modal's toast
        }
    };

    const renderRightAction = () => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => setDeleteModalVisible(true)}>
            <IconTrashOutlined width={20} height={20} color={colors.red[600]} />
        </TouchableOpacity>
    );

    if (!device) return null;

    // Prepare Initial Data
    // Note: Parsing importDate back to Date object might be tricky if format is strictly string dd/mm/yyyy.
    // Assuming simple parsing for now or need a helper. dateUtils might have parse function.
    // For now simple parsing:
    const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/');
        return new Date(Number(year), Number(month) - 1, Number(day));
    };

    const initialGeneralData: Partial<GeneralInformationData> = {
        deviceName: device.name,
        // Note: deviceType is string in DeviceData but DropDownItem in GeneralInfo.
        // We need to find the item or create a placeholder.
        // Ideally we map back to ID, but label match is fallback.
        deviceType: { id: '99', label: device.type },
        quantity: '1', // Default or from device if available (DeviceData doesn't have quantity prop currently, assume 1)
        importDate: device.importDate ? parseDate(device.importDate) : null,
        condition: device.status === 'warehouse' ? 'new' : 'used', // Approximate mapping
    };

    const initialMaintenanceData: Partial<MaintenancePeriodData> = {
        operatingTime: device.maintenance.operatingTime.limit.toString(),
        usageTime: device.maintenance.usageTime.limit.toString(),
    };

    return (
        <View style={styles.container}>
            <HeaderMenu
                title="Chỉnh sửa thiết bị"
                onBack={handleBack}
                rightAction={renderRightAction()}
            />

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

            <ButtonBarMenu
                primaryTitle="Cập nhật thông tin"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleUpdate}
                onSecondaryPress={handleBack}
                secondaryType="default"
            />

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
        paddingTop: spacing.sm,
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
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.red[600],
        borderRadius: borderRadius.sm,
    },
});
