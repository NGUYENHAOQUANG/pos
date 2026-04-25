import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing, typography, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { DetailRow } from '@/features/material/components/DetailRow';
import { formatNumber } from '@/features/farm/utils/numberUtils';

interface Props {
    materialCode: string;
    price: number;
    supplier: string;
    remainingQuantity?: number;
}

const BreedInfoCard: React.FC<Props> = ({ materialCode, price, supplier, remainingQuantity }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Thông tin giống</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <DetailRow label="Mã vật tư:" value={materialCode} />
                <DetailRow label="Giá tôm:" value={`${formatNumber(price)} VND/con`} />
                <DetailRow label="Nhãn hàng:" value={supplier} />

                {remainingQuantity !== undefined && (
                    <DetailRow label="Số lượng còn lại:" value={formatNumber(remainingQuantity)} />
                )}
            </View>
        </View>
    );
};

export default BreedInfoCard;

/* ===== STYLES ===== */
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            backgroundColor: theme.background,
            overflow: 'hidden',
        },

        header: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.defaultBorder,
            backgroundColor: theme.backgroundPrimary,
        },

        headerText: {
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: theme.text,
        },

        content: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            gap: spacing.xs,
            backgroundColor: theme.background,
        },
    });
