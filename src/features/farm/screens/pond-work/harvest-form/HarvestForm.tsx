import React, { useEffect, useState } from 'react';
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
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import {
    HarvestFormData,
    harvestFormSchema,
    getHarvestTypeDisplay,
} from '@/features/farm/schemas/harvestFormSchema';
import { handleHarvestFormError } from '@/features/farm/utils/toastMessages';

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
    onSubmitForm: (data: HarvestFormData) => void;
    onDelete?: () => void;
    onBack: () => void;
    onCancel: () => void;
}

export const HarvestForm: React.FC<HarvestFormProps> = ({
    initialData,
    initialDate,
    isEditMode,
    isSubmitting,
    onSubmitForm,
    onDelete,
    onBack,
    onCancel,
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { isDirty },
    } = useForm<HarvestFormData>({
        resolver: zodResolver(harvestFormSchema),
        defaultValues: initialData,
    });

    // Reset form when initialData changes (useful when detail query is fetched)
    useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);

    const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
    const [selectedTab, setSelectedTab] = useState<HarvestFormTab>(HarvestFormTab.OVERVIEW);
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const { UnsavedChangesModal, allowNavigation } = useUnsavedChanges(isDirty);

    const watchedHarvestType = watch('harvestType');
    const harvestTypeDisplay = getHarvestTypeDisplay(watchedHarvestType);
    const harvestTypeOptions = ['Thu hết', 'Thu tỉa'];

    const handleSavePress = () => {
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

    return (
        <View style={styles.container}>
            <HeaderSection
                title="Thu hoạch"
                onBack={onBack}
                rightComponent={
                    isEditMode ? <DeleteButton onPress={handleDeletePress} /> : undefined
                }
            />

            <View style={styles.headingBarContainer}>
                <HeadingBar
                    tabs={[
                        { key: HarvestFormTab.OVERVIEW, label: 'Tổng quan' },
                        { key: HarvestFormTab.SCALE, label: 'Cân điện tử' },
                        { key: HarvestFormTab.HISTORY, label: 'Lịch sử cân' },
                    ]}
                    selectedTab={selectedTab}
                    onTabSelect={key => setSelectedTab(key as HarvestFormTab)}
                    spreadTabs
                />
            </View>

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
            {selectedTab === HarvestFormTab.SCALE && (
                <HarvestScaleTab
                    onNavigateToHistory={() => setSelectedTab(HarvestFormTab.HISTORY)}
                    onNavigateToAllScales={() => navigation.navigate('ScaleListScreen')}
                />
            )}
            {selectedTab === HarvestFormTab.HISTORY && <HarvestHistoryTab />}

            {/* Confirmation Modal for full harvest */}
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
