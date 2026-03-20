import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing, borderRadius } from '@/styles';
import { HealthCheckItem } from '@/features/farm/services/shrimp-health-ai.service';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import type { HealthCheckEntry } from '@/features/farm/components/ai-shrimp-health/HealthCheckListSection';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';

interface Props {
    visible: boolean;
    entry: HealthCheckEntry | null;
    items: HealthCheckItem[];
    onClose: () => void;
}

/**
 * Bottom sheet modal showing health check details for a specific check entry.
 * Shows the original image thumbnail and diagnosis per shrimp.
 */
export const ShrimpHealthDetailsModal: React.FC<Props> = ({ visible, entry, items, onClose }) => {
    if (!entry) return null;

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onClose}
            containerStyle={styles.sheetContainer}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lần {entry.index}</Text>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeButton}>
                    <CloseIcon width={24} height={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Items list */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            >
                {items.map((item, idx) => {
                    const isHealthy = item.status === 'HEALTHY';
                    const pillBgColor = isHealthy ? colors.green[25] : colors.red[25];
                    const pillBorderColor = isHealthy ? colors.green[200] : colors.red[200];
                    const pillTextColor = isHealthy ? colors.green[600] : colors.red[600];

                    return (
                        <View key={item.id || idx} style={styles.itemCard}>
                            <Image
                                source={{ uri: entry.originalImageUri }}
                                style={styles.itemThumbnail}
                                resizeMode="cover"
                            />
                            <Text style={styles.itemLabel}>Tôm {idx + 1}</Text>
                            <View
                                style={[
                                    styles.diagnosisPill,
                                    {
                                        backgroundColor: pillBgColor,
                                        borderColor: pillBorderColor,
                                    },
                                ]}
                            >
                                <Text
                                    style={[styles.diagnosisText, { color: pillTextColor }]}
                                    numberOfLines={1}
                                >
                                    {item.diagnosis} {item.confidence}%
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Close button */}
            <View style={styles.footer}>
                <Button title="Đóng" variant="outline" onPress={onClose} />
            </View>
        </AnimatedBottomSheet>
    );
};

const styles = StyleSheet.create({
    sheetContainer: {
        maxHeight: '70%',
        borderRadius: 24,
        margin: 16,
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    closeButton: {
        padding: 4,
    },
    listContent: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
    },
    itemThumbnail: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.backgroundSecondary,
    },
    itemLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        marginLeft: spacing.md,
    },
    diagnosisPill: {
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderWidth: 1,
    },
    diagnosisText: {
        fontSize: 13,
        fontWeight: '500',
    },
    footer: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
    },
});
