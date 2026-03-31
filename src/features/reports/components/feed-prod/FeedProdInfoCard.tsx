import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, borderRadius, spacing } from '@/styles';
import InfoIcon from '@/assets/Icon/IconReport/I.svg';

interface FeedProdInfoCardProps {
    message?: string;
}

const DEFAULT_MESSAGE = 'Hiệu suất đang ổn định. Không cần điều chỉnh thức ăn.';

export const FeedProdInfoCard: React.FC<FeedProdInfoCardProps> = ({
    message = DEFAULT_MESSAGE,
}) => {
    return (
        <View style={styles.card}>
            <InfoIcon width={20} height={20} style={styles.icon} />
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
    icon: {
        marginRight: spacing.sm,
    },
    message: {
        flex: 1,
        fontSize: 12,
        color: colors.text,
        fontWeight: '400',
    },
});
