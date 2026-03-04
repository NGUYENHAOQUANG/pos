import React, { useState } from 'react';
import Toast from 'react-native-toast-message';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { Loading } from '@/shared/components/ui/Loading';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    MaterialSelectionBox,
    SelectedMaterialItem,
} from '@/features/farm/components/pondwork/feed/MaterialSelectionBox';
import InfoCircleFilled from '@/assets/Icon/IconFarm/InfoCircleFilled.svg';
import ActivitySchedule, {
    ScheduleItem,
} from '@/features/control/components/CustomFeedingMachine/ActivitySchedule';
import { useFeeding, useCreateFeedingRecord } from '@/features/farm/hooks/pondwork/feed/useFeeding';
import { CreateFeedingRecordPayload } from '@/features/farm/types/feedingRecord.types';
import { useControl } from '@/features/control/store/controlStore';
import { deviceApi } from '@/features/control/api/deviceApi';
import { DeviceData } from '@/features/control/types/control.types';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
type ScreenRouteProp = RouteProp<FarmStackParamList, 'FeedTheShrimp'>;

export const AddFeederScreens = () => {
    const navigation = useNavigation();
    const route = useRoute<ScreenRouteProp>();
    const { pondId } = route.params || {}; // Assuming pondId is passed

    const [note, setNote] = useState('');
    const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
    const [executionDate, setExecutionDate] = useState(new Date());

    // Chế độ hoạt động & Lịch trình
    const [mode, setMode] = useState<'manual' | 'schedule'>('manual');
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

    // Danh sách vật tư cho màn Cho ăn
    const { materials } = useFeeding();

    // Mutation để gọi API
    const createMutation = useCreateFeedingRecord();

    // Get Ponds from ControlStore to find device
    const { ponds } = useControl();
    // Normalize pondId to string just in case
    const pId = String(pondId);
    const currentPond = ponds.find(p => p.id === pId);

    // Find the first feeder device:
    // First, check the current pond.
    let feederDevice = currentPond?.devices.find(d => d.type === 'feeder');

    if (!feederDevice) {
        // If not found in current pond, fallback to 'IOT_POND' which acts as the central device hub
        // (especially for IoT devices fetched from external sources)
        const iotPond = ponds.find(p => p.id === 'IOT_POND');
        feederDevice = iotPond?.devices.find(d => d.type === 'feeder');

        // Last resort: Check any pond
        if (!feederDevice) {
            feederDevice = ponds
                .reduce<DeviceData[]>((acc, p) => acc.concat(p.devices), [])
                .find(d => d.type === 'feeder');
        }
    }

    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasChanges =
        note.length > 0 ||
        selectedMaterials.length > 0 ||
        mode !== 'manual' ||
        schedules.length > 0;
    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(hasChanges);

    const handleSaveInfo = async () => {
        if (selectedMaterials.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn vật tư',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        if (!pondId) return;

        // Construct create payload
        const payload: CreateFeedingRecordPayload = {
            feedingDetail: {
                notes: note,
                materials: selectedMaterials.map(m => ({
                    warehouseItemId: m.material.id,
                    quantity: m.quantity,
                })),
            },
        };

        // Device Control Logic
        setIsSubmitting(true);
        try {
            if (feederDevice) {
                if (mode === 'manual') {
                    await deviceApi.toggleDevice({ deviceId: feederDevice.id });
                } else if (mode === 'schedule') {
                    const schedulePromises = schedules.map(s => {
                        if (!s.startTime || !s.endTime) return Promise.resolve(null);
                        return deviceApi.createSchedule({
                            deviceId: feederDevice.id,
                            startTime: s.startTime.toISOString(),
                            endtime: s.endTime.toISOString(),
                        });
                    });
                    await Promise.all(schedulePromises);
                }
            }
        } catch (error) {
            console.error('Device control error:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi điều khiển thiết bị',
                text2: 'Không thể cập nhật trạng thái máy cho ăn',
                position: 'top',
                visibilityTime: 4000,
            });
            // We continue to save the record even if device control fails
        } finally {
            setIsSubmitting(false);
        }

        createMutation.mutate(
            { pondId, payload },
            {
                onSuccess: () => {
                    allowNavigation();
                    navigation.goBack();
                },
                onError: (error: any) => {
                    let message = getErrorMessage(error, 'Vui lòng thử lại');
                    if (
                        message.includes('invalid start of a value') ||
                        message.includes('converted to System.Decimal') ||
                        message.includes('System.Decimal')
                    ) {
                        message = 'Số lượng vật tư không hợp lệ';
                    }
                    Toast.show({
                        type: 'error',
                        text1: 'Lưu thất bại',
                        text2: message,
                        position: 'top',
                    });
                },
            }
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <HeaderFarm type="simple" title="Cho ăn" onBack={() => navigation.goBack()} />

            <Loading isLoading={createMutation.isPending || isSubmitting}>
                <View style={styles.contentContainer}>
                    <SafeInputLayout contentContainerStyle={styles.scrollContent}>
                        {/* General Info Section */}
                        <GeneralInfoBox
                            date={executionDate}
                            onDateChange={setExecutionDate}
                            disabledDate={true}
                        />

                        {/* Select Material Section */}
                        <MaterialSelectionBox
                            selectedMaterials={selectedMaterials}
                            onMaterialsChange={setSelectedMaterials}
                            materials={materials}
                        />

                        {/* 1. CHẾ ĐỘ HOẠT ĐỘNG */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Chế độ hoạt động</Text>
                            <View style={styles.fullWidthDivider} />

                            <View style={styles.infoBox}>
                                <InfoCircleFilled width={16} height={16} style={styles.infoIcon} />
                                <Text style={styles.infoText}>
                                    Chọn Thủ công để chạy ngay, hoặc Lịch trình để thiết lập nhiều
                                    lượt hoạt động trong ngày
                                </Text>
                            </View>

                            <View style={styles.radioGroup}>
                                <TouchableOpacity
                                    style={styles.radioItem}
                                    onPress={() => setMode('manual')}
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
                                    onPress={() => setMode('schedule')}
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

                        {/* 3. LỊCH HOẠT ĐỘNG */}
                        {mode === 'schedule' && (
                            <ActivitySchedule
                                schedules={schedules}
                                onUpdateSchedules={setSchedules}
                                style={styles.activitySchedule}
                                titleStyle={styles.activityScheduleTitle}
                            />
                        )}

                        {/* Note Section */}
                        <SelectionNotesBox notes={note} onNotesChange={setNote} />
                        {/* Add extra padding at bottom to ensure content isn't hidden behind footer if keybaord is open or just for scroll space */}
                        <View style={styles.spacer} />
                    </SafeInputLayout>
                </View>
            </Loading>

            {/* Bottom Action Bar */}
            <ButtonBarFarm
                primaryTitle="Lưu thông tin"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSaveInfo}
                onSecondaryPress={() => navigation.goBack()}
                style={{ borderTopWidth: 1, borderTopColor: colors.border }}
            />

            {UnsavedChangesModal}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.md,
    },
    spacer: {
        height: 80,
    },
    // Styles from CustomFeedingMachineScreen
    card: {
        backgroundColor: colors.white,
        padding: 16,
        marginTop: 8,
        marginHorizontal: 0,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    fullWidthDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: -16,
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
    infoBox: {
        backgroundColor: colors.backgroundPrimary,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.geekblue[300],
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        lineHeight: 18,
    },
    activitySchedule: {
        marginTop: 8,
    },
    activityScheduleTitle: {
        fontSize: 14,
    },
});
