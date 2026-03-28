import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/styles';
import { DetailRow } from '@/features/material/components/DetailRow';
import { CurrencyValue } from '@/features/material/components/CurrencyValue';
import { Button } from '@/shared/components/buttons/Button';

interface ExportWarehouseFooterProps {
    totalAmount: number;
    onSaveDraft: () => void;
    onSubmit: () => void;
    disabled?: boolean;
    isSavingDraft?: boolean;
    isSubmitting?: boolean;
}

export const ExportWarehouseFooter: React.FC<ExportWarehouseFooterProps> = ({
    totalAmount,
    onSaveDraft,
    onSubmit,
    disabled = false,
    isSavingDraft = false,
    isSubmitting = false,
}) => {
    const insets = useSafeAreaInsets();
    const safeBottom = Math.max(insets.bottom, 12);

    return (
        <View style={[styles.footer, { paddingBottom: safeBottom }]}>
            <DetailRow
                label="Tổng tiền:"
                value={<CurrencyValue value={totalAmount} valueStyle={{ fontWeight: '700' }} />}
                style={styles.totalRow}
            />
            <View style={styles.buttonRow}>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Lưu Nháp"
                        variant="outline"
                        onPress={onSaveDraft}
                        disabled={disabled || isSubmitting}
                        loading={isSavingDraft}
                    />
                </View>
                <View style={styles.buttonSpacer} />
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Gửi Phiếu"
                        variant="primary"
                        onPress={onSubmit}
                        disabled={isSavingDraft}
                        loading={isSubmitting}
                    />
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
        marginBottom: spacing.sm,
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
