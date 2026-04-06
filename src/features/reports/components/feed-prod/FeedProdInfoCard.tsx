import { useAppTheme } from '@/styles/themeContext';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, spacing } from '@/styles';
import InfoIcon from '@/assets/Icon/IconReport/I.svg';

interface FeedProdInfoCardProps {
    message?: string;
}

const DEFAULT_MESSAGE = 'Hiệu suất đang ổn định. Không cần điều chỉnh thức ăn.';

export const FeedProdInfoCard: React.FC<FeedProdInfoCardProps> = ({
    message = DEFAULT_MESSAGE,
}) => {
    const theme = useAppTheme();
    return (
        <View
            style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}
        >
            <InfoIcon width={20} height={20} style={styles.icon} />
            <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',

        borderRadius: borderRadius.sm,
        borderWidth: 1,

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

        fontWeight: '400',
    },
});
