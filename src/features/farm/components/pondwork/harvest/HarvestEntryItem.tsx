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
}

export const HarvestEntryItem: React.FC<HarvestEntryItemProps> = ({
    index,
    weight,
    unit = 'kg',
    subtitle,
    status = 'completed',
    showDivider = true,
    onPress,
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
                <View style={[styles.statusBadge, isDeleted && styles.statusDeletedBadge]}>
                    <Text style={[styles.statusBadgeText, isDeleted && styles.statusDeletedText]}>
                        {isDeleted ? 'Đã xóa' : 'Hoàn tất'}
                    </Text>
                </View>
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
            marginVertical: spacing.sm,
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
            paddingVertical: 4,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: '#A8E3C1', // Green border
            backgroundColor: theme.background,
        },
        statusBadgeText: {
            fontSize: 13,
            fontWeight: '500',
            color: '#158C4A', // Green text
        },
        statusDeletedBadge: {
            borderColor: '#FFC7C7', // Red border
        },
        statusDeletedText: {
            color: theme.error || '#FF3B30',
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
