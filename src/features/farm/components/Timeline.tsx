import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { ActivityCard, ActivityData } from './ActivityCard';

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
    const theme = useAppTheme();
    const styles = getStyles(theme);

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

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flexDirection: 'column',
        },
        timeText: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.textSecondary,
            marginBottom: 8,
        },
    });
