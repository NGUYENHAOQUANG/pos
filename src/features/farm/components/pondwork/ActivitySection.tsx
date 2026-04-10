import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { RequiredDot } from '@/shared/components/forms/Input';
import { RadioButton } from '@/shared/components/forms/RadioButton';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';

export interface ActivitySectionProps {
    activityLabel: string;
    activityOptions: string[];
    selectedActivity?: string;
    onSelectActivity: (val: string) => void;
    gap: number;
    itemStyle?: any;
}

export const ActivitySection = ({
    activityLabel,
    activityOptions,
    selectedActivity,
    onSelectActivity,
    gap,
    itemStyle,
}: ActivitySectionProps) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.inputGroup}>
            <View style={styles.labelWrapper}>
                <Text style={styles.label}>{activityLabel}</Text>
                <RequiredDot />
            </View>
            <RadioButton
                options={activityOptions.map(opt => ({ label: opt, value: opt }))}
                value={selectedActivity}
                onValueChange={onSelectActivity}
                containerStyle={styles.radioGroup}
                itemStyle={itemStyle}
                gap={gap}
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        inputGroup: {
            gap: spacing.sm,
        },
        labelWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        label: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
            lineHeight: 22,
        },
        radioGroup: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            columnGap: spacing.sm,
            rowGap: spacing.sm,
        },
    });
