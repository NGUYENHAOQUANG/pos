import React, { useRef, useState, useCallback, useMemo } from 'react';

import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { Loading } from '@/shared/components/ui/Loading';

import DeleteIcon from '@/assets/Icon/IconFarm/Delete.svg';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    useFeeding,
    useCreateFeedingRecord,
    useUpdateFeedingRecord,
    useDeleteFeedingRecord,
    useFeedingRecordDetail,
} from '@/features/farm/hooks/pondwork/feed/useFeeding';
import { FeedingForm, FeedingFormRef } from '@/features/farm/screens/pondwork/feed/FeedingForm';
import { FeedingFormValues } from '@/features/farm/schemas/feedingFormSchema';
import { feedingService } from '@/features/farm/services/feeding.service';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { useDevices } from '@/features/control/hooks/useDevices';
// import { deviceApi } from '@/features/control/api/deviceApi';
import { DeviceData } from '@/features/control/types/control.types';

type ScreenRouteProp = RouteProp<AppStackParamList, 'FeedingManagement'>;
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export const FeedingManagementScreens = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId, jobId, itemToEdit } = route.params || {};

    const isEditMode = !!jobId;

    const formRef = useRef<FeedingFormRef>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    // const [isSubmittingControl, setIsSubmittingControl] = useState(false);
    const isSubmittingControl = false; // Tạm thời Fix cứng bằng false do đã comment hàm điều khiển thiết bị

    const { materials, isLoading: isMaterialsLoading } = useFeeding();
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

    const isLoading =
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending ||
        isSubmittingControl ||
        (isDetailLoading && isEditMode);

    const initialData = useMemo(() => {
        if (!isEditMode) return undefined;
        if (detailData?.data) {
            return feedingService.mapDetailToForm(detailData.data, materials);
        }
        if (itemToEdit) {
            return feedingService.mapMetaToForm(itemToEdit, materials);
        }
        return undefined;
    }, [isEditMode, detailData, itemToEdit, materials]);

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

                // ================================================================
                // Ghi chú tạm thời: Code điều khiển thiết bị (Device Control Logic)
                // Anh có thể mở comment đoạn này ra khi Thiết bị ngoài ao đã kết nối & sẵn sàng!
                // ================================================================
                /*
                setIsSubmittingControl(true);
                try {
                    if (feederDevice) {
                        if (formData.mode === 'manual') {
                            await deviceApi.toggleDevice({ deviceId: feederDevice.id });
                        } else if (formData.mode === 'schedule') {
                            const schedulePromises = formData.schedules.map((s) => {
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
                        visibilityTime: 4000,
                    });
                } finally {
                    setIsSubmittingControl(false);
                }
                */

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
        [isEditMode, pondId, jobId, updateMutation, createMutation, navigation /*, feederDevice */]
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
                        navigation.goBack();
                    },
                }
            );
        }
    }, [pondId, jobId, deleteMutation, navigation]);

    const renderHeaderRight = () => {
        if (!isEditMode) return undefined;
        return (
            <TouchableOpacity onPress={handleDelete} style={styles.headerDeleteButton}>
                <DeleteIcon width={20} height={20} color={colors.red[900]} />
            </TouchableOpacity>
        );
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
            />

            <Loading isLoading={isLoading}>
                <View style={styles.contentContainer}>
                    {isDetailLoading && isEditMode ? null : (
                        <SafeInputLayout contentContainerStyle={styles.scrollContent}>
                            <FeedingForm
                                ref={formRef}
                                isEditMode={isEditMode}
                                isLoadingDetail={isDetailLoading && isEditMode}
                                isSubmitting={isLoading}
                                initialData={initialData}
                                materialsList={materials}
                                onSubmit={handleSubmit}
                            />
                        </SafeInputLayout>
                    )}
                </View>
            </Loading>
            <ButtonBarFarm
                primaryTitle={isEditMode ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                secondaryTitle="Huỷ"
                onPrimaryPress={handlePrimaryPress}
                onSecondaryPress={() => navigation.goBack()}
                style={{ borderTopWidth: 1, borderTopColor: colors.border }}
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
    headerDeleteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.red[900],
        backgroundColor: colors.white,
    },
});
