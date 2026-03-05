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
}

const formatSectionTitle = (dateKey: string): string => {
    // Keep it simple as per mockup (10/01/2026)
    const date = parseDate(dateKey);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export const TrackingDayCard: React.FC<TrackingDayCardProps> = ({ group, style, noteOnTop }) => {
    const displayDate = formatSectionTitle(group.date);

    return (
        <View style={[style, styles.dayContainer]}>
            {/* Header Ngày */}
            <View style={styles.dayHeader}>
                <View style={styles.dayDotContainer}>
                    <View style={styles.dayDot} />
                    <View style={styles.dayDotLine} />
                </View>
                <Text style={styles.dayTitleText}>{displayDate}</Text>
            </View>

            {/* Body: Timeline List */}
            <View style={styles.cardBody}>
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
    );
};

const styles = StyleSheet.create({
    dayContainer: {
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: 8,
    },
    dayDotContainer: {
        width: 13,
        alignItems: 'center',
        position: 'relative',
        height: 24,
        justifyContent: 'center',
    },
    dayDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.text,
        backgroundColor: colors.white,
        zIndex: 2,
    },
    dayDotLine: {
        position: 'absolute',
        top: 12, // start inside the dot
        bottom: -8, // extend slightly below
        width: 1,
        backgroundColor: colors.borderDark,
        zIndex: 1,
    },
    dayTitleText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    cardBody: {
        // No padding left here, TimelineEntry already has gap
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontStyle: 'italic',
        padding: 10,
    },
});
