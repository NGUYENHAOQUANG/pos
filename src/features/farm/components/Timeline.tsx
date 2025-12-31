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
        <View style={styles.row}>
            {/* Cột thời gian bên trái */}
            <View style={styles.textBox}>
                <Text style={styles.timeText}>{time}</Text>
            </View>

            <View style={styles.timelineGraphic}>
                <View style={styles.dot} />
                <View style={styles.line} />
            </View>
            {/* Nội dung Card bên phải */}
            <View style={styles.contentColumn}>
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
        gap: 8,
    },
    textBox: {
        width: 48,
        height: 46,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
    },
    timelineGraphic: {
        alignItems: 'center',
        alignSelf: 'stretch',
        position: 'relative',
        width: 13,
    },
    dot: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: colors.borderSubtle,
        backgroundColor: colors.white,
        top: 4,
        zIndex: 1,
    },
    line: {
        position: 'absolute',
        width: 2,
        top: 0,
        bottom: 0,
        backgroundColor: colors.borderLight,
    },
    contentColumn: {
        flex: 1,
        paddingBottom: 16,
    },
});
