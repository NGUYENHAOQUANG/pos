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
 * Skeleton for a single Pond Device Card
 */
const PondCardSkeletonItem = () => {
    return (
        <View style={styles.cardWrapper}>
            {/* Header: Pond Name + Detail Button */}
            <View style={styles.cardHeader}>
                <Skeleton width={80} height={24} style={{ borderRadius: 4 }} />
                <Skeleton width={90} height={32} style={{ borderRadius: 20 }} />
            </View>

            {/* Devices Container Wrapper */}
            <View style={styles.devicesCardContainer}>
                {/* Devices Grid: 4 items */}
                <View style={styles.devicesGrid}>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <View key={index} style={styles.deviceItem}>
                            {/* Device Icon Circle/Square */}
                            <Skeleton
                                width={48}
                                height={48}
                                style={{ marginBottom: 12, borderRadius: 24 }}
                            />

                            {/* Status Lines (Power, Warning, Error) */}
                            <View style={{ gap: 6, alignItems: 'center' }}>
                                <Skeleton width={40} height={12} />
                                <Skeleton width={40} height={12} />
                                <Skeleton width={40} height={12} />
                            </View>
                        </View>
                    ))}
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
    devicesCardContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        borderColor: colors.defaultBorder,
        borderWidth: 1,
    },
    devicesGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    deviceItem: {
        flex: 1,
        alignItems: 'center',
    },
});
