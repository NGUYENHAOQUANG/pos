import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, spacing } from '@/styles';
import { formatCurrency } from '@/features/material/utils/formatCurrency';

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
                <TouchableOpacity style={styles.draftButton} onPress={onSaveDraft}>
                    <Text style={styles.draftButtonText}>Lưu Nháp</Text>
                </TouchableOpacity>
                <View style={{ width: spacing.md }} />
                <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                    <Text style={styles.submitButtonText}>Gửi Phiếu</Text>
                </TouchableOpacity>
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
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.blue[600],
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    draftButtonText: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.blue[600],
    },
    submitButton: {
        flex: 1,
        height: 40,
        borderRadius: 8,
        backgroundColor: colors.blue[600],
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.white,
    },
});
