import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '@/styles';
import { TimelineEntry } from './Timeline';
import { ActivityData } from './ActivityCard';
import { parseDate } from '@/features/farm/utils/dateUtils';

// --- Interface ---
export interface TimelineActivity {
    id: string;
    time: string;
    title: string;
    data: ActivityData[];
    note?: string;
    onEdit?: () => void;
}

export interface TrackingGroup {
    id: string;
    date: string;
    activities: TimelineActivity[];
}

interface TrackingDayCardProps {
    group: TrackingGroup;
    style?: any;
    noteOnTop?: boolean;
    isFirst?: boolean;
}

const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

const formatSectionTitle = (dateKey: string): string => {
    const date = parseDate(dateKey);
    if (isToday(date)) {
        return `Hôm nay, ${dateKey}`;
    }
    return dateKey;
};

export const TrackingDayCard: React.FC<TrackingDayCardProps> = ({
    group,
    style,
    noteOnTop,
    isFirst = false,
}) => {
    const displayDate = formatSectionTitle(group.date);

    return (
        <View style={[styles.container, style]}>
            {/* Timeline column */}
            <View style={styles.timelineColumn}>
                <View
                    style={[
                        styles.timelineDot,
                        isFirst ? styles.timelineDotActive : styles.timelineDotInactive,
                    ]}
                />
                <View
                    style={[
                        styles.timelineLine,
                        isFirst ? styles.timelineLineActive : styles.timelineLineInactive,
                    ]}
                />
            </View>

            {/* Content column */}
            <View style={styles.contentColumn}>
                <Text style={styles.dateText}>{displayDate}</Text>

                <View style={styles.activitiesContainer}>
                    {group.activities.map(activity => (
                        <TimelineEntry
                            key={activity.id}
                            time={activity.time}
                            title={activity.title}
                            data={activity.data}
                            note={activity.note}
                            noteOnTop={noteOnTop}
                            onEdit={activity.onEdit}
                        />
                    ))}

                    {group.activities.length === 0 && (
                        <Text style={styles.emptyText}>Không có hoạt động</Text>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
    },
    timelineColumn: {
        width: 24,
        alignItems: 'center',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        backgroundColor: colors.white,
        marginTop: 4, // Align with the center of the text roughly
        zIndex: 1,
    },
    timelineDotActive: {
        borderColor: colors.gray[950],
    },
    timelineDotInactive: {
        borderColor: colors.black,
    },
    timelineLine: {
        flex: 1,
        width: 1,
        marginTop: 2,
    },
    timelineLineActive: {
        backgroundColor: colors.gray[950],
    },
    timelineLineInactive: {
        backgroundColor: colors.gray[950],
    },
    contentColumn: {
        flex: 1,
        paddingBottom: spacing.lg,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
        lineHeight: 20,
    },
    activitiesContainer: {
        gap: 16,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontStyle: 'italic',
        paddingVertical: 10,
    },
});
