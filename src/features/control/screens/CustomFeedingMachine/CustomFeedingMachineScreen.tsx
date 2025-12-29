import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/styles';
import { useControl } from '../../context/ControlContext';
import { EControlMode } from '../../types/control.types';

import ActivitySchedule, {
    ScheduleItem,
} from '../../components/CustomFeedingMachine/ActivitySchedule';
import { HeaderDevices } from '../../components/HeaderDevices';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { ConfirmModal } from '../../components/CustomFeedingMachine/ConfirmModal';

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
    const { updateDeviceMode } = useControl();

    const [mode, setMode] = useState<'manual' | 'schedule'>(initialMode);
    const [runDuration, setRunDuration] = useState('');
    const [stopDuration, setStopDuration] = useState('');
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

    // Dirty state tracking
    const [isDirty, setIsDirty] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const handleSave = () => {
        console.log('Dữ liệu:', { mode, runDuration, stopDuration, schedules });

        // Convert 'manual' | 'schedule' string to EControlMode enum if needed,
        // or ensure types match. EControlMode is 'MANUAL' | 'SCHEDULE' (uppercase).
        // The component uses lowercase 'manual' | 'schedule'.
        // Let's import EControlMode and map it.

        const controlMode = mode === 'schedule' ? EControlMode.SCHEDULE : EControlMode.MANUAL;

        if (route.params?.pondId && route.params?.deviceId) {
            updateDeviceMode(route.params.pondId, route.params.deviceId, controlMode);
        }

        onSave?.(mode);
        setIsDirty(false); // Reset dirty state on save
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
                    leaveScreen();
                }}
                onCancel={() => setShowConfirmModal(false)}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex1}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* 1. CHẾ ĐỘ HOẠT ĐỘNG */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Chế độ hoạt động</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity
                                style={styles.radioItem}
                                onPress={() => {
                                    setMode('manual');
                                    setIsDirty(true);
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
                        <View style={styles.rowInputs}>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Chạy (giây)</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Nhập số giây"
                                    placeholderTextColor={colors.gray[400]}
                                    keyboardType="numeric"
                                    value={runDuration}
                                    onChangeText={text => {
                                        setRunDuration(text);
                                        setIsDirty(true);
                                    }}
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Dừng (phút)</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Nhập số phút"
                                    placeholderTextColor={colors.gray[400]}
                                    keyboardType="numeric"
                                    value={stopDuration}
                                    onChangeText={text => {
                                        setStopDuration(text);
                                        setIsDirty(true);
                                    }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* 3. LỊCH HOẠT ĐỘNG */}
                    <ActivitySchedule schedules={schedules} onUpdateSchedules={setSchedules} />
                </ScrollView>
            </KeyboardAvoidingView>

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
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 12, // Keep rounded corners
        padding: 16,
        marginBottom: 16, // Spacing between cards
        marginHorizontal: 0, // Fill to edges
        // Remove shadow for flat look or keep it subtle
        width: '100%',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 16,
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
        height: 48, // Taller inputs
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        color: colors.text,
    },
});
