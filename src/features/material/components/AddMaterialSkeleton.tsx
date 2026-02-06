import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { Skeleton } from '@/shared/components/ui/Skeleton';

export const AddMaterialSkeleton = () => {
    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                {/* General Info Skeleton - Matches InventoryGeneralInfo.tsx */}
                <View style={styles.section}>
                    {/* Collapse Header */}
                    <View style={[styles.row, { marginBottom: spacing.md }]}>
                        <Skeleton width={120} height={24} borderRadius={4} />
                        <Skeleton width={24} height={24} borderRadius={12} />
                    </View>

                    <View style={styles.body}>
                        {/* Info Rows: Kho, CreatedDate, Creator */}
                        <View style={styles.infoRow}>
                            <Skeleton width={50} height={16} borderRadius={4} />
                            <Skeleton width={100} height={16} borderRadius={4} />
                        </View>
                        <View style={styles.infoRow}>
                            <Skeleton width={120} height={16} borderRadius={4} />
                            <Skeleton width={100} height={16} borderRadius={4} />
                        </View>
                        <View style={styles.infoRow}>
                            <Skeleton width={120} height={16} borderRadius={4} />
                            <Skeleton width={100} height={16} borderRadius={4} />
                        </View>

                        {/* Input: Date */}
                        <View style={styles.inputGroup}>
                            <Skeleton
                                width={100}
                                height={16}
                                borderRadius={4}
                                style={{ marginBottom: 8 }}
                            />
                            <Skeleton width="100%" height={44} borderRadius={borderRadius.sm} />
                        </View>

                        {/* Input: Note */}
                        <View style={styles.inputGroup}>
                            <Skeleton
                                width={150}
                                height={16}
                                borderRadius={4}
                                style={{ marginBottom: 8 }}
                            />
                            <Skeleton width="100%" height={80} borderRadius={borderRadius.sm} />
                        </View>
                    </View>
                </View>

                {/* Material List Skeleton - Matches InventoryMaterialList.tsx */}
                <View style={styles.itemsSection}>
                    {/* Collapse Header for List */}
                    <View style={[styles.mainMaterialCardHeader, styles.row]}>
                        <Skeleton width={150} height={24} borderRadius={4} />
                        <Skeleton width={24} height={24} borderRadius={12} />
                    </View>

                    <View style={styles.itemCardWrapper}>
                        {[1, 2].map(key => (
                            <View key={key} style={styles.itemCard}>
                                {/* Item Header */}
                                <View style={styles.cardHeader}>
                                    <Skeleton width={80} height={20} borderRadius={4} />
                                    <Skeleton width={24} height={24} borderRadius={12} />
                                </View>

                                <View style={styles.cardBody}>
                                    {/* Material Dropdown */}
                                    <View style={styles.inputGroup}>
                                        <Skeleton
                                            width={80}
                                            height={16}
                                            borderRadius={4}
                                            style={{ marginBottom: 8 }}
                                        />
                                        <Skeleton
                                            width="100%"
                                            height={40}
                                            borderRadius={borderRadius.md}
                                        />
                                    </View>

                                    {/* Stock Columns */}
                                    <View style={styles.row}>
                                        <View style={{ flex: 1, marginRight: spacing.lg }}>
                                            <Skeleton
                                                width={80}
                                                height={16}
                                                borderRadius={4}
                                                style={{ marginBottom: 8 }}
                                            />
                                            <Skeleton
                                                width={60}
                                                height={20}
                                                borderRadius={4}
                                                style={{ marginTop: 4 }}
                                            />
                                        </View>

                                        <View style={styles.dividerVertical} />

                                        <View style={{ flex: 1, marginLeft: spacing.lg }}>
                                            <Skeleton
                                                width={80}
                                                height={16}
                                                borderRadius={4}
                                                style={{ marginBottom: 8 }}
                                            />
                                            <Skeleton
                                                width="100%"
                                                height={40}
                                                borderRadius={borderRadius.md}
                                            />
                                        </View>
                                    </View>

                                    {/* Footer Diff */}
                                    <View style={styles.cardFooter}>
                                        <Skeleton width={120} height={16} borderRadius={4} />
                                        <Skeleton width={80} height={20} borderRadius={4} />
                                    </View>
                                </View>
                            </View>
                        ))}

                        {/* Add Button */}
                        <View style={{ marginTop: spacing.xs, alignItems: 'center' }}>
                            <Skeleton width="100%" height={50} borderRadius={borderRadius.md} />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Buttons Skeleton - Matches ButtonBarMaterial */}
            <View style={styles.footer}>
                <View style={styles.row}>
                    <Skeleton width="48%" height={44} borderRadius={borderRadius.md} />
                    <Skeleton width="48%" height={44} borderRadius={borderRadius.md} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: spacing.md,
        paddingBottom: 100,
    },
    section: {
        backgroundColor: colors.white,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    body: {
        marginTop: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    inputGroup: {
        marginTop: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemsSection: {
        backgroundColor: colors.white,
    },
    mainMaterialCardHeader: {
        padding: spacing.md,
    },
    itemCardWrapper: {
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.gray[100],
    },
    itemCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray[200],
        marginBottom: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[240],
        backgroundColor: colors.backgroundSecondary,
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
        alignItems: 'center',
    },
    cardBody: {
        padding: spacing.md,
    },
    dividerVertical: {
        width: 1,
        height: 40,
        backgroundColor: colors.gray[100],
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.gray[100],
        paddingTop: spacing.sm,
        marginTop: spacing.sm,
    },
    footer: {
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray[200],
    },
});
