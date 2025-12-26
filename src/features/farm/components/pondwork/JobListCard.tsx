import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';
import { JobCard, JobType, JobExecution } from './JobItem';

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
    const displayDateLabel = `Hôm nay, ${new Date().toLocaleDateString('en-GB')}`;

    return (
        <View style={styles.container}>
            {/* Date Header inside card */}
            <Text style={styles.dateHeader}>{displayDateLabel}</Text>
            <View style={styles.headerDivider} />

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
        backgroundColor: colors.white,
    },
    listContainer: {
        padding: spacing.md,
    },
    dateHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    headerDivider: {
        height: 1,
        backgroundColor: colors.borderLight,
        width: '100%',
    },
});
