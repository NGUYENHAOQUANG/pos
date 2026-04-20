import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { HeadingBar } from '@/shared/components/layout/HeadingBar';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { HarvestOverviewTab } from '@/features/farm/components/pondwork/harvest/HarvestOverviewTab';
import { HarvestScaleTab } from '@/features/farm/components/pondwork/harvest/HarvestScaleTab';
import { HarvestHistoryTab } from '@/features/farm/components/pondwork/harvest/HarvestHistoryTab';
import { WaterTreatmentSkeleton } from '@/features/farm/components/skeleton/WaterTreatmentSkeleton';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import {
    HarvestFormData,
    harvestFormSchema,
    getHarvestTypeDisplay,
} from '@/features/farm/schemas/harvestFormSchema';
import {
    handleHarvestFormError,
    AppToast,
    TOAST_MESSAGES_CONFIG,
} from '@/features/farm/utils/toastMessages';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useScaleRecords } from '@/features/farm/hooks/useScaleRecord';
import { useScaleStore } from '@/features/farm/store/scaleStore';
import { HarvestScaleMode, ScaleSessionAction } from '@/features/farm/types/harvestRecord.types';
import { InputFilters } from '@/shared/regex';

export enum HarvestFormTab {
    OVERVIEW = 'overview',
    SCALE = 'scale',
    HISTORY = 'history',
}

export interface HarvestFormProps {
    initialData: HarvestFormData;
    initialDate: Date;
    isEditMode: boolean;
    isSubmitting: boolean;
    isLoading?: boolean;
    onSubmitForm: (data: HarvestFormData) => void;
    onDelete?: () => void;
    onBack: () => void;
    onCancel: () => void;
    cycleId?: string;
    scaleMode?: HarvestScaleMode;
    recordId?: string;
    pondId?: string;
    pondName?: string;
}

