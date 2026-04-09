import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Button } from '@/shared/components/buttons/Button';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing, borderRadius } from '@/styles';
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
    const theme = useAppTheme();
    const styles = getStyles(theme);

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
                    <CloseIcon width={24} height={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* Items list */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            >
                {items.map((item, idx) => {
                    const isHealthy = item.status === 'HEALTHY';
                    const pillBgColor = isHealthy
                        ? theme.isDark
                            ? 'rgba(34, 197, 94, 0.1)'
                            : '#F0FDF4' // green[25]/[50]
                        : theme.isDark
                        ? 'rgba(239, 68, 68, 0.1)'
                        : '#FEF2F2'; // red[25]/[50]
                    const pillBorderColor = isHealthy
                        ? theme.isDark
                            ? 'rgba(34, 197, 94, 0.4)'
                            : '#BBF7D0' // green[200]
                        : theme.isDark
                        ? 'rgba(239, 68, 68, 0.4)'
                        : '#FECACA'; // red[200]
                    const pillTextColor = isHealthy
                        ? theme.isDark
                            ? '#4ADE80'
                            : '#16A34A' // green[400]/[600]
                        : theme.isDark
                        ? '#F87171'
                        : '#DC2626'; // red[400]/[600]

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

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        sheetContainer: {
            maxHeight: '70%',
            borderRadius: 24,
            margin: 16,
            paddingBottom: 24,
            backgroundColor: theme.backgroundPrimary,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.defaultBorder,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.text,
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
            borderColor: theme.defaultBorder,
            borderRadius: 12,
        },
        itemThumbnail: {
            width: 40,
            height: 40,
            borderRadius: borderRadius.sm,
            backgroundColor: theme.backgroundSecondary,
        },
        itemLabel: {
            flex: 1,
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
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
