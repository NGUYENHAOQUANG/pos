import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/styles';
import { formatCurrency } from '@/features/material/utils/formatCurrency';
import { Button } from '@/shared/components/buttons/Button';

interface ExportWarehouseFooterProps {
    totalAmount: number;
    onSaveDraft: () => void;
    onSubmit: () => void;
    disabled?: boolean;
}

export const ExportWarehouseFooter: React.FC<ExportWarehouseFooterProps> = ({
    totalAmount,
    onSaveDraft,
    onSubmit,
    disabled = false,
}) => {
    const insets = useSafeAreaInsets();
    const safeBottom = Math.max(insets.bottom, 12);

    return (
        <View style={[styles.footer, { paddingBottom: safeBottom }]}>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
            </View>
            <View style={styles.buttonRow}>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Lưu Nháp"
                        variant="outline"
                        onPress={onSaveDraft}
                        disabled={disabled}
                    />
                </View>
                <View style={styles.buttonSpacer} />
                <View style={styles.buttonWrapper}>
                    <Button title="Gửi Phiếu" variant="primary" onPress={onSubmit} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        backgroundColor: colors.white,
        paddingTop: 16,
        paddingHorizontal: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    totalLabel: {
        fontSize: 14,
        color: colors.text,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.error,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonWrapper: {
        flex: 1,
    },
    buttonSpacer: {
        width: spacing.md,
    },
});
