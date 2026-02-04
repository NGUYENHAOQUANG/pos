import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/styles';
import Toast from 'react-native-toast-message';
import { useControl } from '../../store/controlStore';
import { EControlMode } from '../../types/control.types';

import ActivitySchedule, {
    ScheduleItem,
} from '../../components/CustomFeedingMachine/ActivitySchedule';
import { HeaderDevices } from '../../components/HeaderDevices';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { ConfirmModal } from '../../components/CustomFeedingMachine/ConfirmModal';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Input } from '@/shared/components/forms/Input';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ControlStackParamList } from '../../navigation/ControlNavigator';

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
    const { ponds, updateDeviceMode, updateDeviceSettings } = useControl();

    // Get IDs from params
    const pondId = route.params?.pondId;
    const deviceId = route.params?.deviceId;

    // Find current device data from store
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

    const handleSave = () => {
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
        }

        Toast.show({
            type: 'success',
            text1: 'Cập nhật cấu hình thành công',
        });

        onSave?.(mode);
        setIsDirty(false); // Reset dirty state on save
        isDirtyRef.current = false;
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

    return (
        <View style={styles.container}>
            <HeaderDevices title="Tuỳ Chỉnh Máy Cho Ăn" onBackPress={handleCancel} />

            <ConfirmModal
                visible={showConfirmModal}
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
                >
                    {/* 1. CHẾ ĐỘ HOẠT ĐỘNG */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Chế độ hoạt động</Text>
                        <View style={styles.fullWidthDivider} />
                        <View style={styles.radioGroup}>
                            <TouchableOpacity
                                style={styles.radioItem}
                                onPress={() => {
                                    setMode('manual');
                                    setIsDirty(true);
                                    isDirtyRef.current = true;
                                }}
                                activeOpacity={0.8}
                            >
                                <View
                                    style={[
                                        styles.radioOuter,
                                        mode === 'manual' && styles.radioOuterSelected,
                                    ]}
                                >
                                    {mode === 'manual' && <View style={styles.radioInner} />}
                                </View>
                                <Text style={styles.radioLabel}>Thủ công</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.radioItem}
                                onPress={() => {
                                    setMode('schedule');
                                    setIsDirty(true);
                                    isDirtyRef.current = true;
                                }}
                                activeOpacity={0.8}
                            >
                                <View
                                    style={[
                                        styles.radioOuter,
                                        mode === 'schedule' && styles.radioOuterSelected,
                                    ]}
                                >
                                    {mode === 'schedule' && <View style={styles.radioInner} />}
                                </View>
                                <Text style={styles.radioLabel}>Lịch trình</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 2. CẤU HÌNH MÁY */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Cấu hình máy</Text>
                        <View style={styles.fullWidthDivider} />
                        <View style={styles.rowInputs}>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Chạy (giây)</Text>
                                <Input
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
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Dừng (phút)</Text>
                                <Input
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
                        </View>
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
                primaryTitle="Lưu Thay Đổi"
                secondaryTitle="Hủy Thay Đổi"
                onPrimaryPress={handleSave}
                onSecondaryPress={handleCancel}
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
        paddingVertical: 12, // Vertical spacing for scroll
        paddingHorizontal: 0, // Fill width
        paddingBottom: 100,
    },
    card: {
        backgroundColor: colors.white,
        padding: 16,
        marginBottom: 16,
        marginHorizontal: 0,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 24,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.gray[300],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    radioOuterSelected: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    radioLabel: {
        fontSize: 14,
        color: colors.text,
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
