/**
 * @file AIFooterBar.tsx
 * @description Footer bar chung cho các màn hình AI.
 *              Hiển thị bộ đếm số lần thực hiện và 1–2 nút hành động.
 *
 * Dùng cho: counting, measure, (và các feature AI tương tự).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing } from '@/styles';

export interface AIFooterAction {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'outline';
    disabled?: boolean;
    textColor?: string;
    borderColor?: string;
}

export interface AIFooterBarProps {
    /** Label bên trái (vd: "Số lần kiểm tra", "Số lần đo") */
    countLabel: string;
    /** Giá trị hiển thị bên phải */
    countValue: number;
    /** Danh sách nút, tối đa 2 */
    actions: [AIFooterAction] | [AIFooterAction, AIFooterAction];
}

export const AIFooterBar: React.FC<AIFooterBarProps> = ({ countLabel, countValue, actions }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.countRow}>
                <Text style={styles.countLabel}>{countLabel}</Text>
                <Text style={styles.countValue}>{countValue}</Text>
            </View>

            <View style={styles.buttonRow}>
                {actions.map((action, index) => (
                    <Button
                        key={index}
                        title={action.title}
                        variant={action.variant ?? 'primary'}
                        onPress={action.onPress}
                        disabled={action.disabled}
                        style={[
                            styles.flexButton,
                            action.borderColor ? { borderColor: action.borderColor } : undefined,
                        ]}
                        textStyle={action.textColor ? { color: action.textColor } : undefined}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 16,
    },
    countRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: 12,
    },
    countLabel: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    countValue: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: spacing.md,
        paddingBottom: 4,
    },
    flexButton: {
        flex: 1,
    },
});
