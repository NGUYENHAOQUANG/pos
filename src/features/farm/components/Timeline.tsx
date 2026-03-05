import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { ActivityCard, ActivityData } from './ActivityCard';
import { spacing } from '@/styles';

export interface TimelineEntryProps {
    time: string;
    title: string;
    data: ActivityData[];
    onEdit?: () => void;
    note?: string;
    noteOnTop?: boolean;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({
    time,
    title,
    data,
    onEdit,
    note,
    noteOnTop,
}) => {
    return (
        <View style={styles.row}>
            {/* Cột timeline bên trái */}
            <View style={styles.timelineGraphic}>
                <View style={styles.line} />
            </View>

            {/* Nội dung Card bên phải */}
            <View style={styles.contentColumn}>
                <Text style={styles.timeText}>{time}</Text>
                <ActivityCard
                    title={title}
                    data={data}
                    onEdit={onEdit}
                    note={note}
                    noteOnTop={noteOnTop}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    timelineGraphic: {
        alignItems: 'center',
        alignSelf: 'stretch',
        position: 'relative',
        width: 13,
    },
    line: {
        position: 'absolute',
        width: 1,
        top: 0,
        bottom: 0,
        backgroundColor: colors.borderDark,
    },
    contentColumn: {
        flex: 1,
        paddingBottom: 24,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: 8,
    },
});
