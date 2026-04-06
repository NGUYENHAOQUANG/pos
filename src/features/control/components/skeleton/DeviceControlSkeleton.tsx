import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

const SKELETON_COUNT = 3;

/**
 * Skeleton for the Summary Status Cards (Total, Active, Warning, Other)
 */
const StatusSkeleton = ({ theme }: { theme: Colors }) => {
    const themedStyles = getStyles(theme);
    return (
        <View style={styles.statusContainer}>
            {Array.from({ length: 4 }).map((_, index) => (
                <React.Fragment key={index}>
                    <View style={themedStyles.statusItem}>
                        <Skeleton width={50} height={14} style={{ marginBottom: 8 }} />
                        <Skeleton width={30} height={24} />
                    </View>
                    {index < 3 && <View style={styles.statusSpacer} />}
                </React.Fragment>
            ))}
        </View>
    );
};

/**
 * Skeleton for a single DevicesItem card (icon + label + 3 status rows)
 */
const DevicesItemSkeleton = ({ theme }: { theme: Colors }) => {
    const themedStyles = getStyles(theme);
    return (
        <View style={themedStyles.deviceItemCard}>
            <View style={styles.deviceItemHeader}>
                <Skeleton width={32} height={32} style={{ borderRadius: 8 }} />
                <Skeleton width={70} height={14} style={{ marginLeft: 8 }} />
            </View>
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
const PondCardSkeletonItem = ({ theme }: { theme: Colors }) => {
    return (
        <View style={styles.cardWrapper}>
            <View style={styles.cardHeader}>
                <Skeleton width={80} height={20} style={{ borderRadius: 4 }} />
                <Skeleton width={80} height={16} style={{ borderRadius: 4 }} />
            </View>
            <View style={styles.devicesGrid}>
                <View style={styles.gridRow}>
                    <DevicesItemSkeleton theme={theme} />
                    <DevicesItemSkeleton theme={theme} />
                </View>
            </View>
        </View>
    );
};

export const DeviceControlSkeleton = () => {
    const theme = useAppTheme();

    return (
        <View style={styles.container}>
            <StatusSkeleton theme={theme} />
            <View style={styles.listContainer}>
                {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                    <PondCardSkeletonItem key={index} theme={theme} />
                ))}
            </View>
        </View>
    );
};

// Static styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statusContainer: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    statusSpacer: {
        width: 8,
    },
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
    devicesGrid: {
        gap: 10,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 10,
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

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        statusItem: {
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingVertical: 12,
            paddingHorizontal: 12,
            backgroundColor: theme.background,
            borderRadius: 16,
            borderColor: theme.defaultBorder,
            borderWidth: 1,
        },
        deviceItemCard: {
            flex: 1,
            backgroundColor: theme.background,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
    });
