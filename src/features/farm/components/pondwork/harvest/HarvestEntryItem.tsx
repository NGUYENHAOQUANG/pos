import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';

export interface HarvestEntryItemProps {
    index: string | number;
    weight: number | string;
    unit?: string;
    subtitle: string;
    status?: 'completed' | 'deleted';
    showDivider?: boolean;
    onPress?: () => void;
    hideBadge?: boolean;
}

export const HarvestEntryItem: React.FC<HarvestEntryItemProps> = ({
    index,
    weight,
    unit = 'kg',
    subtitle,
    status = 'completed',
    showDivider = true,
    onPress,
    hideBadge = false,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const isDeleted = status === 'deleted';

    return (
        <>
            <TouchableOpacity
                style={styles.entryItem}
                onPress={onPress}
                disabled={!onPress}
                activeOpacity={0.7}
            >
                <Text style={[styles.entryIndex, isDeleted && styles.errorText]}>{index}</Text>
                <View style={styles.entryInfo}>
                    <View style={styles.entryWeightContainer}>
                        <Text
                            style={[
                                styles.entryWeightValue,
                                isDeleted && styles.errorText,
                                isDeleted && styles.strikethrough,
                            ]}
                        >
                            {weight}
                        </Text>
                        <Text
                            style={[
                                styles.entryWeightUnit,
                                isDeleted && styles.errorText,
                                isDeleted && styles.strikethrough,
                            ]}
                        >
                            {` ${unit}`}
                        </Text>
                    </View>
                    <Text style={styles.entrySubtitle}>{subtitle}</Text>
                </View>
                {!hideBadge && (
                    <View style={[styles.statusBadge, isDeleted && styles.statusDeletedBadge]}>
                        <Text
                            style={[styles.statusBadgeText, isDeleted && styles.statusDeletedText]}
                        >
                            {isDeleted ? 'Đã xóa' : 'Hoàn tất'}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
            {showDivider && <View style={styles.entryDivider} />}
        </>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        entryItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.sm,
        },
        entryIndex: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.text,
            marginHorizontal: spacing.sm,
            width: 24,
            textAlign: 'center',
        },
        entryInfo: {
            flex: 1,
            marginHorizontal: spacing.sm,
            gap: spacing.xs,
        },
        entryWeightContainer: {
            flexDirection: 'row',
            alignItems: 'baseline',
        },
        entryWeightValue: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
        },
        entryWeightUnit: {
            fontSize: 12,
            fontWeight: '400',
            color: theme.textSecondary,
        },
        entrySubtitle: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.textSecondary,
        },
        statusBadge: {
            paddingHorizontal: 10,
            paddingVertical: 2,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: theme.green[200],
            backgroundColor: theme.green[50],
        },
        statusBadgeText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.green[600],
        },
        statusDeletedBadge: {
            borderColor: theme.red[200],
            backgroundColor: theme.red[50],
        },
        statusDeletedText: {
            color: theme.error || theme.red[500],
        },
        errorText: {
            color: theme.error || '#FF3B30',
        },
        strikethrough: {
            textDecorationLine: 'line-through',
        },
        entryDivider: {
            height: 1,
            backgroundColor: theme.defaultBorder,
        },
    });
