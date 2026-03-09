import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, BackHandler, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/styles';
import Toast from 'react-native-toast-message';
import { useDevices, useUpdateDeviceMode, useUpdateDeviceSettings } from '@/features/control/hooks/useDevices';
import { deviceApi } from '@/features/control/api/deviceApi';
import { EControlMode } from '@/features/control/types/control.types';

import ActivitySchedule, {
    ScheduleItem,
} from '@/features/control/components/CustomFeedingMachine/ActivitySchedule';
import { HeaderDevices } from '@/features/control/components/HeaderDevices';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Input } from '@/shared/components/forms/Input';
import { RadioButton } from '@/shared/components/forms/RadioButton';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ControlStackParamList } from '@/features/control/navigation/ControlNavigator';

interface CustomFeedingMachineProps {
    onBack?: () => void;
    initialMode?: 'manual' | 'schedule';
    onSave?: (mode: 'manual' | 'schedule') => void;
}

export default function CustomFeedingMachine(props: CustomFeedingMachineProps) {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<ControlStackParamList, 'CustomFeedingMachine'>>();

    // Prioritize route params, fallback to props (to keep backward compatibility if needed temporarily, but main use is navigation)
    const initialMode = route.params?.initialMode || props.initialMode || 'manual';
    const { onBack, onSave } = props;
    const { setTabBarVisible } = useTabBarVisibility();
    const { data: ponds = [] } = useDevices();
    const { updateMode: updateDeviceMode } = useUpdateDeviceMode();
    const { updateSettings: updateDeviceSettings } = useUpdateDeviceSettings();

    // Get IDs from params
    const pondId = route.params?.pondId;
    const deviceId = route.params?.deviceId;

    // Find current device data from React Query
    const currentPond = ponds.find(p => p.id === pondId);
    const currentDevice = currentPond?.devices.find(d => d.id === deviceId);

    const [mode, setMode] = useState<'manual' | 'schedule'>('manual');
    const [runDuration, setRunDuration] = useState('');
    const [stopDuration, setStopDuration] = useState('');
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

    // Helper to format Date to HH:mm string
    const formatTime = (date: Date | null): string => {
        if (!date) return '00:00';
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Helper to parse HH:mm string to Date
    const parseTime = (timeStr: string): Date => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    // Initialize state from store
    useEffect(() => {
        if (currentDevice) {
            // Set Mode
            setMode(currentDevice.mode === EControlMode.SCHEDULE ? 'schedule' : 'manual');

            // Set Config
            if (currentDevice.feedingConfig) {
                setRunDuration(currentDevice.feedingConfig.runTime.toString());
                setStopDuration(currentDevice.feedingConfig.stopTime.toString());
            }

            // Set Schedules (Convert Store -> UI)
            if (currentDevice.schedules) {
                const mappedSchedules: ScheduleItem[] = currentDevice.schedules.map(s => ({
                    id: s.id,
                    startTime: parseTime(s.startTime),
                    endTime: parseTime(s.endTime),
                }));
                setSchedules(mappedSchedules);
            }
        } else {
            // Fallback or initial defaults
            if (initialMode) setMode(initialMode);
        }
    }, [currentDevice, initialMode]);

    // Dirty state tracking
    const [isDirty, setIsDirty] = useState(false);
    const isDirtyRef = useRef(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', e => {
            if (!isDirtyRef.current) {
                // If we don't have unsaved changes, then we don't need to do anything
                return;
            }

            // Prevent default behavior of leaving the screen
            e.preventDefault();

            // Stash the action to replay it later
            setPendingAction(e.data.action);

            // Prompt the user before leaving the screen
            setShowConfirmModal(true);
        });

        return unsubscribe;
    }, [navigation]); // Removed isDirty dependency as we use ref

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // Handle Android hardware back button
    useEffect(() => {
        const onBackPress = () => {
            if (isDirtyRef.current) {
                setShowConfirmModal(true);
                return true; // Prevent default behavior (exit/back)
            }
            return false; // Let default behavior happen
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, []);

    const [isSaving, setIsSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch schedules from API
    const fetchSchedules = React.useCallback(async () => {
        if (!deviceId) return;
        try {
            const response = await deviceApi.getSchedules(deviceId);
            if (response.data && response.data.data && response.data.data.items) {
                const items = response.data.data.items;
                // Sort by 'no'
                items.sort((a, b) => a.no - b.no);

                const mappedSchedules = items.map(item => {
                    // Parse time strings "HH:mm:ss.fffffff" to Date
                    const parseTime = (timeStr: string) => {
                        if (!timeStr) return null;
                        const [h, m, s] = timeStr.split(':');
                        const date = new Date();
                        if (h) date.setHours(parseInt(h));
                        if (m) date.setMinutes(parseInt(m));
                        if (s) {
                            const seconds = parseFloat(s);
                            date.setSeconds(Math.floor(seconds));
                            date.setMilliseconds(
                                Math.round((seconds - Math.floor(seconds)) * 1000)
                            );
                        } else {
                            date.setSeconds(0);
                            date.setMilliseconds(0);
                        }
                        return date;
                    };

                    return {
                        id: item.id,
                        startTime: parseTime(item.startTime),
                        endTime: parseTime(item.endTime),
                    };
                });

                setSchedules(mappedSchedules);
            }
        } catch (error) {
            console.error('Failed to fetch schedules:', error);
        }
    }, [deviceId]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchSchedules();
        setRefreshing(false);
    }, [fetchSchedules]);

    React.useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        console.log('Dữ liệu:', { mode, runDuration, stopDuration, schedules });

        const controlMode = mode === 'schedule' ? EControlMode.SCHEDULE : EControlMode.MANUAL;

        if (pondId && deviceId) {
            // Convert UI Schedules -> Store Schedules
            const deviceSchedules = schedules.map(s => ({
                id: s.id,
                startTime: formatTime(s.startTime),
                endTime: formatTime(s.endTime),
                isEnabled: true, // Default enabled
            }));

            // Update Mode
            updateDeviceMode(pondId, deviceId, controlMode);

            // Update Settings (Config & Schedules)
            updateDeviceSettings(pondId, deviceId, {
                feedingConfig: {
                    runTime: parseInt(runDuration) || 0,
                    stopTime: parseInt(stopDuration) || 0,
                },
                schedules: deviceSchedules,
            });

            // Call schedule API for each schedule entry when mode is schedule
            if (mode === 'schedule' && schedules.length > 0) {
                try {
                    // Build ISO datetime using local time (not UTC)
                    const toLocalISO = (date: Date): string => {
                        const y = date.getFullYear();
                        const mo = String(date.getMonth() + 1).padStart(2, '0');
                        const d = String(date.getDate()).padStart(2, '0');
                        const h = String(date.getHours()).padStart(2, '0');
                        const min = String(date.getMinutes()).padStart(2, '0');
                        const sec = String(date.getSeconds()).padStart(2, '0');
                        return `${y}-${mo}-${d}T${h}:${min}:${sec}.000Z`;
                    };

                    const validSchedules = schedules.filter(s => s.startTime && s.endTime);
                    const responses = await Promise.all(
                        validSchedules.map(s => {
                            const payload = {
                                deviceId,
                                startTime: toLocalISO(s.startTime!),
                                endtime: toLocalISO(s.endTime!),
                            };
                            console.log('[Schedule API] Sending payload:', JSON.stringify(payload));
                            return deviceApi.createSchedule(payload);
                        })
                    );

                    // Log responses from backend
                    responses.forEach((r, i) => {
                        console.log(`[Schedule API] Response ${i + 1}:`, JSON.stringify(r.data));
                    });
                    // Check all responses for success
                    const allSuccess = responses.every(r => r.data?.success === true);

                    if (allSuccess) {
                        Toast.show({
                            type: 'success',
                            text1: 'Cập nhật lịch trình thành công',
                        });
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: 'Lỗi',
                            text2: 'Một số lịch trình không thể lưu',
                        });
                        setIsSaving(false);
                        return;
                    }
                } catch (error: any) {
                    console.error('Failed to create schedules:', error);
                    const errorMessage =
                        error?.response?.data?.message ||
                        'Thời gian bắt đầu phải nhỏ hơn thời gian hiện tại';
                    Toast.show({
                        type: 'error',
                        text1: 'Lỗi',
                        text2: errorMessage,
                    });
                    setIsSaving(false);
                    return; // Don't navigate back on error
                }
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'Cập nhật cấu hình thành công',
                });
            }
        }

        onSave?.(mode);
        setIsDirty(false); // Reset dirty state on save
        isDirtyRef.current = false;
        setIsSaving(false);
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    const handleCancel = () => {
        if (isDirty) {
            setShowConfirmModal(true); // Show confirmation if changes exist
        } else {
            leaveScreen();
        }
    };

    const leaveScreen = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    const getHeaderTitle = () => {
        if (!currentDevice?.type) return 'Tuỳ Chỉnh Máy';
        switch (currentDevice.type) {
            case 'feeder':
                return 'Tùy chỉnh máy cho ăn';
            case 'oxy':
                return 'Tùy chỉnh máy Oxy';
            case 'syphon':
                return 'Tùy chỉnh máy Syphon';
            case 'fan':
                return 'Tùy chỉnh quạt nước';
            default:
                return 'Tuỳ Chỉnh Máy';
        }
    };

    return (
        <View style={styles.container}>
            <HeaderDevices title={getHeaderTitle()} onBackPress={handleCancel} />

            <ConfirmationModalUI
                visible={showConfirmModal}
                title="Bạn có thay đổi chưa được lưu lại"
                message="Những thay đổi của bạn sẽ không được lưu lại nếu bạn rời trang"
                cancelText="Ở lại"
                confirmText="Rời trang và không lưu"
                showSuccessToast={false}
                cancelButtonStyle={{ flex: 0, paddingHorizontal: 24 }}
                confirmButtonStyle={{ flex: 1 }}
                onConfirm={() => {
                    setShowConfirmModal(false);
                    // Use setTimeout to ensure state updates allow navigation to proceed
                    setTimeout(() => {
                        setIsDirty(false);
                        isDirtyRef.current = false;
                        if (pendingAction) {
                            navigation.dispatch(pendingAction);
                            setPendingAction(null);
                        } else {
                            leaveScreen();
                        }
                    }, 100);
                }}
                onCancel={() => {
                    setShowConfirmModal(false);
                    setPendingAction(null);
                }}
            />

            <SafeInputLayout style={styles.flex1}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* 1. CHẾ ĐỘ HOẠT ĐỘNG */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Chế độ hoạt động</Text>
                        <Text style={styles.sectionSubtitle}>Chọn loại hoạt động</Text>

                        <RadioButton
                            options={[
                                { label: 'Thủ công', value: 'manual' },
                                { label: 'Lịch trình', value: 'schedule' },
                            ]}
                            value={mode}
                            onValueChange={val => {
                                setMode(val as 'manual' | 'schedule');
                                setIsDirty(true);
                                isDirtyRef.current = true;
                            }}
                        />
                    </View>

                    {/* 2. CẤU HÌNH MÁY */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Cấu hình máy</Text>

                        <Input
                            label="Chạy (giây)"
                            required
                            placeholder="Nhập số giây"
                            placeholderTextColor={colors.gray[400]}
                            keyboardType="numeric"
                            value={runDuration}
                            onChangeText={text => {
                                const numericText = text.replace(/[^0-9]/g, '');
                                setRunDuration(numericText);
                                setIsDirty(true);
                                isDirtyRef.current = true;
                            }}
                        />

                        <Input
                            label="Dừng (phút)"
                            required
                            placeholder="Nhập số phút"
                            placeholderTextColor={colors.gray[400]}
                            keyboardType="numeric"
                            value={stopDuration}
                            onChangeText={text => {
                                const numericText = text.replace(/[^0-9]/g, '');
                                setStopDuration(numericText);
                                setIsDirty(true);
                                isDirtyRef.current = true;
                            }}
                        />
                    </View>

                    {/* 3. LỊCH HOẠT ĐỘNG */}
                    <ActivitySchedule
                        schedules={schedules}
                        onUpdateSchedules={newSchedules => {
                            setSchedules(newSchedules);
                            setIsDirty(true);
                            isDirtyRef.current = true;
                        }}
                    />
                </ScrollView>
            </SafeInputLayout>

            <ButtonBar
                mode="double"
                primaryTitle={isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
                secondaryTitle="Hủy"
                onPrimaryPress={handleSave}
                onSecondaryPress={handleCancel}
                primaryButtonDisabled={isSaving}
                primaryButtonLoading={isSaving}
                secondaryButtonDisabled={isSaving}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    flex1: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: colors.white,
        padding: 16,
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 16,
    },
    rowInputs: {
        flexDirection: 'row',
        gap: 16,
    },
    inputWrapper: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 8,
    },
    textInput: {
        height: 40,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        color: colors.text,
    },
    fullWidthDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: -16,
        marginBottom: 16,
    },
});
