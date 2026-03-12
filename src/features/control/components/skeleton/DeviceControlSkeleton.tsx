import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { colors } from '@/styles';

const SKELETON_COUNT = 3;

/**
 * Skeleton for the Summary Status Cards (Total, Active, Warning, Other)
 */
const StatusSkeleton = () => {
    return (
        <View style={styles.statusContainer}>
            {/* 4 items in the row */}
            {Array.from({ length: 4 }).map((_, index) => (
                <React.Fragment key={index}>
                    <View style={styles.statusItem}>
                        <Skeleton width={50} height={14} style={{ marginBottom: 8 }} />
                        <Skeleton width={30} height={24} />
                    </View>
                    {/* Add spacer between items, except the last one */}
                    {index < 3 && <View style={styles.statusSpacer} />}
                </React.Fragment>
            ))}
        </View>
    );
};

/**
 * Skeleton for a single DevicesItem card (icon + label + 3 status rows)
 */
const DevicesItemSkeleton = () => {
    return (
        <View style={styles.deviceItemCard}>
            {/* Icon + Label row */}
            <View style={styles.deviceItemHeader}>
                <Skeleton width={32} height={32} style={{ borderRadius: 8 }} />
                <Skeleton width={70} height={14} style={{ marginLeft: 8 }} />
            </View>

            {/* Status rows (active, warning, inactive) */}
            <View style={styles.deviceStatusRows}>
                <View style={styles.deviceStatusRow}>
                    <Skeleton width={12} height={12} style={{ borderRadius: 6 }} />
                    <Skeleton width={80} height={12} style={{ marginLeft: 6 }} />
                    <View style={{ flex: 1 }} />
                    <Skeleton width={16} height={12} />
                </View>
                <View style={styles.deviceStatusRow}>
                    <Skeleton width={12} height={12} style={{ borderRadius: 6 }} />
                    <Skeleton width={28} height={12} style={{ marginLeft: 6 }} />
                    <View style={{ flex: 1 }} />
                    <Skeleton width={16} height={12} />
                </View>
                <View style={styles.deviceStatusRow}>
                    <Skeleton width={12} height={12} style={{ borderRadius: 6 }} />
                    <Skeleton width={44} height={12} style={{ marginLeft: 6 }} />
                    <View style={{ flex: 1 }} />
                    <Skeleton width={16} height={12} />
                </View>
            </View>
        </View>
    );
};

/**
 * Skeleton for a single Pond Card (header + 2-col device grid)
 */
const PondCardSkeletonItem = () => {
    return (
        <View style={styles.cardWrapper}>
            {/* Header: Pond Name + Detail Button */}
            <View style={styles.cardHeader}>
                <Skeleton width={80} height={20} style={{ borderRadius: 4 }} />
                <Skeleton width={80} height={16} style={{ borderRadius: 4 }} />
            </View>

            {/* 2-column devices grid */}
            <View style={styles.devicesGrid}>
                <View style={styles.gridRow}>
                    <DevicesItemSkeleton />
                    <DevicesItemSkeleton />
                </View>
            </View>
        </View>
    );
};

export const DeviceControlSkeleton = () => {
    return (
        <View style={styles.container}>
            {/* Summary Section */}
            <StatusSkeleton />

            {/* List of Pond Cards */}
            <View style={styles.listContainer}>
                {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                    <PondCardSkeletonItem key={index} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // Status Styles
    statusContainer: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    statusItem: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        borderRadius: 16,
        borderColor: colors.defaultBorder,
        borderWidth: 1,
    },
    statusSpacer: {
        width: 8,
    },

    // Card Styles
    listContainer: {
        paddingBottom: 16,
    },
    cardWrapper: {
        marginHorizontal: 16,
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    // Device grid (2 columns)
    devicesGrid: {
        gap: 10,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 10,
    },

    // Single DevicesItem card
    deviceItemCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    deviceItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    deviceStatusRows: {
        gap: 8,
    },
    deviceStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
