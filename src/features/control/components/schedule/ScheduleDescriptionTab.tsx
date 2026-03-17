import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing } from '@/styles';

interface ScheduleDescriptionTabProps {
    type: 'history' | 'schedule';
}

export const ScheduleDescriptionTab: React.FC<ScheduleDescriptionTabProps> = ({ type }) => {
    return (
        <View style={styles.container}>
            {/* Row 1: Common for both types */}
            <View style={styles.row}>
                <View style={[styles.legendBoxContainer, { flex: 0.5 }]}>
                    <View style={[styles.legendCapsule, { backgroundColor: colors.primary }]} />
                    <Text style={styles.legendText} numberOfLines={1}>
                        {type === 'history' ? 'Đã chạy' : 'Lịch hoạt động'}
                    </Text>
                </View>
                <View style={[styles.legendBoxContainer, { flex: 0.5 }]}>
                    <View style={[styles.legendLine, { backgroundColor: colors.error }]} />
                    <Text style={styles.legendText} numberOfLines={1}>
                        Thời điểm hiện tại
                    </Text>
                </View>
            </View>

            {/* Row 2: Only for History */}
            {type === 'history' && (
                <View style={styles.row}>
                    <View style={styles.legendBoxContainer}>
                        <View
                            style={[
                                styles.legendCapsule,
                                { backgroundColor: colors.schedule.remote },
                            ]}
                        />
                        <Text style={styles.legendText} numberOfLines={1}>
                            Điều khiển từ xa
                        </Text>
                    </View>
                    <View style={styles.legendBoxContainer}>
                        <View
                            style={[
                                styles.legendCapsule,
                                { backgroundColor: colors.schedule.schedule },
                            ]}
                        />
                        <Text style={styles.legendText} numberOfLines={1}>
                            Lịch trình
                        </Text>
                    </View>
                    <View style={styles.legendBoxContainer}>
                        <View
                            style={[
                                styles.legendCapsule,
                                { backgroundColor: colors.schedule.local },
                            ]}
                        />
                        <Text style={styles.legendText} numberOfLines={1}>
                            Điều khiển tại chỗ
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

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
    legendBoxContainer: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gray[200],
        padding: spacing.sm,
        gap: spacing.xs,
        alignItems: 'flex-start',
        justifyContent: 'center',
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
    legendText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});
