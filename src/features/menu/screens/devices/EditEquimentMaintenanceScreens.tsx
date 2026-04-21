import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { EquipmentMaintenance } from '@/features/menu/components/devices/EquipmentMaintenance';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';
import { useMenuContext } from '@/features/menu/store/menuStore';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { IconTrashOutlined } from '@/assets/icons';

type EditEquimentMaintenanceScreenRouteProp = RouteProp<
    MenuStackParamList,
    'EditEquimentMaintenance'
>;

export const EditEquimentMaintenanceScreens = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const navigation = useNavigation();
    const route = useRoute<EditEquimentMaintenanceScreenRouteProp>();
    // Expecting deviceId and maintenanceId (or the full maintenance record object)
    const { deviceId, maintenanceId, initialData } = route.params || {};

    const { devices, updateDevice } = useMenuContext();
    const device = devices.find(d => d.id === deviceId);

    const [date, setDate] = useState(new Date());
    const [description, setDescription] = useState('');
    const [resetTime, setResetTime] = useState(false);

    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

    // Load initial data
    useEffect(() => {
        if (initialData) {
            // Parse date from string or timestamp
            if (initialData.date) {
                // Note: date might be 'dd/mm/yyyy' string if coming from TrackingGroup format not Date object
                // Ideally passing the raw ISO string or timestamp is safer.
                // Previous code used new Date(date) in EquipmentMaintenanceScreens
                // But HistoryDevicesScreens converts it to 'dd/mm/yyyy'.
                // I should ensure HistoryDevicesScreens processes raw data properly or passes original.
                // For now, let's assume we pass { date: string(ISO), description, resetTime } in `initialData`.
                // If strictly from TrackingGroup, `date` is formatted string.
                // I will handle parsing in HistoryDevicesScreens to pass ISO.
            }

            if (initialData.description) setDescription(initialData.description);
            if (initialData.resetTime !== undefined) setResetTime(initialData.resetTime);
            if (initialData.date) setDate(new Date(initialData.date));
        }
    }, [initialData]);

    const handleSave = () => {
        if (!description.trim()) {
            Toast.show(ToastMessages.Device.MAINTENANCE_DESC_REQUIRED);
            return;
        }

        if (device && updateDevice && maintenanceId) {
            const currentHistory = device.maintenanceHistory || [];
            // Update the specific record
            const updatedHistory = currentHistory.map(record => {
                // Assuming record.id corresponds to maintenanceId.
                // Note: TrackingGroup ID is maintenance_event_..., activity id is maintenance_...
                // I should target the ACTIVITY ID or Group ID?
                // In HistoryDevicesScreens: group.id = `maintenance_event_...`
                // and activities has 1 item.
                // I will target by Group ID.
                if (record.id === maintenanceId) {
                    return {
                        ...record,
                        date: require('@/features/farm/utils/dateUtils').formatDate(date),
                        activities: record.activities.map(act => ({
                            ...act,
                            time: `${String(date.getHours()).padStart(2, '0')}:${String(
                                date.getMinutes()
                            ).padStart(2, '0')}`,
                            note: `Mô tả công việc|${description}`,
                            data: [
                                {
                                    label: 'Đặt lại thời gian bảo trì',
                                    value: resetTime ? 'Có' : 'Không',
                                },
                            ],
                        })),
                    };
                }
                return record;
            });

            updateDevice(deviceId, { maintenanceHistory: updatedHistory });

            Toast.show(ToastMessages.Device.MAINTENANCE_UPDATE_SUCCESS);
        }

        navigation.goBack();
    };

    const handleDelete = () => {
        setDeleteModalVisible(true);
    };

    const confirmDelete = () => {
        if (device && updateDevice && maintenanceId) {
            const currentHistory = device.maintenanceHistory || [];
            const updatedHistory = currentHistory.filter(r => r.id !== maintenanceId);
            updateDevice(deviceId, { maintenanceHistory: updatedHistory });

            Toast.show(ToastMessages.Device.MAINTENANCE_DELETE_SUCCESS);
        }
        setDeleteModalVisible(false);
        navigation.goBack();
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <HeaderMenu
                title="Bảo trì thiết bị"
                onBack={() => navigation.goBack()}
                rightIcon={<IconTrashOutlined width={20} height={20} color={theme.text} />}
                onRightPress={handleDelete}
            />
            <ScrollView contentContainerStyle={styles.content}>
                <EquipmentMaintenance
                    date={date}
                    onDateChange={setDate}
                    description={description}
                    onDescriptionChange={setDescription}
                    resetTime={resetTime}
                    onResetTimeChange={setResetTime}
                />
            </ScrollView>

            <View style={styles.footer}>
                <ButtonBarMenu
                    secondaryTitle="Hủy"
                    primaryTitle="Cập nhật thông tin"
                    onSecondaryPress={handleCancel}
                    onPrimaryPress={handleSave}
                />
            </View>

            <ConfirmationModalUI
                visible={isDeleteModalVisible}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModalVisible(false)}
                title="Xoá thông tin bảo trì"
                message="Bạn có chắc chắn muốn xoá thông tin bảo trì này không?"
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        content: {
            paddingTop: spacing.sm,
            paddingBottom: spacing.md,
        },
        footer: {
            backgroundColor: theme.white,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
        },
    });
