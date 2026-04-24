import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { JobCard, JobType } from '@/features/farm/components/pondwork/JobItem';
import { JobExecution } from '@/features/farm/types/farm.types';
import { OnboardingStep } from '@/features/walkthrough/components/OnboardingStep';
import { AppStepKey } from '@/features/walkthrough/constants/onboarding';
import { triggerOnboardingStep } from '@/features/walkthrough/store/useOnboardingStore';

/** Map JobType to its corresponding OnboardingStep key */
const JOB_ONBOARDING_MAP: Partial<Record<JobType, AppStepKey>> = {
    FEED: 'FEEDING_JOB',
    TRANSFER_POND: 'TRANSFER_POND_JOB',
};

interface JobData {
    type: JobType;
    title?: string;
    data?: string;
    items?: JobExecution[];
    isLoading?: boolean;
}

interface JobListCardProps {
    jobs: JobData[];
    onPressJob?: (type: JobType) => void;
    onPressAddJob?: (type: JobType) => void;
    onEditJobItem?: (type: JobType, item: JobExecution) => void;
}

export const JobListCard: React.FC<JobListCardProps> = ({
    jobs,
    onPressJob,
    onPressAddJob,
    onEditJobItem,
}) => {
    const displayDateLabel = `Hôm nay, ${new Date().toLocaleDateString('vi-VN')}`;

    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            {/* Date Header standalone */}
            <Text style={styles.dateHeader}>{displayDateLabel}</Text>

            {/* Job List */}
            <View style={styles.listContainer}>
                {jobs.map((job, index) => {
                    const card = (
                        <JobCard
                            key={index}
                            type={job.type}
                            title={job.title}
                            data={job.data}
                            items={job.items}
                            isLoading={job.isLoading}
                            onPress={() => onPressJob?.(job.type)}
                            onPressAdd={() => {
                                onPressAddJob?.(job.type);
                                if (['FEED', 'TRANSFER_POND'].includes(job.type)) {
                                    triggerOnboardingStep('farm');
                                }
                            }}
                            onEditItem={item => onEditJobItem?.(job.type, item)}
                        />
                    );

                    const onboardingStep = JOB_ONBOARDING_MAP[job.type];
                    if (onboardingStep) {
                        return (
                            <OnboardingStep
                                key={index}
                                step={onboardingStep}
                                onNext={
                                    // FEED and TRANSFER_POND navigates to Form for next steps
                                    job.type === 'FEED' || job.type === 'TRANSFER_POND'
                                        ? () => onPressAddJob?.(job.type)
                                        : undefined
                                }
                            >
                                <View collapsable={false} style={{ width: '100%' }}>
                                    {card}
                                </View>
                            </OnboardingStep>
                        );
                    }

                    return card;
                })}
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {},
        listContainer: {
            paddingTop: spacing.sm,
            paddingHorizontal: 16,
        },
        dateHeader: {
            fontSize: 15,
            fontWeight: '500',
            color: theme.text,
            paddingHorizontal: spacing.md,
            marginTop: spacing.md,
            marginBottom: spacing.xs,
        },
    });
