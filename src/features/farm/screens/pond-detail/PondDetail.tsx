import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { IconFarmVector } from '@/assets/icons';
import { RefreshControl } from '@/shared/components/layout/RefreshControl';
import { Text } from '@/shared/components/typography/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Button } from '@/shared/components/buttons/Button';
import { PondData, POND_TYPES } from '@/features/farm/types/farm.types';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { JobExecution } from '@/features/farm/types/farm.types';
import { CycleData } from '@/features/farm/types/cycle.types';
import { HeadingFarm } from '@/features/farm/components/HeadingFarm';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { JobListCard } from '@/features/farm/components/pondwork/JobListCard';
import { CycleCard } from '@/features/farm/components/pond/CycleCard';
import { PondJobSkeleton } from '@/features/farm/components/skeleton/PondJobSkeleton';
import { PondDetailHeaderSkeleton } from '@/features/farm/components/skeleton/PondDetailHeaderSkeleton';
import { WorkLogScreens } from '@/features/farm/screens/worklog/WorkLogScreens';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';

interface PondDetailProps {
    pond: PondData | undefined;
    selectedTab: string;
    setSelectedTab: (tab: string) => void;
    isLoading: boolean;
    isLoadingCycle: boolean;
    isRefetchingCycles: boolean;
    refreshing: boolean;
    onRefresh: () => void;
    currentCycle: CycleData | undefined | null;
    filteredJobs: { type: JobType; items: JobExecution[] }[];

    onBack: () => void;
    onGoToPondInfo: () => void;
    onGoToCycleList: () => void;
    onStartCycle: () => void;
    onEditCycle: () => void;
    breedName: string;
    transferBreedName: string;
    // Job Handlers
    handleJobPress: (jobType: JobType) => void;
    handleAddJobItem: (jobType: JobType) => void;
    handleEditJobItem: (jobType: JobType, item: JobExecution) => void;
    // Measure Size Modal
    isMeasureSizeModalVisible: boolean;
    setIsMeasureSizeModalVisible: (visible: boolean) => void;
    onGoToMeasureSizeScreen: () => void;
    jobs: { type: JobType; items: JobExecution[] }[];
}

export const PondDetail: React.FC<PondDetailProps> = ({
    pond,
    selectedTab,
    setSelectedTab,
    isLoading,
    isLoadingCycle,
    isRefetchingCycles,
    refreshing,
    onRefresh,
    currentCycle,
    filteredJobs,

    onBack,
    onGoToPondInfo,
    onGoToCycleList,
    onStartCycle,
    onEditCycle,
    breedName,
    handleJobPress,
    handleAddJobItem,
    handleEditJobItem,
    isMeasureSizeModalVisible,
    setIsMeasureSizeModalVisible,
    onGoToMeasureSizeScreen,
    jobs,
}) => {
    const insets = useSafeAreaInsets();
    const availableJobTypes = jobs.map(j => j.type);
    const isSettlingPond =
        (typeof pond?.type === 'string' ? pond.type : pond?.type?.name) === POND_TYPES.SETTLING;

    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            {isLoading ? (
                <PondDetailHeaderSkeleton />
            ) : (
                <HeadingFarm
                    selectedTab={selectedTab}
                    onTabSelect={setSelectedTab}
                    tabType="pond-detail"
                    fullWidth
                    pond={pond}
                    onBack={onBack}
                    onInfoPress={onGoToPondInfo}
                    menuOptions={[
                        {
                            value: 'Thông tin ao',
                            onMenuOptionPress: onGoToPondInfo,
                        },
                        {
                            value: 'Các chu kỳ nuôi',
                            onMenuOptionPress: onGoToCycleList,
                        },
                    ]}
                />
            )}

            <View style={styles.content}>
                {selectedTab === 'work' ? (
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['black']}
                            />
                        }
                    >
                        {isLoading || isRefetchingCycles ? (
                            <PondJobSkeleton />
                        ) : (
                            <>
                                {/* Settling pond info card */}
                                {isSettlingPond && (
                                    <View style={styles.settlingCard}>
                                        <IconFarmVector
                                            width={16}
                                            height={16}
                                            color={theme.info}
                                            style={styles.settlingIcon}
                                        />
                                        <Text style={styles.settlingText}>
                                            Ao không có chu kỳ nuôi. Ao này hiện chưa có dữ liệu chu
                                            kỳ nuôi. Bạn chưa thiết lập chu kỳ nuôi cho ao này.
                                        </Text>
                                    </View>
                                )}

                                {!isSettlingPond && currentCycle ? (
                                    <View style={styles.cycleCardWrapper}>
                                        <CycleCard
                                            cycle={currentCycle}
                                            breedName={breedName}
                                            onPress={onEditCycle}
                                        />
                                    </View>
                                ) : !isSettlingPond ? (
                                    <EmptyStateCard
                                        message={
                                            'Ao chưa có chu kỳ nuôi nào.\nThực hiện các công việc được liệt kê bên dưới để chuẩn bị ao trước khi bắt đầu chu kỳ nuôi.'
                                        }
                                        style={styles.emptyCard}
                                    />
                                ) : null}

                                <JobListCard
                                    jobs={filteredJobs}
                                    onPressJob={handleJobPress}
                                    onPressAddJob={handleAddJobItem}
                                    onEditJobItem={handleEditJobItem}
                                />
                            </>
                        )}
                    </ScrollView>
                ) : selectedTab === 'log' ? (
                    <WorkLogScreens
                        pond={pond}
                        onEditJobItem={handleEditJobItem}
                        availableJobTypes={availableJobTypes}
                    />
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Text style={styles.placeholderText}>
                            Nhật ký công việc chưa có dữ liệu
                        </Text>
                    </View>
                )}
            </View>
            {selectedTab === 'work' &&
                !isLoading &&
                !isLoadingCycle &&
                !currentCycle &&
                (typeof pond?.type === 'string' ? pond.type : pond?.type?.name) ===
                    POND_TYPES.NURSERY && (
                    <View
                        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
                    >
                        <Button
                            title="Bắt đầu chu kỳ nuôi"
                            onPress={onStartCycle}
                            iconLeft="add"
                            fullWidth
                        />
                    </View>
                )}

            <ConfirmationModal
                visible={isMeasureSizeModalVisible}
                type="measure_size_required"
                onCancel={() => setIsMeasureSizeModalVisible(false)}
                onConfirm={onGoToMeasureSizeScreen}
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        content: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 100,
            flexGrow: 1,
        },
        footer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: spacing.md,
            paddingBottom: 32,
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
        },
        placeholderContainer: {
            padding: spacing.xl,
            alignItems: 'center',
        },
        placeholderText: {
            color: theme.text,
        },
        cycleCardWrapper: {
            marginHorizontal: 16,
        },
        emptyCard: {
            marginTop: spacing.lg,
            marginBottom: spacing.lg,
        },
        settlingCard: {
            marginHorizontal: 16,
            marginTop: 0,
            padding: 8,
            backgroundColor: theme.background,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        settlingIcon: {
            marginHorizontal: 4,
            marginRight: 8,
            marginTop: 1,
        },
        settlingText: {
            flex: 1,
            fontSize: 14,
            fontWeight: '400',
            color: theme.textSecondary,
        },
    });
