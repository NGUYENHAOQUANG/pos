import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { ActivityCard, ActivityData } from './ActivityCard';

interface TimelineEntryProps {
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
        <View style={styles.container}>
            <Text style={styles.timeText}>{time}</Text>
            <ActivityCard
                title={title}
                data={data}
                onEdit={onEdit}
                note={note}
                noteOnTop={noteOnTop}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
    },
    timeText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textSecondary,
        marginBottom: 8,
    },
});