export const HarvestForm: React.FC<HarvestFormProps> = ({
    initialData,
    initialDate,
    isEditMode,
    isSubmitting,
    isLoading,
    onSubmitForm,
    onDelete,
    onBack,
    onCancel,
    cycleId,
    scaleMode,
    recordId,
    pondId,
    pondName,
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { isDirty },
    } = useForm<HarvestFormData>({
        resolver: zodResolver(harvestFormSchema),
        defaultValues: initialData,
    });

    useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);

    const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
    const [selectedTab, setSelectedTab] = useState<HarvestFormTab>(HarvestFormTab.OVERVIEW);
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const scaleSessionCtx = useFarmStore(state =>
        cycleId ? state.scaleSessions[cycleId] : undefined
    );
    const scaleSessionId = scaleSessionCtx?.sessionId;
    const setScaleSessionId = useFarmStore(state => state.setScaleSessionId);

    const [delayedLoading, setDelayedLoading] = useState(isLoading);

    useEffect(() => {
        if (isLoading) {
            setDelayedLoading(true);
        } else if (delayedLoading) {
            const timer = setTimeout(() => {
                setDelayedLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, delayedLoading]);

    const { data: recordsData } = useScaleRecords({
        SessionId:
            !isEditMode && scaleMode !== HarvestScaleMode.MANUAL ? scaleSessionId : undefined,
        RecordId: isEditMode ? recordId : undefined,
    });
    const apiEntries = useMemo(() => recordsData?.data?.items || [], [recordsData?.data?.items]);
    const manualRecords = useScaleStore(state => state.manualRecords);

    const currentScaleMode = useMemo(() => {
        if (isEditMode) {
            return apiEntries.length === 0 ? HarvestScaleMode.MANUAL : HarvestScaleMode.AUTO;
        }
        return scaleMode;
    }, [isEditMode, apiEntries.length, scaleMode]);

    useEffect(() => {
        if (isEditMode) return;

        let weight = 0;
        if (currentScaleMode === HarvestScaleMode.MANUAL) {
            weight = manualRecords.reduce((sum, r) => sum + (r.weight || 0), 0);
        } else {
            const validEntries = apiEntries.filter(e => e.status?.toLowerCase() !== 'deleted');
            weight = validEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
        }

        let formattedWeight = '';
        if (weight > 0) {
            formattedWeight = InputFilters.decimal(String(Number(weight.toFixed(5))), 5, 15);
        }

        setValue('totalWeightKg', formattedWeight, { shouldValidate: true, shouldDirty: true });
    }, [currentScaleMode, apiEntries, manualRecords, setValue, isEditMode]);

    const hasActiveSession = scaleMode === HarvestScaleMode.MANUAL ? false : !!scaleSessionId;
    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(isDirty || hasActiveSession);

    const watchedHarvestType = watch('harvestType');
    const harvestTypeDisplay = getHarvestTypeDisplay(watchedHarvestType);
    const harvestTypeOptions = ['Thu hết', 'Thu tỉa'];

    const handleSavePress = () => {
        if (
            scaleMode !== HarvestScaleMode.MANUAL &&
            scaleSessionCtx?.status !== ScaleSessionAction.FINISH
        ) {
            AppToast(TOAST_MESSAGES_CONFIG.SCALE.NOT_FINISHED as any);
            return;
        }

        if (harvestTypeDisplay === 'Thu hết' && !isEditMode) {
            // Validate first, then show confirmation modal
            handleSubmit(() => {
                setIsConfirmationModalVisible(true);
            }, handleHarvestFormError)();
        } else {
            allowNavigation();
            handleSubmit(onSubmitForm, handleHarvestFormError)();
        }
    };

    const handleConfirmSave = () => {
        setIsConfirmationModalVisible(false);
        allowNavigation();
        handleSubmit(onSubmitForm, handleHarvestFormError)();
    };

    const handleCancelConfirmation = () => {
        setIsConfirmationModalVisible(false);
    };

    const handleDeletePress = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        setDeleteModalVisible(false);
        allowNavigation();
        onDelete?.();
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
    };

    const handleNavigateToHistory = useCallback(() => {
        setSelectedTab(HarvestFormTab.HISTORY);
    }, []);

    const handleNavigateToAllScales = useCallback(() => {
        if (!cycleId) return;
        navigation.navigate('ScaleListScreen', { cycleId, pondId });
    }, [navigation, cycleId, pondId]);

    const handleSetScaleSessionId = useCallback(
        (id: string | null, action?: ScaleSessionAction) => {
            if (!cycleId) return;

            if (action === ScaleSessionAction.DELETE) {
                setScaleSessionId(cycleId, null);
            } else if (action === ScaleSessionAction.FINISH) {
                if (id) {
                    setScaleSessionId(cycleId, id, action);
                } else if (scaleSessionId) {
                    setScaleSessionId(cycleId, scaleSessionId, action);
                }
            } else {
                setScaleSessionId(cycleId, id, ScaleSessionAction.ACTIVE);
            }
        },
        [cycleId, scaleSessionId, setScaleSessionId]
    );

    const tabs = useMemo(() => {
        const baseTabs = [{ key: HarvestFormTab.OVERVIEW, label: 'Tổng quan' }];

        if (currentScaleMode !== HarvestScaleMode.MANUAL && !isEditMode) {
            baseTabs.push({ key: HarvestFormTab.SCALE, label: 'Cân điện tử' });
        }

        if (!isEditMode || currentScaleMode !== HarvestScaleMode.MANUAL) {
            baseTabs.push({ key: HarvestFormTab.HISTORY, label: 'Lịch sử cân' });
        }

        return baseTabs;
    }, [currentScaleMode, isEditMode]);

    return (
        <View style={styles.container}>
            <HeaderSection
                title="Thu hoạch"
                onBack={onBack}
                rightComponent={
                    isEditMode ? <DeleteButton onPress={handleDeletePress} /> : undefined
                }
            />

            {delayedLoading ? (
                <WaterTreatmentSkeleton />
            ) : (
                <>
                    {tabs.length > 1 && (
                        <View style={styles.headingBarContainer}>
                            <HeadingBar
                                tabs={tabs}
                                selectedTab={selectedTab}
                                onTabSelect={key => setSelectedTab(key as HarvestFormTab)}
                            />
                        </View>
                    )}

                    {/* Content Tabs */}
                    {selectedTab === HarvestFormTab.OVERVIEW && (
                        <HarvestOverviewTab
                            control={control}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            harvestTypeOptions={harvestTypeOptions}
                            isEditMode={isEditMode}
                            isSubmitting={isSubmitting}
                            isDirty={isDirty}
                            harvestTypeDisplay={harvestTypeDisplay}
                            onSavePress={handleSavePress}
                            onCancel={onCancel}
                        />
                    )}
                    {selectedTab === HarvestFormTab.SCALE &&
                        currentScaleMode !== HarvestScaleMode.MANUAL &&
                        !isEditMode && (
                            <HarvestScaleTab
                                onNavigateToHistory={handleNavigateToHistory}
                                onNavigateToAllScales={handleNavigateToAllScales}
                                cycleId={cycleId}
                                scaleSessionId={scaleSessionId}
                                recordId={recordId}
                                isEditMode={isEditMode}
                                onSetScaleSessionId={handleSetScaleSessionId}
                                pondName={pondName}
                            />
                        )}
                    {selectedTab === HarvestFormTab.HISTORY && (
                        <HarvestHistoryTab
                            scaleMode={currentScaleMode}
                            scaleSessionId={scaleSessionId}
                            recordId={recordId}
                            isEditMode={isEditMode}
                        />
                    )}
                </>
            )}

            <ConfirmationModalUI
                visible={isConfirmationModalVisible}
                onConfirm={handleConfirmSave}
                onCancel={handleCancelConfirmation}
                title="Xác nhận thu hoạch hết"
                message={`Việc thu hoạch hết sẽ kết thúc chu kỳ nuôi hiện tại và không thể hoàn tác.\nBạn có chắc chắn muốn thu hoạch hết không?`}
                confirmText="Thu hết"
                cancelText="Không"
                showSuccessToast={false}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModalUI
                visible={deleteModalVisible}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
            {UnsavedChangesModal}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        headingBarContainer: {
            paddingTop: 8,
            paddingBottom: 12,
        },
    });
