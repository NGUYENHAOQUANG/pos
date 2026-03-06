import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { SeasonData, SeasonStatus } from '@/features/farm/types/farm.types';
import { Tag } from '@/features/menu/components/Tag';
import { Button } from '@/shared/components/buttons/Button';

interface AquacultureItemProps {
    item: SeasonData;
    onEdit?: (item: SeasonData) => void;
}

export const AquacultureItem: React.FC<AquacultureItemProps> = ({ item, onEdit }) => {
    const formatDate = (date: string | Date) => {
        if (!date) return '...';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const dateRange = `${formatDate(item.startDate)} - ${
        item.endDate ? formatDate(item.endDate) : '...'
    }`;

    // Map status from SeasonData to Tag status
    const getStatus = (status: string | SeasonStatus): 'active' | 'ended' | 'preparing' => {
        if (status === SeasonStatus.Active) return 'active';
        if (status === SeasonStatus.Closed) return 'ended';
        if (status === SeasonStatus.Preparation) return 'preparing';
        // Default to active for unknown status
        return 'active';
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Tag status={getStatus(item.status)} type="season" style={styles.tag} />
                <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                    {item.name}
                </Text>
                <Text style={styles.date}>{dateRange}</Text>
            </View>

            <Button
                title="Chỉnh sửa"
                variant="outline"
                size="small"
                onPress={() => onEdit?.(item)}
                style={styles.editButton}
                textStyle={styles.editButtonText}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: spacing.md,
        marginTop: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
    },
    content: {
        flex: 1,
        minWidth: 0,
        marginRight: spacing.md,
    },
    tag: {
        alignSelf: 'flex-start',
        marginBottom: spacing.xs,
    },
    name: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    date: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
    },
    editButton: {
        flexShrink: 0,
        backgroundColor: colors.white,
        borderColor: colors.border,
    },
    editButtonText: {
        color: colors.text,
    },
});
