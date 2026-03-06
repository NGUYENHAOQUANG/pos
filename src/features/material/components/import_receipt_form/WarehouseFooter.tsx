import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '@/styles';
import { formatCurrency } from '@/features/material/utils/formatCurrency';
import { OutlineButton } from '@/shared/components/buttons/OutlineButton';

interface WarehouseFooterProps {
    safeBottom: number;
    totalAmount: number;
    onSaveDraft: () => void;
    onSubmit: () => void;
}

export const WarehouseFooter: React.FC<WarehouseFooterProps> = ({
    safeBottom,
    totalAmount,
    onSaveDraft,
    onSubmit,
}) => {
    return (
        <View style={[styles.footer, { paddingBottom: safeBottom }]}>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalAmount)} </Text>
            </View>
            <View style={styles.buttonRow}>
                <OutlineButton
                    label="Lưu Nháp"
                    onPress={onSaveDraft}
                    style={styles.draftButton}
                    labelStyle={styles.draftButtonText}
                />
                <View style={{ width: spacing.md }} />
                <OutlineButton
                    label="Gửi Phiếu"
                    onPress={onSubmit}
                    style={styles.submitButton}
                    labelStyle={styles.submitButtonText}
                />
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
    draftButton: {
        flex: 1,
        height: 40,
        borderColor: colors.blue[600],
    },
    draftButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.blue[600],
    },
    submitButton: {
        flex: 1,
        height: 40,
        backgroundColor: colors.blue[600],
        borderColor: colors.blue[600],
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.white,
    },
});
