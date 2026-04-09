import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing, borderRadius } from '@/styles';
import ArrowLeft from '@/assets/Icon/ArrowLeft.svg';
import ArrowRight from '@/assets/Icon/ArrowRight.svg';

import { HealthCheckResult } from '@/features/farm/services/shrimp-health-ai.service';

const PAGE_SIZE = 10;
const MIN_ENTRIES_FOR_PAGINATION = 11;

export interface HealthCheckEntry {
    index: number;
    originalImageUri: string;
    processedImageUri?: string;
    result: HealthCheckResult;
}

interface HealthCheckListSectionProps {
    entries: HealthCheckEntry[];
    onViewEntry: (entry: HealthCheckEntry) => void;
}

export const HealthCheckListSection: React.FC<HealthCheckListSectionProps> = ({
    entries,
    onViewEntry,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const [currentPage, setCurrentPage] = useState(1);

    if (entries.length === 0) {
        return null;
    }

    const shouldPaginate = entries.length >= MIN_ENTRIES_FOR_PAGINATION;
    const totalPages = Math.ceil(entries.length / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageEntries = shouldPaginate
        ? entries.slice(startIndex, startIndex + PAGE_SIZE)
        : entries;

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(p => p - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(p => p + 1);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Danh sách kiểm tra <Text style={styles.count}>({entries.length})</Text>
            </Text>

            <View style={styles.listContainer}>
                {pageEntries.map(entry => (
                    <View key={entry.index} style={styles.row}>
                        <Image
                            source={{ uri: entry.originalImageUri }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                        <Text style={styles.label}>Lần {entry.index}</Text>
                        <TouchableOpacity
                            style={styles.viewButton}
                            onPress={() => onViewEntry(entry)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.viewButtonText}>Xem</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Pagination - only shown when entries > 10 */}
                {entries.length >= MIN_ENTRIES_FOR_PAGINATION && totalPages > 1 && (
                    <View style={styles.pagination}>
                        <TouchableOpacity
                            style={[
                                styles.pageButton,
                                currentPage <= 1 && styles.pageButtonDisabled,
                            ]}
                            onPress={goToPrevPage}
                            disabled={currentPage <= 1}
                            activeOpacity={0.7}
                        >
                            <ArrowLeft
                                width={14}
                                height={14}
                                color={currentPage <= 1 ? theme.textTertiary : theme.text}
                            />
                            <Text
                                style={[
                                    styles.pageButtonText,
                                    currentPage <= 1 && styles.pageButtonTextDisabled,
                                ]}
                            >
                                Sau
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.pageInfo}>
                            Trang {String(currentPage).padStart(2, '0')}/
                            {String(totalPages).padStart(2, '0')}
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.pageButton,
                                currentPage >= totalPages && styles.pageButtonDisabled,
                            ]}
                            onPress={goToNextPage}
                            disabled={currentPage >= totalPages}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.pageButtonText,
                                    currentPage >= totalPages && styles.pageButtonTextDisabled,
                                ]}
                            >
                                Trước
                            </Text>
                            <ArrowRight
                                width={14}
                                height={14}
                                color={currentPage >= totalPages ? theme.textTertiary : theme.text}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            paddingHorizontal: 16,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            marginHorizontal: 16,
        },
        title: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
            marginBottom: spacing.sm,
        },
        count: {
            fontWeight: '400',
            color: theme.textSecondary,
        },
        listContainer: {
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: spacing.sm,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.defaultBorder,
        },
        thumbnail: {
            width: 40,
            height: 40,
            borderRadius: borderRadius.sm,
            backgroundColor: theme.backgroundSecondary,
        },
        label: {
            flex: 1,
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
            marginLeft: spacing.md,
        },
        viewButton: {
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
        },
        viewButtonText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.textSecondary,
        },
        pagination: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
        },
        pageButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            paddingHorizontal: spacing.md,
            height: 32,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        pageButtonDisabled: {
            borderColor: theme.defaultBorder,
            opacity: 0.4,
        },
        pageButtonText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
        },
        pageButtonTextDisabled: {
            color: theme.textTertiary,
        },
        pageInfo: {
            fontSize: 14,
            color: theme.textSecondary,
        },
    });
