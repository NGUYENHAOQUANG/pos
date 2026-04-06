import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

interface ScheduleDescriptionTabProps {
    type: 'history' | 'schedule';
}

export const ScheduleDescriptionTab: React.FC<ScheduleDescriptionTabProps> = ({ type }) => {
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);

    return (
        <View style={styles.container}>
            {/* Row 1: Common for both types */}
            <View style={styles.row}>
                <View style={[themedStyles.legendBoxContainer, { flex: 0.5 }]}>
                    <View style={[styles.legendCapsule, { backgroundColor: theme.primary }]} />
                    <Text style={themedStyles.legendText} numberOfLines={1}>
                        {type === 'history' ? 'Đã chạy' : 'Lịch hoạt động'}
                    </Text>
                </View>
                <View style={[themedStyles.legendBoxContainer, { flex: 0.5 }]}>
                    <View style={[styles.legendLine, { backgroundColor: theme.error }]} />
                    <Text style={themedStyles.legendText} numberOfLines={1}>
                        Thời điểm hiện tại
                    </Text>
                </View>
            </View>

            {/* Row 2: Only for History */}
            {type === 'history' && (
                <View style={styles.row}>
                    <View style={themedStyles.legendBoxContainer}>
                        <View
                            style={[
                                styles.legendCapsule,
                                { backgroundColor: theme.schedule.remote },
                            ]}
                        />
                        <Text style={themedStyles.legendText} numberOfLines={1}>
                            Điều khiển từ xa
                        </Text>
                    </View>
                    <View style={themedStyles.legendBoxContainer}>
                        <View
                            style={[
                                styles.legendCapsule,
                                { backgroundColor: theme.schedule.schedule },
                            ]}
                        />
                        <Text style={themedStyles.legendText} numberOfLines={1}>
                            Lịch trình
                        </Text>
                    </View>
                    <View style={themedStyles.legendBoxContainer}>
                        <View
                            style={[
                                styles.legendCapsule,
                                { backgroundColor: theme.schedule.local },
                            ]}
                        />
                        <Text style={themedStyles.legendText} numberOfLines={1}>
                            Điều khiển tại chỗ
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

// Static styles
const styles = StyleSheet.create({
    container: {
        paddingTop: spacing.sm,
        paddingBottom: 0,
        gap: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    legendCapsule: {
        width: 16,
        height: 8,
        borderRadius: 999,
    },
    legendLine: {
        width: 24,
        height: 1,
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        legendBoxContainer: {
            flex: 1,
            backgroundColor: theme.background,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
            padding: spacing.sm,
            gap: spacing.xs,
            alignItems: 'flex-start',
            justifyContent: 'center',
        },
        legendText: {
            fontSize: 12,
            color: theme.textSecondary,
        },
    });
