import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

const SettingItemSkeleton = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    return (
        <View style={styles.itemCard}>
            {/* Checkbox */}
            <Skeleton width={24} height={24} borderRadius={4} style={{ marginRight: 8 }} />
            {/* Text Content */}
            <View style={{ flex: 1, gap: 4 }}>
                <Skeleton width={100} height={16} borderRadius={4} />
                <Skeleton width={140} height={14} borderRadius={4} />
            </View>
            {/* Edit Button */}
            <Skeleton width={32} height={32} borderRadius={16} />
        </View>
    );
};

export const SettingEnvSkeleton: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
                {/* Group 1: Basic */}
                <View style={styles.outerCard}>
                    <View style={styles.headerWrapper}>
                        <Skeleton width={140} height={20} borderRadius={4} />
                        <Skeleton width={220} height={16} borderRadius={4} />
                    </View>
                    <View style={styles.itemsList}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <SettingItemSkeleton key={`g1-${i}`} />
                        ))}
                    </View>
                </View>

                {/* Group 2: Advanced */}
                <View style={styles.outerCard}>
                    <View style={styles.headerWrapper}>
                        <Skeleton width={140} height={20} borderRadius={4} />
                        <Skeleton width={220} height={16} borderRadius={4} />
                    </View>
                    <View style={styles.itemsList}>
                        {[1, 2].map(i => (
                            <SettingItemSkeleton key={`g2-${i}`} />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        scrollContent: {
            padding: 16,
            gap: 8,
            paddingBottom: 20,
        },
        outerCard: {
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            padding: 12,
            gap: 16,
        },
        headerWrapper: {
            gap: 4,
        },
        itemsList: {
            gap: 8,
        },
        itemCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: theme.background,
        },
    });
