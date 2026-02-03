import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { Skeleton } from '@/shared/components/ui/Skeleton';

export const ImportReceiptSkeleton = () => {
    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.row}>
                    <Skeleton width={80} height={16} borderRadius={4} />
                    <Skeleton width={120} height={16} borderRadius={4} />
                </View>
                <View style={styles.row}>
                    <Skeleton width={80} height={16} borderRadius={4} />
                    <Skeleton width={100} height={16} borderRadius={4} />
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Skeleton width={100} height={16} borderRadius={4} />
                    <Skeleton width={40} height={16} borderRadius={4} />
                </View>
                <View style={styles.row}>
                    <Skeleton width={80} height={16} borderRadius={4} />
                    <Skeleton width={120} height={16} borderRadius={4} />
                </View>
            </View>
            <View style={[styles.expandButton, { opacity: 0.5, marginBottom: 6 }]}>
                <Skeleton width={60} height={14} borderRadius={4} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        // overflow: 'hidden',
        paddingBottom: spacing.sm,
    },
    cardContent: {
        padding: spacing.md,
        paddingBottom: 0,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: spacing.sm,
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        gap: 4,
    },
});
