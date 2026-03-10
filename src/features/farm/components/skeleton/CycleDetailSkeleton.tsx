import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { colors, spacing } from '@/styles';

export const CycleDetailSkeleton: React.FC = () => {
    const renderDetailRow = (key: number) => (
        <View key={key} style={styles.detailRow}>
            <Skeleton width={120} height={16} borderRadius={4} />
            <Skeleton width={100} height={16} borderRadius={4} />
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Card 1 */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Skeleton width={150} height={20} borderRadius={4} />
                    <Skeleton width={40} height={40} borderRadius={20} />
                </View>
                <View style={styles.infoContainer}>
                    {renderDetailRow(1)}
                    {renderDetailRow(2)}
                    {renderDetailRow(3)}
                    <View style={styles.line} />
                    {renderDetailRow(4)}
                    {renderDetailRow(5)}
                    {renderDetailRow(6)}
                </View>
            </View>

            {/* Card 2 */}
            <View style={[styles.card, { marginTop: spacing.sm }]}>
                <View style={styles.cardHeaderSmall}>
                    <Skeleton width={150} height={20} borderRadius={4} />
                    <Skeleton width={24} height={24} borderRadius={12} />
                </View>
                <View style={styles.infoContainer}>
                    {renderDetailRow(7)}
                    {renderDetailRow(8)}
                    {renderDetailRow(9)}
                    {renderDetailRow(10)}
                    {renderDetailRow(11)}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    content: {
        paddingTop: spacing.md,
    },
    card: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        marginHorizontal: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    cardHeaderSmall: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    infoContainer: {
        paddingBottom: 16,
        paddingHorizontal: spacing.md,
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 24,
    },
    line: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginVertical: 4,
    },
});
