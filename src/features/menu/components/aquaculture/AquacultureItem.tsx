import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { SeasonData, SeasonStatus } from '@/features/farm/types/farm.types';
import { Tag } from '@/features/menu/components/Tag';
import EditIcon from '@/assets/Icon/IconMenu/EditOutlined.svg';

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
                <View style={styles.header}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Tag status={getStatus(item.status)} type="season" style={styles.tag} />
                </View>
                <Text style={styles.date}>{dateRange}</Text>
            </View>

            <TouchableOpacity
                style={styles.editButton}
                onPress={() => onEdit?.(item)}
                activeOpacity={0.7}
            >
                <EditIcon width={20} height={20} />
            </TouchableOpacity>
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
    },
    content: {
        flex: 1,
        marginRight: spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
        flexWrap: 'wrap',
    },
    name: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.text,
        marginRight: spacing.sm,
    },
    tag: {
        // Tag component handles its own styles
    },
    date: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
    },
    editButton: {
        padding: spacing.xs,
        borderWidth: 1,
        borderColor: colors.borderDark,
        borderRadius: borderRadius.xs + 2,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
