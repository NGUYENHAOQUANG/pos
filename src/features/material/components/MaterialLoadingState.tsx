import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Colors, spacing, borderRadius } from '@/styles';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useAppTheme } from '@/styles/themeContext';

const ImportReceiptSkeleton = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

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

export const MaterialLoadingState = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <FlatList
                data={[1, 2, 3, 4, 5]}
                renderItem={() => <ImportReceiptSkeleton />}
                keyExtractor={item => item.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        listContainer: {
            paddingBottom: 100,
        },
        card: {
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            marginBottom: spacing.sm,
            paddingBottom: spacing.sm,
            borderWidth: 1,
            borderColor: theme.border,
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
            backgroundColor: theme.borderLight,
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
