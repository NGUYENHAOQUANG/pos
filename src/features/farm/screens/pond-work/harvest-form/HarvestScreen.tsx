import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import {
    getHarvestSuccessMessage,
    showEditJobSuccessToast,
    AppToast,
    TOAST_MESSAGES_CONFIG,
} from '@/features/farm/utils/toastMessages';
import {
    useCreateHarvestRecord,
    useUpdateHarvestRecord,
    useDeleteHarvestRecord,
    useHarvestRecord,
} from '@/features/farm/hooks/useHarvestRecord';
import { useStartScaleSession } from '@/features/farm/hooks/useScaleRecord';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { harvestService } from '@/features/farm/services/pond-work/harvest.service';
import { HarvestFormData, getHarvestTypeDisplay } from '@/features/farm/schemas/harvestFormSchema';
import { HarvestForm } from '@/features/farm/screens/pond-work/harvest-form/HarvestForm';
import { useScaleStore } from '@/features/farm/store/scaleStore';
import { HarvestScaleMode } from '@/features/farm/types/harvestRecord.types';
import { usePondDetail } from '@/features/farm/hooks/usePonds';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'HarvestFormScreen'>;

export const HarvestFormScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId, cycleId, harvestRecordId, scaleMode } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();

    const { data: recordData, isLoading: isLoadingRecord } = useHarvestRecord(
        pondId || '',
        harvestRecordId || ''
    );
    const recordDetail = recordData?.data;

    const createHarvestMutation = useCreateHarvestRecord();
    const updateHarvestMutation = useUpdateHarvestRecord();
    const deleteHarvestMutation = useDeleteHarvestRecord();
    const { mutate: startSession } = useStartScaleSession();

    const { scaleSessionId, setScaleSessionId, selectedZoneId } = useFarmStore(state => ({
        scaleSessionId: cycleId ? state.scaleSessions[cycleId]?.sessionId : undefined,
        setScaleSessionId: state.setScaleSessionId,
        selectedZoneId: state.selectedZoneId,
    }));

    const { data: pondDetail } = usePondDetail(selectedZoneId || '', pondId || '');
    const pondName = pondDetail?.name;

    const isEditMode = !!harvestRecordId;
    const isSubmitting =
        createHarvestMutation.isPending ||
        updateHarvestMutation.isPending ||
        deleteHarvestMutation.isPending;

    const clearManualRecords = useScaleStore(state => state.clearManualRecords);
    const sessionInitialized = useRef(false);

    useEffect(() => {
        setTabBarVisible(false);
        return () => clearManualRecords();
    }, [setTabBarVisible, clearManualRecords]);

    useEffect(() => {
        if (sessionInitialized.current) return;

        if (!isEditMode && scaleMode !== HarvestScaleMode.MANUAL) {
            sessionInitialized.current = true;
            if (scaleSessionId) {
                AppToast({
                    ...TOAST_MESSAGES_CONFIG.SCALE.ACTIVE_SESSION,
                    visibilityTime: 4000,
                    type: 'success',
                });
            } else if (cycleId) {
                startSession(
                    { cycleId },
                    {
                        onSuccess: response => {
                            if (response.success && response.data?.sessionId) {
                                setScaleSessionId(cycleId, response.data.sessionId);
                            }
                        },
                        onError: (error: any) => {
                            const errorData = error?.data;
                            if (
                                error?.statusCode === 409 ||
                                errorData?.errorCode === 'ALREADY_EXISTS'
                            ) {
                                if (errorData?.data?.sessionId) {
                                    setScaleSessionId(cycleId, errorData.data.sessionId);
                                }
                            }
                        },
                    }
                );
            }
        }
    }, [cycleId, isEditMode, scaleMode, scaleSessionId, setScaleSessionId, startSession]);

    const initialData = useMemo(() => {
        return harvestService.mapRecordToForm(recordDetail);
    }, [recordDetail]);

    const initialDate = useMemo(() => {
        if (recordDetail?.createdAt) {
            return new Date(recordDetail.createdAt);
        }
        return new Date();
    }, [recordDetail]);

    const handleBack = () => {
        clearManualRecords();
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleCancel = () => {
        clearManualRecords();
        navigation.goBack();
    };

    const handleDelete = async () => {
        if (!pondId || !harvestRecordId) return;

        await deleteHarvestMutation.mutateAsync({
            pondId,
            id: harvestRecordId,
        });

        setTimeout(() => navigation.goBack(), 300);
    };

    const handleSubmitData = async (data: HarvestFormData) => {
        if (!pondId) return;

        const apiRequest = harvestService.mapFormToPayload(data, scaleSessionId);

        try {
            if (isEditMode && harvestRecordId) {
                await updateHarvestMutation.mutateAsync({
                    pondId,
                    id: harvestRecordId,
                    data: apiRequest,
                });
                showEditJobSuccessToast('HARVEST' as JobType);
            } else {
                await createHarvestMutation.mutateAsync({
                    pondId,
                    data: apiRequest,
                });

                Toast.show({
                    type: 'success',
                    text1: getHarvestSuccessMessage(getHarvestTypeDisplay(data.harvestType)),
                    visibilityTime: 5000,
                });
                if (cycleId) {
                    setScaleSessionId(cycleId, null);
                }
            }
            clearManualRecords();
            navigation.goBack();
        } catch (_error) {}
    };

    return (
        <HarvestForm
            initialData={initialData}
            initialDate={initialDate}
            isEditMode={isEditMode}
            isSubmitting={isSubmitting || (isEditMode && isLoadingRecord)}
            isLoading={isEditMode && isLoadingRecord}
            onSubmitForm={handleSubmitData}
            onDelete={harvestRecordId ? handleDelete : undefined}
            onBack={handleBack}
            onCancel={handleCancel}
            cycleId={cycleId}
            scaleMode={scaleMode}
            recordId={harvestRecordId}
            pondId={pondId}
            pondName={pondName}
        />
    );
};
