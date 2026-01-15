import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Text,
    TouchableHighlight,
    Modal,
    TouchableWithoutFeedback,
    Platform,
} from 'react-native';
import { HeaderDevices } from '../../components/HeaderDevices';
import { ButtonHistory } from '../../components/devices/ButtonHistory';
import { DevicesCard } from '../../components/devices/DevicesCard';
import { colors, spacing, borderRadius } from '@/styles';
import { EControlMode, DeviceData } from '../../types/control.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '../../navigation/ControlNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useControl } from '../../store/controlStore';
import Toast from 'react-native-toast-message';

// Removed Mocks

interface DevicesInPondScreensProps {
    // onBack?: () => void;
    // pondName?: string;
}

export const DevicesInPondScreens: React.FC<DevicesInPondScreensProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();
    const route = useRoute<RouteProp<ControlStackParamList, 'ControlDetail'>>();
    const { pondName = 'Ao 1' } = route.params || {};

    const { ponds, toggleDevice, updateDeviceMode } = useControl();
    const currentPond = ponds.find(p => p.name === pondName);
    const allDevices = currentPond?.devices || [];

    const feeders: DeviceData[] = allDevices.filter(d => d.type === 'feeder');
    const otherDevices: DeviceData[] = allDevices.filter(d => d.type !== 'feeder');

    const [showAddPopup, setShowAddPopup] = useState(false);

    // Show Custom Feeding Machine Screen
    const handleSettingsPress = (id: string) => {
        const selectedDevice = allDevices.find(d => d.id === id);

        if (selectedDevice?.mode === EControlMode.LOCAL) {
            Toast.show({
                type: 'error',
                text1: 'Không thể cấu hình thiết bị này',
            });
            return;
        }

        const initialMode = selectedDevice?.mode === EControlMode.SCHEDULE ? 'schedule' : 'manual';

        navigation.navigate('CustomFeedingMachine', {
            initialMode,
            deviceId: id,
            pondName,
            pondId: currentPond?.id || '',
        });
    };

    const handleToggleDevice = (id: string, isOn: boolean) => {
        if (currentPond) {
            toggleDevice(currentPond.id, id, isOn);
        }
    };

    const handleSwitchAll = (devicesList: DeviceData[], mode: EControlMode) => {
        if (!currentPond) return;
        devicesList.forEach(d => {
            if (d.mode === EControlMode.LOCAL) return;
            updateDeviceMode(currentPond.id, d.id, mode);
        });

        Toast.show({
            type: 'success',
            text1:
                mode === EControlMode.SCHEDULE
                    ? 'Đã chuyển tất cả sang Lịch trình'
                    : 'Đã chuyển tất cả sang Thủ công',
        });
    };

    const handleModeToggle = (id: string) => {
        if (!currentPond) return;
        const device = allDevices.find(d => d.id === id);
        if (device) {
            if (device.mode === EControlMode.LOCAL) return;
            const newMode =
                device.mode === EControlMode.SCHEDULE ? EControlMode.MANUAL : EControlMode.SCHEDULE;
            updateDeviceMode(currentPond.id, id, newMode);
        }
    };

    const renderRightHeader = () => (
        <View style={styles.headerRightContainer}>
            <TouchableOpacity
                style={[styles.addButton, showAddPopup && styles.addButtonActive]}
                onPress={() => setShowAddPopup(!showAddPopup)}
                activeOpacity={0.7}
            >
                <Ionicons name="add" size={24} color={colors.text} />
            </TouchableOpacity>

            <Modal
                visible={showAddPopup}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAddPopup(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowAddPopup(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.popupContainer}>
                                <TouchableHighlight
                                    style={styles.popupItem}
                                    underlayColor={colors.gray[100]}
                                    onPress={() => {
                                        setShowAddPopup(false);
                                        navigation.navigate('ConnectDevice', { pondName });
                                    }}
                                >
                                    <Text style={styles.popupText}>Thêm thiết bị</Text>
                                </TouchableHighlight>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );

    return (
        <View style={styles.container}>
            <HeaderDevices
                title={`Thiết Bị - ${pondName}`}
                onBackPress={() => navigation.goBack()}
                rightComponent={renderRightHeader()}
            />

            <ScrollView contentContainerStyle={styles.content}>
                {/* History Buttons Section */}
                <View style={styles.historySection}>
                    <ButtonHistory
                        onSchedulePress={() => navigation.navigate('Schedule', { pondName })}
                        onStatisticPress={() => navigation.navigate('History', { pondName })}
                        style={styles.historyButton}
                    />
                </View>

                {/* Feeder Section */}
                <DevicesCard
                    title="Máy cho ăn"
                    devices={feeders}
                    layout="grid"
                    onSettingsPress={handleSettingsPress}
                    onSwitchToSchedule={() => handleSwitchAll(feeders, EControlMode.SCHEDULE)}
                    onSwitchToManual={() => handleSwitchAll(feeders, EControlMode.MANUAL)}
                    onModePress={handleModeToggle}
                    onToggle={handleToggleDevice}
                    style={styles.extendedCard}
                />

                {/* Other Devices Section */}
                <DevicesCard
                    title="Thiết bị khác"
                    devices={otherDevices}
                    layout="grid"
                    onSettingsPress={handleSettingsPress}
                    onSwitchToSchedule={() => handleSwitchAll(otherDevices, EControlMode.SCHEDULE)}
                    onSwitchToManual={() => handleSwitchAll(otherDevices, EControlMode.MANUAL)}
                    onModePress={handleModeToggle}
                    onToggle={handleToggleDevice}
                    style={styles.extendedCard}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        padding: spacing.md,
        paddingBottom: 40,
    },
    historySection: {
        marginBottom: spacing.md,
        marginHorizontal: -spacing.md,
    },
    historyButton: {
        borderRadius: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    extendedCard: {
        marginHorizontal: -spacing.md,
        paddingHorizontal: spacing.md,
    },
    headerRightContainer: {
        zIndex: 1001,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.borderDark,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    addButtonActive: {
        borderColor: colors.primary,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        // Make popup appear just below the "+" button.
        // iOS headers are taller, so we push it further down there.
        paddingTop: Platform.select({
            ios: 96,
            android: 60,
            default: 60,
        }),
        paddingRight: spacing.md,
    },
    popupContainer: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: spacing.xs,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        minWidth: 140,
    },
    popupItem: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.sm,
    },
    popupText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '400',
    },
});
