import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { colors, spacing } from '@/styles';

/**
 * Skeleton for ButtonHistory section (Lịch trình + Lịch sử & Thống kê)
 */
const HistoryButtonsSkeleton = () => (
    <View style={styles.historyRow}>
        <View style={styles.historyButton}>
            <Skeleton width={16} height={16} style={{ borderRadius: 8 }} />
            <Skeleton width={60} height={14} style={{ marginLeft: 8 }} />
        </View>
        <View style={styles.historyButton}>
            <Skeleton width={16} height={16} style={{ borderRadius: 8 }} />
            <Skeleton width={110} height={14} style={{ marginLeft: 8 }} />
        </View>
    </View>
);

/**
 * Skeleton for HeadingBar tabs
 */
const TabsSkeleton = () => (
    <View style={styles.tabsContainer}>
        {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width={70} height={14} style={{ borderRadius: 4 }} />
        ))}
    </View>
);

/**
 * Skeleton for a single Device card in the detail list
 */
const DeviceCardSkeleton = () => (
    <View style={styles.deviceCard}>
        {/* Left: Icon */}
        <Skeleton width={48} height={48} style={styles.deviceIcon} />

        {/* Middle: Name + ID + Mode */}
        <View style={styles.deviceInfo}>
            <Skeleton width={90} height={16} style={{ borderRadius: 4, marginBottom: 4 }} />
            <Skeleton width={70} height={12} style={{ borderRadius: 4, marginBottom: 6 }} />
            <View style={styles.modeRow}>
                <Skeleton width={56} height={12} style={{ borderRadius: 4 }} />
                <Skeleton width={12} height={12} style={{ borderRadius: 6, marginLeft: 4 }} />
            </View>
        </View>

        {/* Right: Settings + Toggle */}
        <View style={styles.deviceActions}>
            <Skeleton width={24} height={24} style={{ borderRadius: 6 }} />
            <Skeleton width={44} height={24} style={{ borderRadius: 12, marginTop: 6 }} />
        </View>
    </View>
);

/**
 * Skeleton for a device type section (title + list of cards)
 */
const DeviceSectionSkeleton = ({ cardCount = 2 }: { cardCount?: number }) => (
    <View style={styles.section}>
        {/* Section Title */}
        <Skeleton width={100} height={18} style={{ borderRadius: 4, marginBottom: 12 }} />

        {/* Device Cards */}
        {Array.from({ length: cardCount }).map((_, i) => (
            <DeviceCardSkeleton key={i} />
        ))}
    </View>
);

export const DeviceInPondSkeleton = () => (
    <View style={styles.container}>
        <HistoryButtonsSkeleton />
        <TabsSkeleton />
        <DeviceSectionSkeleton cardCount={2} />
        <DeviceSectionSkeleton cardCount={3} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },

    // History buttons
    historyRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
        paddingTop: 16,
    },
    historyButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: colors.white,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 4,
        marginBottom: 8,
    },

    // Section
    section: {
        marginBottom: 24,
    },

    // Device card
    deviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    deviceIcon: {
        borderRadius: 10,
        marginRight: 12,
    },
    deviceInfo: {
        flex: 1,
    },
    modeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deviceActions: {
        alignItems: 'center',
        marginLeft: 8,
    },
});
