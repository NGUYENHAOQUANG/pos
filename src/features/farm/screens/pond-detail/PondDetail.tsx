import React from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/styles';
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
import { WorkLogScreens } from '@/features/farm/screens/worklog/WorkLogScreens';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';

interface PondDetailProps {
    pond: PondData | undefined;
    selectedTab: string;
    setSelectedTab: (tab: string) => void;
    isLoading: boolean;
    isRefetchingCycles: boolean;
    refreshing: boolean;
    onRefresh: () => void;
    currentCycle: CycleData | undefined | null;
    filteredJobs: { type: JobType; items: JobExecution[] }[];

    onBack: () => void;
    onGoToPondInfo: () => void;
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
    isRefetchingCycles,
    refreshing,
    onRefresh,
    currentCycle,
    filteredJobs,

    onBack,
    onGoToPondInfo,
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

    return (
        <View style={styles.container}>
            <HeadingFarm
                selectedTab={selectedTab}
                onTabSelect={setSelectedTab}
                tabType="pond-detail"
                fullWidth
                pond={pond}
                onBack={onBack}
                menuOptions={[
                    {
                        value: 'Thông tin ao',
                        onMenuOptionPress: onGoToPondInfo,
                    },
                ]}
            />

            <View style={styles.content}>
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
                    {selectedTab === 'work' ? (
                        <>
                            {isLoading || isRefetchingCycles ? (
                                <PondJobSkeleton />
                            ) : (
                                <>
                                    {currentCycle ? (
                                        <View style={styles.cycleCardWrapper}>
                                            <CycleCard
                                                cycle={currentCycle}
                                                breedName={breedName}
                                                onPress={onEditCycle}
                                            />
                                        </View>
                                    ) : (
                                        <EmptyStateCard
                                            message={
                                                'Ao chưa có chu kỳ nuôi nào.\nThực hiện các công việc được liệt kê bên dưới để chuẩn bị ao trước khi bắt đầu chu kỳ nuôi.'
                                            }
                                            style={styles.emptyCard}
                                        />
                                    )}

                                    <JobListCard
                                        jobs={filteredJobs}
                                        onPressJob={handleJobPress}
                                        onPressAddJob={handleAddJobItem}
                                        onEditJobItem={handleEditJobItem}
                                    />
                                </>
                            )}
                        </>
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
                </ScrollView>
            </View>
            {selectedTab === 'work' &&
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
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
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    placeholderContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    placeholderText: {
        color: colors.text,
    },
    cycleCardWrapper: {
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
        gap: 8,
    },
    emptyCard: {
        marginTop: spacing.lg,
        marginBottom: spacing.lg,
    },
});
