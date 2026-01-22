import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '@/styles';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { HeadingMenu } from '@/features/menu/components/HeadingMenu';
import { DateRangeFilter } from '@/shared/components/forms/DateRangeFilter';
import { EmptyStateCard } from '@/features/menu/components/EmptyStateCard';
import { AppStackParamList } from '@/app/navigation/AppStack';

type HistoryDevicesScreenRouteProp = RouteProp<AppStackParamList, 'HistoryDevices'>;
type HistoryDevicesScreenNavigationProp = NativeStackNavigationProp<AppStackParamList>;

import { TrackingDayCard, TrackingGroup } from '@/features/farm/components/TrackingList';

import { useMenuContext } from '@/features/menu/store/menuStore';
import { formatDate } from '@/features/farm/utils/dateUtils';

import { INSTALLATION_HISTORY, MAINTENANCE_HISTORY } from '@/features/control/data/devicesData';

export const HistoryDevicesScreens = () => {
    const navigation = useNavigation<HistoryDevicesScreenNavigationProp>();
    const route = useRoute<HistoryDevicesScreenRouteProp>();
    const { deviceId } = route.params || {};
    const { devices, updateDevice } = useMenuContext();

    // Find the device
    const device = devices.find(d => d.id === deviceId);

    console.log('History for device:', deviceId, device);

    const [selectedTab, setSelectedTab] = useState('installed');
    const [startDate, setStartDate] = useState(new Date('2025-12-01'));
    const [endDate, setEndDate] = useState(new Date('2025-12-01'));

    useEffect(() => {
        if (route.params?.success) {
            setSelectedTab('maintenance');
            Toast.show(ToastMessages.Device.MAINTENANCE_ADD_SUCCESS);

            // Update device status to 'active' (Đã lắp đặt)
            if (updateDevice && deviceId) {
                updateDevice(deviceId, { status: 'active' });
            }

            // Add a maintenance record from params
            const params = route.params;
            if (device && params?.maintenanceData && updateDevice) {
                const { date, description, resetTime } = params.maintenanceData;
                const maintenanceDate = new Date(date);

                const newRecord: TrackingGroup = {
                    id: `maintenance_event_${Date.now()}`,
                    date: formatDate(maintenanceDate),
                    activities: [
                        {
                            id: `maintenance_${device.id}_${Date.now()}`,
                            time: `${String(maintenanceDate.getHours()).padStart(2, '0')}:${String(
                                maintenanceDate.getMinutes()
                            ).padStart(2, '0')}`,
                            title: '[Tên ao]',
                            note: `Mô tả công việc|${description}`,
                            data: [
                                {
                                    label: 'Đặt lại thời gian bảo trì',
                                    value: resetTime ? 'Có' : 'Không',
                                },
                            ],
                            onEdit: () => {
                                navigation.navigate('EditEquimentMaintenance', {
                                    deviceId: device.id,
                                    maintenanceId: newRecord.id,
                                    initialData: {
                                        date: date,
                                        description: description,
                                        resetTime: resetTime,
                                    },
                                });
                            },
                        },
                    ],
                };

                // Update device with new status and history
                const currentHistory = device.maintenanceHistory || [];
                updateDevice(device.id, {
                    status: 'active',
                    maintenanceHistory: [newRecord, ...currentHistory],
                });
            }

            // Clear param
            navigation.setParams({ success: undefined });
        }
    }, [route.params, navigation, device, deviceId, updateDevice]);

    // Generate data from device info
    const displayData: TrackingGroup[] = [];

    if (device && selectedTab === 'installed') {
        const isInstalled = device.status !== 'warehouse';

        if (isInstalled) {
            // Find specific installation history using correct lookup
            const installHistory = INSTALLATION_HISTORY.find(h => h.deviceId === device.id);

            // Helper to get date string
            const getDisplayDate = () => {
                if (installHistory) return installHistory.date;
                if (device.importDate) return device.importDate;
                return 'N/A';
            };

            const displayDate = getDisplayDate();

            displayData.push({
                id: 'install_event',
                date: displayDate,
                activities: [
                    {
                        id: `install_${device.id}`,
                        time: '08:00',
                        title: installHistory
                            ? `Lắp đặt tại ${installHistory.location}`
                            : device.name,
                        data: [
                            {
                                label: 'Ngày lắp',
                                value: displayDate,
                            },
                            {
                                label: 'Kỹ thuật viên',
                                value: installHistory ? installHistory.technician : '---',
                            },
                            {
                                label: 'Giới hạn ngày SD',
                                value: device.maintenance?.usageTime?.limit
                                    ? `${device.maintenance.usageTime.limit} ngày`
                                    : '---',
                            },
                            {
                                label: 'Giới hạn giờ hoạt động',
                                value: device.maintenance?.operatingTime?.limit
                                    ? `${device.maintenance.operatingTime.limit} giờ`
                                    : '---',
                            },
                        ],
                    },
                ],
            });
        }
    }

    if (selectedTab === 'maintenance') {
        const mockMaintenance = MAINTENANCE_HISTORY.filter(h => h.deviceId === device?.id);

        if (mockMaintenance.length > 0) {
            mockMaintenance.forEach((record, index) => {
                displayData.push({
                    id: `maintenance_mock_${index}`,
                    date: record.startDate,
                    activities: [
                        {
                            id: `m_activity_${index}`,
                            time: '08:00', // Default time as not provided in mock
                            title: 'Bảo trì sửa chữa',
                            note: `Lý do: ${record.reason}`,
                            data: [
                                { label: 'Ngày bắt đầu', value: record.startDate },
                                { label: 'Ngày hoàn thành', value: record.endDate },
                                { label: 'Chi phí', value: record.estimatedCost },
                                {
                                    label: 'TGHĐ lúc lỗi',
                                    value: `${record.operatingHoursAtFault} giờ`,
                                },
                                { label: 'TGSD lúc lỗi', value: `${record.usageDaysAtFault} ngày` },
                            ],
                        },
                    ],
                });
            });
        }

        if (device?.maintenanceHistory) {
            displayData.push(...device.maintenanceHistory);
        }
    }

    const tabs = [
        {
            key: 'installed',
            label: 'Lắp đặt',
            count:
                selectedTab === 'installed' && displayData.length > 0
                    ? displayData.length
                    : device && device.status !== 'warehouse'
                    ? 1
                    : 0,
        },
        {
            key: 'maintenance',
            label: 'Bảo trì',
            count:
                (MAINTENANCE_HISTORY.filter(h => h.deviceId === device?.id).length || 0) +
                (device?.maintenanceHistory?.length || 0),
        },
    ];

    const handleEmptyStatePress = () => {
        // Action for empty state button
        if (selectedTab === 'maintenance' && device) {
            navigation.navigate('EquipmentMaintenance', { deviceId: device.id });
        }
    };

    return (
        <View style={styles.container}>
            <HeaderMenu
                title="Lịch sử thiết bị"
                onBack={() => navigation.navigate('DeviceManagement')}
            />

            <HeadingMenu selectedTab={selectedTab} onTabSelect={setSelectedTab} tabs={tabs} />

            <View style={styles.filterContainer}>
                <DateRangeFilter
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    style={styles.dateFilter}
                />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {displayData.length > 0 ? (
                    displayData.map(group => (
                        <TrackingDayCard
                            key={group.id}
                            group={group}
                            style={styles.trackingCard}
                            noteOnTop={true}
                        />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <EmptyStateCard
                            message="Chưa có dữ liệu"
                            buttonTitle="Bảo trì thiết bị"
                            onPress={handleEmptyStatePress}
                            buttonStyle={selectedTab === 'maintenance' ? {} : { display: 'none' }}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    filterContainer: {
        padding: spacing.md,
        backgroundColor: colors.white,
    },
    dateFilter: {
        width: '100%',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
    },
    content: {
        flexGrow: 1,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
    },
    trackingCard: {
        marginBottom: spacing.sm,
    },
    emptyContainer: {
        paddingHorizontal: spacing.md,
    },
});
