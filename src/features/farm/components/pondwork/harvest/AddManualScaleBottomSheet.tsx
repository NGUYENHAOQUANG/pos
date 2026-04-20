import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Button } from '@/shared/components/buttons/Button';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import { Input } from '@/shared/components';

export interface AddManualScaleBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (weight: number) => void;
    batchNo: number;
    initialWeight?: number;
    title?: string;
    onDelete?: () => void;
}

export const AddManualScaleBottomSheet: React.FC<AddManualScaleBottomSheetProps> = ({
    visible,
    onClose,
    onConfirm,
    batchNo,
    initialWeight,
    title,
    onDelete,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const [weightStr, setWeightStr] = useState('');

    useEffect(() => {
        if (visible) {
            setWeightStr(initialWeight ? initialWeight.toString() : '');
        }
    }, [visible, initialWeight]);

    const handleConfirm = () => {
        const value = parseFloat(weightStr);
        if (!isNaN(value) && value > 0) {
            onConfirm(value);
        }
    };

    const isValid = !isNaN(parseFloat(weightStr)) && parseFloat(weightStr) > 0;
    const buttonTitle = isValid
        ? `Xác nhận cân #${batchNo} - ${parseFloat(weightStr)}kg`
        : `Xác nhận cân #${batchNo}`;

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onClose}
            overlayStyle={styles.overlay}
            containerStyle={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{title || 'Thêm mẻ cân'}</Text>
                    {title && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Sẵn sàng XN</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <CloseIcon width={24} height={24} color={theme.textTertiary} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Input
                    label="Sản lượng (kg)"
                    placeholder="Sản lượng (kg)"
                    placeholderTextColor={theme.textTertiary}
                    keyboardType="numeric"
                    value={weightStr}
                    onChangeText={setWeightStr}
                    required
                />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Button
                    title={buttonTitle}
                    onPress={handleConfirm}
                    disabled={!isValid}
                    fullWidth
                    style={styles.confirmBtn}
                />
                {onDelete && (
                    <Button
                        title="Xóa lịch sử cân"
                        onPress={onDelete}
                        style={{ borderColor: theme.error, backgroundColor: theme.error }}
                        textStyle={{ color: theme.white }}
                        fullWidth
                    />
                )}
            </View>
        </AnimatedBottomSheet>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingBottom: 16,
        },
        container: {
            width: '100%',
            backgroundColor: theme.background,
            borderRadius: 24,
            padding: spacing.lg,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.lg,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        title: {
            fontSize: typography.fontSize.lg,
            fontWeight: '700',
            color: theme.text,
        },
        badge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 16,
            backgroundColor: theme.green[50],
            borderWidth: 1,
            borderColor: theme.green[200],
        },
        badgeText: {
            fontSize: typography.fontSize.xs,
            color: theme.success,
            fontWeight: '600',
        },
        content: {
            marginBottom: spacing.md,
        },
        label: {
            fontSize: typography.fontSize.sm,
            fontWeight: '500',
            color: theme.text,
            marginBottom: 8,
        },
        requiredMark: {
            color: theme.error,
        },
        input: {
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: typography.fontSize.base,
            color: theme.text,
            backgroundColor: theme.background,
        },
        footer: {
            gap: 12,
        },
        confirmBtn: {
            backgroundColor: theme.primary,
        },
    });
