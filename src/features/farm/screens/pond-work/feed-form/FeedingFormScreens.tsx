import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';

import { View, StyleSheet } from 'react-native';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { EnvSkeleton } from '@/features/farm/components/skeleton/EnvSkeleton';

import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    useCreateFeedingRecord,
    useUpdateFeedingRecord,
    useDeleteFeedingRecord,
    useFeedingRecordDetail,
} from '@/features/farm/hooks/pondwork/feed/useFeeding';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';
import {
    FeedingForm,
    FeedingFormRef,
} from '@/features/farm/screens/pond-work/feed-form/FeedingForm';
import { FeedingFormValues } from '@/features/farm/schemas/feedingFormSchema';
import { feedingService } from '@/features/farm/services/pond-work/feeding.service';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { useDevices } from '@/features/control/hooks/useDevices';
import { deviceApi, CreateScheduleRequest } from '@/features/control/api/deviceApi';
import { DeviceData } from '@/features/control/types/control.types';
import Toast from 'react-native-toast-message';

type ScreenRouteProp = RouteProp<AppStackParamList, 'FeedingFormScreen'>;
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export const FeedingFormScreens = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId, jobId, itemToEdit } = route.params || {};

    const theme = useAppTheme();
    const styles = getStyles(theme);

    const isEditMode = !!jobId;

    const formRef = useRef<FeedingFormRef>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formHasChanges, setFormHasChanges] = useState(false);
    const [isSubmittingControl, setIsSubmittingControl] = useState(false);

    // Device schedules fetched from API
    const [deviceSchedules, setDeviceSchedules] = useState<
        {
            startTime: Date | null;
            endTime: Date | null;
            id: string;
        }[]
    >([]);
    const scheduleFetchedRef = useRef(false);

    const { materials, isLoading: isMaterialsLoading } = useFarmMaterials();
    const createMutation = useCreateFeedingRecord();
    const updateMutation = useUpdateFeedingRecord();
    const deleteMutation = useDeleteFeedingRecord();

    const { data: detailData, isLoading: queryLoading } = useFeedingRecordDetail(
        pondId || '',
        jobId || ''
    );

    const isDetailLoading = queryLoading || isMaterialsLoading;

    const { data: ponds = [] } = useDevices();
    const pId = String(pondId);
    let feederDevice: DeviceData | undefined;

    if (!isEditMode && pondId) {
        const currentPond = ponds.find(p => p.id === pId);
        feederDevice = currentPond?.devices.find(d => d.type === 'feeder');

        if (!feederDevice) {
            const iotPond = ponds.find(p => p.id === 'IOT_POND');
            feederDevice = iotPond?.devices.find(d => d.type === 'feeder');

            if (!feederDevice) {
                feederDevice = ponds
                    .reduce<DeviceData[]>((acc, p) => acc.concat(p.devices), [])
                    .find(d => d.type === 'feeder');
            }
        }
    }

    // Fetch existing schedules from device API when feeder device is found
    useEffect(() => {
        if (!feederDevice?.id || scheduleFetchedRef.current) return;
        scheduleFetchedRef.current = true;

        const fetchDeviceSchedules = async () => {
            try {
                const response = await deviceApi.getSchedules(feederDevice!.id);
                const items = response.data?.data?.items;
                if (items && items.length > 0) {
                    // Sort by 'no' field
                    items.sort((a, b) => a.no - b.no);

                    const mapped = items.map(item => {
                        // Parse time strings "HH:mm:ss.fffffff" to Date
                        const parseTimeStr = (timeStr: string): Date | null => {
                            if (!timeStr) return null;
                            const [h, m, s] = timeStr.split(':');
                            const date = new Date();
                            if (h) date.setHours(parseInt(h));
                            if (m) date.setMinutes(parseInt(m));
                            if (s) date.setSeconds(Math.floor(parseFloat(s)));
                            else date.setSeconds(0);
                            date.setMilliseconds(0);
                            return date;
                        };

                        return {
                            id: item.id,
                            startTime: parseTimeStr(item.startTime),
                            endTime: parseTimeStr(item.endTime),
                        };
                    });
                    setDeviceSchedules(mapped);
                }
            } catch (error) {
                console.error('Failed to fetch device schedules:', error);
            }
        };

        fetchDeviceSchedules();
    }, [feederDevice]);

    const isSavingActively =
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending ||
        isSubmittingControl;

    const isLoadingDetailAndEdit = isDetailLoading && isEditMode;

    const initialData = useMemo(() => {
        if (!isEditMode) {
            // For new feeding: if device has existing schedules, pre-fill them
            if (deviceSchedules.length > 0) {
                return {
                    executionDate: new Date(),
                    materials: [],
                    mode: 'schedule' as const,
                    schedules: deviceSchedules,
                    note: '',
                };
            }
            return undefined;
        }
        if (detailData?.data) {
            return feedingService.mapDetailToForm(detailData.data, materials);
        }
        if (itemToEdit) {
            return feedingService.mapMetaToForm(itemToEdit, materials);
        }
        return undefined;
    }, [isEditMode, detailData, itemToEdit, materials, deviceSchedules]);

    const handleSubmit = useCallback(
        async (formData: FeedingFormValues) => {
            if (isEditMode) {
                if (pondId && jobId) {
                    const payload = feedingService.mapFormToPayload(formData);
                    updateMutation.mutate(
                        { pondId, id: jobId, payload },
                        {
                            onSuccess: () => {
                                formRef.current?.allowNavigation();
                                showEditJobSuccessToast('FEED');
                                navigation.goBack();
                            },
                        }
                    );
                }
            } else {
                if (!pondId) return;

                const payload = feedingService.mapFormToPayload(formData);

                // Device Control Logic - sync schedules with device API
                if (feederDevice) {
                    setIsSubmittingControl(true);
                    try {
                        if (formData.mode === 'manual') {
                            await deviceApi.toggleDevice({ deviceId: feederDevice.id });
                        } else if (formData.mode === 'schedule' && formData.schedules.length > 0) {
                            // Build ISO datetime using local time
                            const toLocalISO = (date: Date): string => {
                                const y = date.getFullYear();
                                const mo = String(date.getMonth() + 1).padStart(2, '0');
                                const d = String(date.getDate()).padStart(2, '0');
                                const h = String(date.getHours()).padStart(2, '0');
                                const min = String(date.getMinutes()).padStart(2, '0');
                                const sec = String(date.getSeconds()).padStart(2, '0');
                                return `${y}-${mo}-${d}T${h}:${min}:${sec}.000Z`;
                            };

                            const validSchedules = formData.schedules.filter(
                                s => s.startTime && s.endTime
                            );

                            if (validSchedules.length > 0) {
                                const results = await Promise.all(
                                    validSchedules.map(async s => {
                                        const schedulePayload: CreateScheduleRequest = {
                                            ...(s.id &&
                                            !s.id.startsWith(Date.now().toString().slice(0, 8))
                                                ? { id: s.id }
                                                : {}),
                                            deviceId: feederDevice!.id,
                                            startTime: toLocalISO(s.startTime!),
                                            endtime: toLocalISO(s.endTime!),
                                            runTime: 0,
                                            pauseTime: 0,
                                        };

                                        try {
                                            await deviceApi.createSchedule(schedulePayload);
                                            return { success: true as const };
                                        } catch {
                                            return { success: false as const };
                                        }
                                    })
                                );

                                const failCount = results.filter(r => !r.success).length;
                                if (failCount > 0) {
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Lỗi lịch trình',
                                        text2: `${failCount} lịch trình không thể lưu`,
                                    });
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Device control error:', error);
                        Toast.show({
                            type: 'error',
                            text1: 'Lỗi điều khiển thiết bị',
                            text2: 'Không thể cập nhật trạng thái máy cho ăn',
                            visibilityTime: 4000,
                        });
                    } finally {
                        setIsSubmittingControl(false);
                    }
                }

                createMutation.mutate(
                    { pondId, payload },
                    {
                        onSuccess: () => {
                            formRef.current?.allowNavigation();
                            showAddJobSuccessToast('FEED');
                            navigation.goBack();
                        },
                    }
                );
            }
        },
        [isEditMode, pondId, jobId, updateMutation, createMutation, navigation, feederDevice]
    );

    const handleDelete = useCallback(() => {
        setShowDeleteModal(true);
    }, []);

    const confirmDelete = useCallback(() => {
        setShowDeleteModal(false);
        if (pondId && jobId) {
            deleteMutation.mutate(
                { pondId, id: jobId },
                {
                    onSuccess: () => {
                        formRef.current?.allowNavigation();
                        setTimeout(() => navigation.goBack(), 300);
                    },
                }
            );
        }
    }, [pondId, jobId, deleteMutation, navigation]);

    const renderHeaderRight = () => {
        if (!isEditMode) return undefined;
        return <DeleteButton onPress={handleDelete} />;
    };

    const handlePrimaryPress = () => {
        formRef.current?.submit();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <HeaderFarm
                type="simple"
                title={isEditMode ? 'Cho ăn' : 'Cho ăn'}
                onBack={() => navigation.goBack()}
                rightAction={renderHeaderRight()}
                backButtonDisabled={isSavingActively}
            />

            <View style={styles.contentContainer}>
                {isLoadingDetailAndEdit ? (
                    <EnvSkeleton />
                ) : (
                    <SafeInputLayout contentContainerStyle={styles.scrollContent}>
                        <FeedingForm
                            ref={formRef}
                            isEditMode={isEditMode}
                            isLoadingDetail={isLoadingDetailAndEdit}
                            isSubmitting={isSavingActively}
                            initialData={initialData}
                            onSubmit={handleSubmit}
                            onHasChangesChange={setFormHasChanges}
                        />
                    </SafeInputLayout>
                )}
            </View>
            <ButtonBarFarm
                primaryTitle={isEditMode ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                secondaryTitle="Hủy"
                onPrimaryPress={handlePrimaryPress}
                onSecondaryPress={() => navigation.goBack()}
                isLoading={isSavingActively}
                secondaryDisabled={isSavingActively}
                primaryDisabled={isSavingActively || (isEditMode && !formHasChanges)}
                style={{ borderTopWidth: 1, borderTopColor: theme.defaultBorder }}
            />
            {isEditMode && (
                <ConfirmationModalUI
                    visible={showDeleteModal}
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        contentContainer: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: spacing.md,
        },
    });
