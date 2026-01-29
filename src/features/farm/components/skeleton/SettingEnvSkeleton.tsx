import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { spacing, colors } from '@/styles';

const SettingItemSkeleton = () => (
    <View style={styles.itemRow}>
        {/* Checkbox */}
        <Skeleton width={24} height={24} borderRadius={4} style={{ marginRight: 12 }} />
        {/* Text Content */}
        <View style={{ flex: 1 }}>
            <Skeleton width={100} height={16} borderRadius={4} style={{ marginBottom: 4 }} />
            <Skeleton width={150} height={12} borderRadius={4} />
        </View>
        {/* Edit Button */}
        <Skeleton width={36} height={36} borderRadius={8} />
    </View>
);

export const SettingEnvSkeleton: React.FC = () => {
    return (
        <View style={styles.container}>
            {/* Dropdown / Farm Name */}
            <View style={styles.section}>
                <Skeleton width={120} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={48} borderRadius={8} />
            </View>

            {/* Group 1: Basic */}
            <View style={styles.section}>
                <View style={styles.groupHeader}>
                    <Skeleton width={120} height={20} borderRadius={4} />
                    <Skeleton
                        width={16}
                        height={16}
                        borderRadius={4}
                        style={{ marginLeft: 'auto' }}
                    />
                </View>
                {[1, 2, 3, 4].map(i => (
                    <SettingItemSkeleton key={`g1-${i}`} />
                ))}
            </View>

            {/* Group 2: Advanced */}
            <View style={styles.section}>
                <View style={styles.groupHeader}>
                    <Skeleton width={120} height={20} borderRadius={4} />
                    <Skeleton
                        width={16}
                        height={16}
                        borderRadius={4}
                        style={{ marginLeft: 'auto' }}
                    />
                </View>
                {[1, 2].map(i => (
                    <SettingItemSkeleton key={`g2-${i}`} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.md,
        backgroundColor: colors.backgroundPrimary,
    },
    section: {
        marginBottom: 24,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        padding: 12,
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
});
