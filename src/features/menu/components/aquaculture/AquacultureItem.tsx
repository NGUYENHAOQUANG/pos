import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import { Aquaculture } from '@/features/menu/types/menu.types';
import { SeasonData } from '@/features/farm/types/farm.types';
import { Tag } from '@/features/menu/components/Tag';
import EditIcon from '@/assets/Icon/IconMenu/EditOutlined.svg';

interface AquacultureItemProps {
    item: Aquaculture | SeasonData;
    onEdit?: (item: Aquaculture | SeasonData) => void;
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

    // Map status from SeasonData to Tag status if needed
    const getStatus = (status: string | number): 'active' | 'ended' => {
        if (status === 'Đang hoạt động' || status === 0) return 'active';
        if (status === 'Đã kết thúc' || status === 1) return 'ended';
        // Default to active for unknown status
        return 'active';
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Tag status={getStatus(item.status)} style={styles.tag} />
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
        borderRadius: 6,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
