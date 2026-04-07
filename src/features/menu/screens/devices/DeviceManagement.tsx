import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    GestureResponderEvent,
    ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

// Components
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
// import { HeadingMenu } from '@/features/menu/components/HeadingMenu';
import { HeadingBar } from '@/shared/components/layout/HeadingBar';
// import { EmptyStateCard } from '@/features/menu/components/EmptyStateCard';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { DevicesCard } from '@/features/menu/components/devices/DevicesCard';
import { DeviceData } from '@/features/menu/types/menu.types';
import { WarningDevices } from '@/features/menu/components/devices/WarningDevices';
import { ActionMenu, getMenuPosition } from '@/shared/components/buttons/ActionMenuButton';
import { useMenuContext } from '@/features/menu/store/menuStore';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';

const { width: windowWidth } = Dimensions.get('window');

export const DeviceManagement = () => {
    const navigation = useNavigation();
    const { devices, deleteDevice } = useMenuContext();
    const [selectedTab, setSelectedTab] = useState('all');
    const theme = useAppTheme();
    const styles = getStyles(theme);

    // States for filter
    const [selectedFarm, setSelectedFarm] = useState<DropDownItem>({
        id: '1',
        label: 'Trại Kiên Giang',
    });
    const [selectedDeviceType, setSelectedDeviceType] = useState<DropDownItem>({
        id: '0',
        label: 'Loại thiết bị',
    });

    // Menu State
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{
        top?: number;
        bottom?: number;
        right: number;
    }>({ top: 0, right: 0 });
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const handleMorePress = (event: GestureResponderEvent, deviceId: string) => {
        const target = event.currentTarget as any;
        // Use measureInWindow to get absolute coordinates relative to the screen
        target.measureInWindow((x: number, y: number, width: number, height: number) => {
            const windowHeight = Dimensions.get('window').height;
            // pageY is essentially y in measureInWindow
            const verticalPos = getMenuPosition(y, height, windowHeight, 220);

            const newPosition: { top?: number; bottom?: number; right: number } = {
                // Calculate right offset from window edge
                right: windowWidth - (x + width),
                ...verticalPos,
            };

            setMenuPosition(newPosition as any);
            setSelectedDeviceId(deviceId);
            setMenuVisible(true);
        });
    };

    const handleCloseMenu = () => {
        setMenuVisible(false);
        setSelectedDeviceId(null);
    };

    // Mock data for filters
    const farms: DropDownItem[] = [
        { id: '1', label: 'Trại Kiên Giang' },
        { id: '2', label: 'Trại Cà Mau' },
        { id: '3', label: 'Trại Bạc Liêu' },
    ];

    const deviceTypes: DropDownItem[] = [
        { id: '0', label: 'Loại thiết bị' },
        { id: '1', label: 'Máy cho ăn' },
        { id: '2', label: 'Xiphong' },
        { id: '3', label: 'Máy thổi khí' },
        { id: '4', label: 'Quạt nước' },
    ];

    const tabs = [
        { key: 'all', label: 'Tất cả', count: devices.length },
        {
            key: 'warehouse',
            label: 'Lưu kho',
            count: devices.filter(d => d.status === 'warehouse').length,
        },
        {
            key: 'installed',
            label: 'Đã lắp đặt',
            count: devices.filter(d => d.status === 'installed' || d.status === 'active').length,
        },
        {
            key: 'maintenance',
            label: 'Đến hạn bảo trì',
            count: devices.filter(d => d.status === 'maintenance').length,
        },
    ];

    const renderAddButton = () => (
        <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddDevice' as never)}
        >
            <Ionicons name="add" size={24} color={theme.text} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <HeaderMenu
                title="Quản lý bảo trì thiết bị"
                onBack={() => navigation.goBack()}
                rightAction={renderAddButton()}
            />

            <HeadingBar
                selectedTab={selectedTab}
                onTabSelect={setSelectedTab}
                tabs={tabs}
                containerStyle={{
                    paddingTop: spacing.md,
                    backgroundColor: 'transparent',
                }}
            />

            <View style={styles.filterContainer}>
                <View style={styles.filterItem}>
                    <DropDownButtonBasic
                        data={farms}
                        value={selectedFarm}
                        onSelect={setSelectedFarm}
                        showIcon={false}
                        height={40}
                        borderRadius={borderRadius.md}
                    />
                </View>
                <View style={{ width: spacing.sm }} />
                <View style={styles.filterItem}>
                    <DropDownButtonBasic
                        data={deviceTypes}
                        value={selectedDeviceType}
                        onSelect={setSelectedDeviceType}
                        showIcon={false}
                        height={40}
                        borderRadius={borderRadius.md}
                    />
                </View>
            </View>

            <View style={styles.content}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Warning Banner - Check if any device is in maintenance */}
                    {devices.some(device => device.status === 'maintenance') && (
                        <WarningDevices
                            onPress={() => {
                                setSelectedTab('maintenance');
                            }}
                        />
                    )}

                    {devices
                        .filter(device => {
                            // Filter by Tab
                            let matchesTab = true;
                            if (selectedTab === 'warehouse')
                                matchesTab = device.status === 'warehouse';
                            else if (selectedTab === 'installed')
                                matchesTab =
                                    device.status === 'installed' || device.status === 'active';
                            else if (selectedTab === 'maintenance')
                                matchesTab = device.status === 'maintenance';

                            // Filter by Device Type
                            let matchesType = true;
                            if (selectedDeviceType.id !== '0') {
                                matchesType = device.type === selectedDeviceType.label;
                            }

                            return matchesTab && matchesType;
                        })
                        .map((device: DeviceData) => (
                            <DevicesCard
                                key={device.id}
                                device={device}
                                onPress={() => {}}
                                onMorePress={event => handleMorePress(event, device.id)}
                            />
                        ))}
                </ScrollView>

                <ActionMenu
                    visible={menuVisible}
                    onClose={handleCloseMenu}
                    position={menuPosition}
                    items={[
                        {
                            label: 'Chỉnh sửa thông tin',
                            onPress: () => {
                                handleCloseMenu();
                                if (selectedDeviceId) {
                                    (navigation.navigate as any)('EditDevice', {
                                        deviceId: selectedDeviceId,
                                    });
                                }
                            },
                        },
                        {
                            label: 'Bảo trì thiết bị',
                            onPress: () => {
                                handleCloseMenu();
                                console.log('Maintain device:', selectedDeviceId);
                                if (selectedDeviceId) {
                                    (navigation.navigate as any)('EquipmentMaintenance', {
                                        deviceId: selectedDeviceId,
                                    });
                                }
                            },
                        },
                        {
                            label: 'Xem lịch sử thiết bị',
                            onPress: () => {
                                handleCloseMenu();
                                if (selectedDeviceId) {
                                    (navigation.navigate as any)('HistoryDevices', {
                                        deviceId: selectedDeviceId,
                                    });
                                }
                            },
                        },
                        {
                            label: 'Xoá thiết bị',
                            onPress: () => {
                                // Don't call handleCloseMenu here to preserve selectedDeviceId for the modal
                                setMenuVisible(false);
                                setDeleteModalVisible(true);
                            },
                        },
                    ]}
                />

                <ConfirmationModalUI
                    visible={deleteModalVisible}
                    onConfirm={() => {
                        if (selectedDeviceId) {
                            deleteDevice(selectedDeviceId);
                        }
                        setDeleteModalVisible(false);
                        setSelectedDeviceId(null);
                    }}
                    onCancel={() => {
                        setDeleteModalVisible(false);
                        setSelectedDeviceId(null);
                    }}
                    title="Xoá thiết bị"
                    message="Bạn có chắc chắn muốn xoá thiết bị này?"
                    successMessage="Đã xóa thiết bị thành công"
                />
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        addButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: borderRadius.full,
            backgroundColor: theme.background,
            borderColor: theme.defaultBorder,
        },
        filterContainer: {
            flexDirection: 'row',
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
            paddingBottom: spacing.sm,
            backgroundColor: 'transparent',
            zIndex: 10,
        },
        filterItem: {
            flex: 1,
        },
        content: {
            flex: 1,
            justifyContent: 'flex-start',
            paddingTop: spacing.sm,
            backgroundColor: 'transparent',
        },
        emptyStateButton: {
            backgroundColor: theme.primary,
            borderRadius: borderRadius.md,
            width: '100%',
            maxWidth: 200,
        },
        scrollContent: {
            paddingHorizontal: 16,
            paddingBottom: spacing.xl,
        },
    });
