import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, spacing } from '@/styles';
import { formatCurrency } from '@/features/material/utils/formatCurrency';

interface ExportWarehouseFooterProps {
    totalAmount: number;
    onSaveDraft: () => void;
    onSubmit: () => void;
}

export const ExportWarehouseFooter: React.FC<ExportWarehouseFooterProps> = ({
    totalAmount,
    onSaveDraft,
    onSubmit,
}) => {
    return (
        <View style={styles.footer}>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
            </View>
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.draftButton} onPress={onSaveDraft}>
                    <Text style={styles.draftButtonText}>Lưu Nháp</Text>
                </TouchableOpacity>
                <View style={styles.buttonSpacer} />
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
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
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
    currencySymbol: {
        textDecorationLine: 'underline',
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonSpacer: {
        width: spacing.md,
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
        fontSize: 14,
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
        fontSize: 16,
        fontWeight: '400',
        color: colors.white,
    },
});
