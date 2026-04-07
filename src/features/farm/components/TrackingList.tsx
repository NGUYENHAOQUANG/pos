import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
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

const formatSectionTitle = (dateKey: string): string => {
    // Keep it simple as per mockup (10/01/2026)
    const date = parseDate(dateKey);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export const TrackingDayCard: React.FC<TrackingDayCardProps> = ({
    group,
    style,
    noteOnTop,
    isFirst = false,
}) => {
    const displayDate = formatSectionTitle(group.date);

    const theme = useAppTheme();
    const styles = getStyles(theme);

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

const getStyles = (theme: Colors) =>
    StyleSheet.create({
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
            backgroundColor: theme.background,
            marginTop: 4, // Align with the center of the text roughly
            zIndex: 1,
        },
        timelineDotActive: {
            borderColor: theme.isDark ? theme.white : theme.gray[950],
        },
        timelineDotInactive: {
            borderColor: theme.isDark ? theme.white : theme.gray[950],
        },
        timelineLine: {
            flex: 1,
            width: 1,
            marginTop: 2,
        },
        timelineLineActive: {
            backgroundColor: theme.isDark ? theme.white : theme.gray[950],
        },
        timelineLineInactive: {
            backgroundColor: theme.isDark ? theme.gray[100] : theme.gray[950],
        },
        contentColumn: {
            flex: 1,
            paddingBottom: spacing.lg,
        },
        dateText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.text,
            marginBottom: spacing.sm,
            lineHeight: 20,
        },
        activitiesContainer: {
            gap: 16,
        },
        emptyText: {
            textAlign: 'center',
            color: theme.textSecondary,
            fontStyle: 'italic',
            paddingVertical: 10,
        },
    });
