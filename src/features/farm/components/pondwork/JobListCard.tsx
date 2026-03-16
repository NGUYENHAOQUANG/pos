import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing } from '@/styles';
import { JobCard, JobType } from '@/features/farm/components/pondwork/JobItem';
import { JobExecution } from '@/features/farm/types/farm.types';

interface JobData {
    type: JobType;
    title?: string;
    data?: string;
    items?: JobExecution[];
}

interface JobListCardProps {
    jobs: JobData[];
    onPressJob?: (type: JobType) => void;
    onPressAddJob?: (type: JobType) => void;
    onEditJobItem?: (type: JobType, item: JobExecution) => void;
}

/**
 * Container component that wraps multiple JobCards in a white card
 * with optional date header inside the card
 */
export const JobListCard: React.FC<JobListCardProps> = ({
    jobs,
    onPressJob,
    onPressAddJob,
    onEditJobItem,
}) => {
    const displayDateLabel = `Hôm nay, ${new Date().toLocaleDateString('vi-VN')}`;

    return (
        <View style={styles.container}>
            {/* Date Header standalone */}
            <Text style={styles.dateHeader}>{displayDateLabel}</Text>

            {/* Job List */}
            <View style={styles.listContainer}>
                {jobs.map((job, index) => (
                    <JobCard
                        key={index}
                        type={job.type}
                        title={job.title}
                        data={job.data}
                        items={job.items}
                        onPress={() => onPressJob?.(job.type)}
                        onPressAdd={() => onPressAddJob?.(job.type)}
                        onEditItem={item => onEditJobItem?.(job.type, item)}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // Removed white background to show individual job cards directly on screen background
    },
    listContainer: {
        paddingTop: spacing.sm,
        paddingHorizontal: 16,
    },
    dateHeader: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text,
        paddingHorizontal: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
});
