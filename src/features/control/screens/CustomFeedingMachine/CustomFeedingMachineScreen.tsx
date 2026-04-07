import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { RefreshControl } from '@/shared/components/layout/RefreshControl';
import { Text } from '@/shared/components/typography/Text';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@/styles/themeContext';
import {
    useDevices,
    useUpdateDeviceMode,
    useUpdateDeviceSettings,
} from '@/features/control/hooks/useDevices';
import { deviceApi, CreateScheduleRequest } from '@/features/control/api/deviceApi';
import { EControlMode } from '@/features/control/types/control.types';
import {
    showScheduleMissingRunTimeToast,
    showScheduleMissingStopTimeToast,
    showSchedulePastStartTimeToast,
    showScheduleOverlapToast,
    showScheduleUpdateSuccessToast,
    showScheduleConfigSuccessToast,
    showSchedulePartialFailToast,
    showScheduleSaveFailedToast,
} from '@/features/farm/utils/toastMessages';

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
import { CustomDeviceSkeleton } from '@/features/control/components/skeleton/CustomDeviceSkeleton';

interface CustomFeedingMachineProps {
    onBack?: () => void;
    initialMode?: 'manual' | 'schedule';
    onSave?: (mode: 'manual' | 'schedule') => void;
}

export default function CustomFeedingMachine(props: CustomFeedingMachineProps) {
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);
    const navigation = useNavigation();
    const route = useRoute<RouteProp<ControlStackParamList, 'CustomFeedingMachine'>>();

    // Main use is via route params navigation
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

    // Track whether initial data has been loaded to prevent overwriting user changes
    const isInitializedRef = useRef(false);

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

    // Initialize state from store - only on first load, never overwrite user changes
    useEffect(() => {
        if (isInitializedRef.current) return;
        if (currentDevice) {
            isInitializedRef.current = true;

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
        }
    }, [currentDevice]);

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
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    // Track initial fetch to only auto-set mode/schedules on first load
    const isInitialFetchRef = useRef(true);

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

                // Only auto-set mode and schedules on initial fetch
                // After that, user controls mode and schedules locally
                if (isInitialFetchRef.current) {
                    isInitialFetchRef.current = false;
                    setSchedules(mappedSchedules);

                    // Get runTime & pauseTime from the item with highest 'no'
                    const latestItem = items[items.length - 1];
                    if (latestItem) {
                        if (latestItem.runTime != null) {
                            setRunDuration(latestItem.runTime.toString());
                        }
                        if (latestItem.pauseTime != null) {
                            setStopDuration(latestItem.pauseTime.toString());
                        }
                    }

                    if (mappedSchedules.length > 0) {
                        setMode('schedule');
                        if (pondId && deviceId) {
                            updateDeviceMode(pondId, deviceId, EControlMode.SCHEDULE);
                        }
                    } else {
                        setMode('manual');
                        if (pondId && deviceId) {
                            updateDeviceMode(pondId, deviceId, EControlMode.MANUAL);
                        }
                    }
                } else if (!isDirtyRef.current) {
                    // Only update schedules from API if user hasn't made local changes
                    setSchedules(mappedSchedules);
                }
            }
        } catch (error) {
            console.error('Failed to fetch schedules:', error);
        } finally {
            setIsInitialLoading(false);
        }
    }, [deviceId, pondId, updateDeviceMode]);

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

        // Validate machine config fields when in schedule mode
        if (mode === 'schedule') {
            if (!runDuration.trim()) {
                showScheduleMissingRunTimeToast();
                return;
            }
            if (!stopDuration.trim()) {
                showScheduleMissingStopTimeToast();
                return;
            }
        }

        setIsSaving(true);
        console.log('Dữ liệu:', { deviceId, mode, runDuration, stopDuration, schedules });

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
                    const toLocalISO = (date: Date): string => {
                        const y = date.getFullYear();
                        const mo = String(date.getMonth() + 1).padStart(2, '0');
                        const d = String(date.getDate()).padStart(2, '0');
                        const h = String(date.getHours()).padStart(2, '0');
                        const min = String(date.getMinutes()).padStart(2, '0');
                        const sec = String(date.getSeconds()).padStart(2, '0');
                        return `${y}-${mo}-${d}T${h}:${min}:${sec}.000Z`;
                    };
                    // Only send schedules with future startTime
                    const now = new Date();
                    const validSchedules = schedules.filter(
                        s => s.startTime && s.endTime && s.startTime > now
                    );

                    // Check if any new schedule has past startTime
                    const newPastSchedule = schedules.find(
                        s => s.isNew && s.startTime && s.startTime <= now
                    );
                    if (newPastSchedule) {
                        showSchedulePastStartTimeToast();
                        setIsSaving(false);
                        return;
                    }

                    // Check overlap only for newly added schedules against existing future ones
                    const newSchedules = validSchedules.filter(s => s.isNew);
                    for (const newItem of newSchedules) {
                        const overlap = validSchedules.find(
                            s =>
                                s !== newItem &&
                                newItem.startTime! >= s.startTime! &&
                                newItem.startTime! < s.endTime!
                        );
                        if (overlap) {
                            const fmt = (d: Date) =>
                                `${String(d.getHours()).padStart(2, '0')}:${String(
                                    d.getMinutes()
                                ).padStart(2, '0')}`;
                            showScheduleOverlapToast(
                                `Lượt ${fmt(newItem.startTime!)}-${fmt(
                                    newItem.endTime!
                                )} trùng với ${fmt(overlap.startTime!)}-${fmt(overlap.endTime!)}`
                            );
                            setIsSaving(false);
                            return;
                        }
                    }

                    if (validSchedules.length === 0) {
                        showScheduleConfigSuccessToast();
                    } else {
                        // Send each schedule individually, catch errors per request
                        const results = await Promise.all(
                            validSchedules.map(async s => {
                                const payload: CreateScheduleRequest = {
                                    // Include id for existing schedules (already saved on server)
                                    ...(!s.isNew ? { id: s.id } : {}),
                                    deviceId: deviceId!,
                                    startTime: toLocalISO(s.startTime!),
                                    endtime: toLocalISO(s.endTime!),
                                    runTime: parseInt(runDuration) || 0,
                                    pauseTime: parseInt(stopDuration) || 0,
                                };

                                console.log(
                                    '[Schedule API] Sending payload:',
                                    JSON.stringify(payload)
                                );
                                try {
                                    const res = await deviceApi.createSchedule(payload);
                                    return { success: true as const, data: res.data };
                                } catch (err: unknown) {
                                    // Error is a NormalizedError from the response interceptor
                                    const normalized = err as {
                                        type?: string;
                                        message?: string;
                                        data?: unknown;
                                        statusCode?: number;
                                    };
                                    console.error(
                                        '[Schedule API] Failed:',
                                        '\n  Type:',
                                        normalized.type ?? 'N/A',
                                        '\n  Status:',
                                        normalized.statusCode ?? 'N/A',
                                        '\n  Message:',
                                        normalized.message ?? 'No message',
                                        '\n  Server Data:',
                                        JSON.stringify(normalized.data ?? 'No data'),
                                        '\n  Payload Sent:',
                                        JSON.stringify(payload)
                                    );
                                    return { success: false as const, error: err };
                                }
                            })
                        );

                        // Count successes and failures
                        const successCount = results.filter(r => r.success).length;
                        const failCount = results.length - successCount;

                        // Collect unique error messages from all failed results
                        const errorMessages = results
                            .filter(r => !r.success)
                            .map(r => (r.error as { message?: string })?.message)
                            .filter((msg): msg is string => !!msg);
                        const uniqueErrors = [...new Set(errorMessages)];
                        // Prefer specific error messages over generic "Device schedule failed"
                        const specificError = uniqueErrors.find(
                            msg => msg !== 'Device schedule failed'
                        );
                        const displayError = specificError || uniqueErrors[0];

                        if (failCount === 0) {
                            showScheduleUpdateSuccessToast();
                        } else if (successCount > 0) {
                            showSchedulePartialFailToast(
                                displayError || `${successCount} thành công, ${failCount} thất bại`
                            );
                        } else {
                            showScheduleSaveFailedToast(displayError);
                            setIsSaving(false);
                            return;
                        }
                    }
                } catch (error: unknown) {
                    console.error('Failed to create schedules:', error);
                    showScheduleSaveFailedToast('Có lỗi xảy ra khi lưu lịch trình');
                    setIsSaving(false);
                    return;
                }
            } else {
                showScheduleConfigSuccessToast();
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
        <View style={themedStyles.container}>
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

            {isInitialLoading ? (
                <CustomDeviceSkeleton />
            ) : (
                <SafeInputLayout
                    style={styles.flex1}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* 1. CHẾ ĐỘ HOẠT ĐỘNG */}
                    <View style={themedStyles.card}>
                        <Text style={themedStyles.sectionTitle}>Chế độ hoạt động</Text>
                        <Text style={themedStyles.sectionSubtitle}>Chọn loại hoạt động</Text>

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

                    {/* 2. CẤU HÌNH MÁY - Only show in schedule mode */}
                    {mode === 'schedule' && (
                        <View style={themedStyles.card}>
                            <Text style={themedStyles.sectionTitle}>Cấu hình máy</Text>

                            <Input
                                label="Chạy (giây)"
                                required
                                placeholder="Nhập số giây"
                                placeholderTextColor={theme.gray[400]}
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
                                placeholderTextColor={theme.gray[400]}
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
                    )}

                    {/* 3. LỊCH HOẠT ĐỘNG - Only show in schedule mode */}
                    {mode === 'schedule' && (
                        <ActivitySchedule
                            schedules={schedules}
                            onUpdateSchedules={newSchedules => {
                                setSchedules(newSchedules);
                                setIsDirty(true);
                                isDirtyRef.current = true;
                            }}
                        />
                    )}
                </SafeInputLayout>
            )}

            {!isInitialLoading && (
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
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    flex1: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
});

const getStyles = (theme: ReturnType<typeof import('@/styles/themeContext').useAppTheme>) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        card: {
            backgroundColor: theme.background,
            padding: 16,
            marginBottom: 8,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.border,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
            marginBottom: 16,
        },
        sectionSubtitle: {
            fontSize: 14,
            color: theme.text,
            marginBottom: 16,
        },
    });
