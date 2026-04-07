import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

const SKELETON_COUNT = 3;

const PondListSkeletonItem: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            {/* Header: Name + Tag + Menu (No Icon) */}
            <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                    <View style={styles.titleContainer}>
                        <Skeleton width={80} height={20} style={{ marginBottom: 4 }} />
                        <Skeleton width={50} height={14} />
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <Skeleton
                        width={60}
                        height={24}
                        style={{ borderRadius: borderRadius.full, marginRight: 8 }}
                    />
                    <Skeleton width={32} height={32} style={{ borderRadius: 16 }} />
                </View>
            </View>

            <View style={styles.separator} />

            {/* Info Section */}
            <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                    <Skeleton width={80} height={16} />
                    <Skeleton width={60} height={24} style={{ borderRadius: borderRadius.full }} />
                </View>
                <View style={styles.infoRow}>
                    <Skeleton width={140} height={16} />
                    <Skeleton width={120} height={16} />
                </View>
                <View style={styles.infoRow}>
                    <Skeleton width={120} height={16} />
                    <Skeleton width={80} height={16} />
                </View>
            </View>

            {/* Footer Button: Xem chi tiết */}
            <View style={styles.footer}>
                <Skeleton width="100%" height={40} style={{ borderRadius: borderRadius.full }} />
            </View>
        </View>
    );
};

export const PondListSkeleton: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.listContainer}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <PondListSkeletonItem key={index} />
            ))}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        listContainer: {
            flex: 1,
            padding: spacing.md,
        },
        container: {
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            marginBottom: spacing.md,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: spacing.md,
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        titleContainer: {
            marginLeft: 0,
        },
        headerRight: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        separator: {
            height: 1,
            backgroundColor: theme.borderLight,
            marginHorizontal: -spacing.md,
            marginBottom: spacing.md,
        },
        infoBox: {
            backgroundColor: 'transparent',
            padding: 0,
            marginBottom: spacing.md,
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        footer: {
            marginTop: spacing.xs,
            marginBottom: 4,
        },
    });
