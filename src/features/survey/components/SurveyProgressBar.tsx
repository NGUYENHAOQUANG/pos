import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { borderRadius, spacing } from '@/styles';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export interface SurveyProgressBarProps {
    current: number;
    total: number;
}

export const SurveyProgressBar: React.FC<SurveyProgressBarProps> = ({ current, total }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const progressPercentage = total > 0 ? (current / total) * 100 : 0;

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: withTiming(`${progressPercentage}%`, { duration: 300 }),
        };
    });

    return (
        <View style={styles.container}>
            <View style={styles.barContainer}>
                <Animated.View style={[styles.activeBar, animatedStyle]} />
            </View>
            <Text style={styles.progressText}>
                {current}/{total}
            </Text>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.xl,
            paddingHorizontal: spacing.lg,
        },
        barContainer: {
            flex: 1,
            height: 6,
            backgroundColor: theme.border,
            borderRadius: borderRadius.full,
            overflow: 'hidden',
            marginRight: spacing.md,
        },
        activeBar: {
            height: '100%',
            backgroundColor: theme.primaryOrange,
            borderRadius: borderRadius.full,
        },
        progressText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.textSecondary,
        },
    });
