import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

interface TimeProps {
    startTime?: string;
    endTime?: string;
}

export const Time: React.FC<TimeProps> = ({ startTime = '00:00', endTime = '00:00' }) => {
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);

    return (
        <View style={styles.container}>
            <Text style={themedStyles.timeText}>{startTime}</Text>
            <Text style={themedStyles.timeText}>{endTime}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingVertical: spacing.xs,
    },
});

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        timeText: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.text,
            lineHeight: 22,
        },
    });
