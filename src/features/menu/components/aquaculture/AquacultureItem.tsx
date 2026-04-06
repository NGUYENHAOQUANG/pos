import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing, typography, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { SeasonData, SeasonStatus } from '@/features/farm/types/farm.types';
import { Tag } from '@/features/menu/components/Tag';
import { Button } from '@/shared/components/buttons/Button';

interface AquacultureItemProps {
    item: SeasonData;
    onEdit?: (item: SeasonData) => void;
}

export const AquacultureItem: React.FC<AquacultureItemProps> = ({ item, onEdit }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
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

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            padding: spacing.md,
            borderRadius: borderRadius.sm,
            marginTop: spacing.sm,
            marginHorizontal: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        content: {
            flex: 1,
            minWidth: 0,
            marginRight: spacing.md,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.xs,
        },
        nameWrapper: {
            flex: 1,
            minWidth: 0,
            marginRight: spacing.sm,
        },
        name: {
            fontSize: typography.fontSize.base,
            fontWeight: '600',
            color: theme.text,
            marginBottom: 8,
        },
        tag: {
            marginBottom: 8,
        },
        date: {
            fontSize: typography.fontSize.sm,
            color: theme.text,
        },
        editButton: {
            flexShrink: 0,
            backgroundColor: theme.background,
            borderColor: theme.defaultBorder,
        },
        editButtonText: {
            color: theme.text,
        },
    });
