import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, borderRadius, spacing } from '@/styles';

interface FeedProdInfoCardProps {
    message?: string;
}

const DEFAULT_MESSAGE = 'Hiệu suất đang ổn định. Không cần điều chỉnh thức ăn.';

export const FeedProdInfoCard: React.FC<FeedProdInfoCardProps> = ({
    message = DEFAULT_MESSAGE,
}) => {
    return (
        <View style={styles.card}>
            <View style={styles.iconWrap}>
                <Text style={styles.iconText}>i</Text>
            </View>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.sm,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    iconWrap: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    iconText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    message: {
        flex: 1,
        fontSize: 12,
        color: colors.text,
        fontWeight: '400',
    },
});
