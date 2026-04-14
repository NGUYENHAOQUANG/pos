import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

export const NotificationSkeleton: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            {Array.from({ length: 6 }).map((_, index) => (
                <View key={index} style={styles.itemContainer}>
                    {/* Icon Skeleton */}
                    <View style={styles.iconWrapper}>
                        <Skeleton width={44} height={44} borderRadius={12} />
                    </View>

                    {/* Content Skeleton */}
                    <View style={styles.contentContainer}>
                        <View style={styles.titleRow}>
                            <Skeleton width="60%" height={16} borderRadius={4} />
                            <Skeleton width={40} height={12} borderRadius={4} />
                        </View>
                        <Skeleton
                            width="80%"
                            height={14}
                            borderRadius={4}
                            style={{ marginTop: 4 }}
                        />
                        <Skeleton
                            width="50%"
                            height={14}
                            borderRadius={4}
                            style={{ marginTop: 4 }}
                        />
                    </View>
                </View>
            ))}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
            paddingVertical: spacing.sm,
        },
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
        },
        iconWrapper: {
            marginRight: spacing.md,
        },
        contentContainer: {
            flex: 1,
            justifyContent: 'center',
        },
        titleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
    });
