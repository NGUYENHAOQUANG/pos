import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { colors } from '@/styles';

/**
 * Skeleton loading placeholder for CustomFeedingMachineScreen.
 * Uses exact same styles as the real screen for visual consistency.
 */

const ScheduleRowSkeleton = () => (
    <View style={styles.rowItem}>
        {/* "Lần X" label */}
        <Skeleton width={45} height={14} borderRadius={4} />
        {/* Time pickers row */}
        <View style={styles.timeInputsWrapper}>
            <Skeleton height={40} borderRadius={8} style={{ flex: 1 }} />
            <Skeleton width={10} height={14} borderRadius={4} style={{ marginHorizontal: 8 }} />
            <Skeleton height={40} borderRadius={8} style={{ flex: 1 }} />
        </View>
        {/* Delete button */}
        <Skeleton width={40} height={40} borderRadius={999} />
    </View>
);

export const CustomDeviceSkeleton: React.FC = () => {
    return (
        <View style={styles.scrollContent}>
            {/* Card 1: Chế độ hoạt động */}
            <View style={styles.card}>
                <Skeleton width={160} height={18} borderRadius={4} style={{ marginBottom: 16 }} />
                <Skeleton width={140} height={14} borderRadius={4} style={{ marginBottom: 16 }} />
                <View style={styles.radioRow}>
                    <View style={styles.radioItem}>
                        <Skeleton width={20} height={20} borderRadius={10} />
                        <Skeleton
                            width={70}
                            height={14}
                            borderRadius={4}
                            style={{ marginLeft: 8 }}
                        />
                    </View>
                    <View style={styles.radioItem}>
                        <Skeleton width={20} height={20} borderRadius={10} />
                        <Skeleton
                            width={70}
                            height={14}
                            borderRadius={4}
                            style={{ marginLeft: 8 }}
                        />
                    </View>
                </View>
            </View>

            {/* Card 2: Cấu hình máy */}
            <View style={styles.card}>
                <Skeleton width={120} height={18} borderRadius={4} style={{ marginBottom: 16 }} />
                {/* Input "Chạy (giây)" */}
                <Skeleton width={80} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={48} borderRadius={8} style={{ marginBottom: 16 }} />
                {/* Input "Dừng (phút)" */}
                <Skeleton width={80} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={48} borderRadius={8} />
            </View>

            {/* Card 3: Lịch hoạt động — uses ActivitySchedule container + card styles */}
            <View style={styles.scheduleContainer}>
                <View style={styles.scheduleCard}>
                    {/* Header: "Lịch hoạt động (x/15)" */}
                    <View style={styles.headerRow}>
                        <Skeleton width={120} height={18} borderRadius={4} />
                        <Skeleton width={40} height={14} borderRadius={4} />
                    </View>

                    <ScheduleRowSkeleton />
                    <ScheduleRowSkeleton />

                    {/* "+ Thêm lượt" button */}
                    <Skeleton width="100%" height={44} borderRadius={8} style={{ marginTop: 4 }} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Matches scrollContent from CustomFeedingMachineScreen
    scrollContent: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    // Matches card from CustomFeedingMachineScreen
    card: {
        backgroundColor: colors.white,
        padding: 16,
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    radioRow: {
        flexDirection: 'row',
        gap: 24,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // Matches ActivitySchedule container
    scheduleContainer: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
    },
    // Matches ActivitySchedule card
    scheduleCard: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 16,
    },
    // Matches ActivitySchedule headerRow
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 6,
    },
    // Matches ActivitySchedule rowItem
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    // Matches ActivitySchedule timeInputsWrapper
    timeInputsWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
    },
});
