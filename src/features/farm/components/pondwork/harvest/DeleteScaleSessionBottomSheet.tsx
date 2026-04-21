import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import { Button } from '@/shared/components/buttons/Button';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePreventDoubleTap } from '@/shared/hooks/usePreventDoubleTap';

export interface DeleteScaleSessionBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}

export const DeleteScaleSessionBottomSheet: React.FC<DeleteScaleSessionBottomSheetProps> = ({
    visible,
    onClose,
    onConfirm,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const [safeConfirm, isConfirming] = usePreventDoubleTap(async () => {
        await onConfirm();
    });

    return (
        <AnimatedBottomSheet visible={visible} onClose={onClose}>
            <View style={styles.container}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerTitle} numberOfLines={2}>
                                Xác nhận xóa
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.body}>
                        <Text style={styles.bodyText}>
                            Bạn chắc chắn muốn xóa phiên cân này? Vui lòng kiểm tra kỹ trước khi xác
                            nhận
                        </Text>
                    </View>
                </View>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <View style={styles.buttonRow}>
                        <View style={{ flex: 1 }}>
                            <Button
                                title="Huỷ"
                                variant="outline"
                                onPress={onClose}
                                style={styles.cancelButtonOverride}
                                textStyle={styles.cancelButtonTextOverride}
                            />
                        </View>
                        <View style={{ width: 12 }} />
                        <View style={{ flex: 1 }}>
                            <Button
                                title="Xác nhận"
                                variant="primary"
                                onPress={safeConfirm}
                                loading={isConfirming}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </AnimatedBottomSheet>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '90%',
        },
        content: {
            paddingTop: spacing.md,
            paddingHorizontal: spacing.md,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: spacing.md,
        },
        headerLeft: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            marginRight: spacing.md,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.text,
        },
        closeButton: {
            padding: 4,
        },
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 100,
            borderWidth: 1,
        },
        statusReady: {
            backgroundColor: theme.green[50],
            borderColor: theme.green[200],
        },
        statusReadyText: {
            color: theme.green[600],
            fontSize: 12,
            fontWeight: '500',
        },
        body: {
            paddingBottom: spacing.lg,
        },
        bodyTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.text,
            marginBottom: 8,
        },
        bodyText: {
            fontSize: 15,
            color: theme.textSecondary,
            lineHeight: 22,
        },
        footer: {
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.xl,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        cancelButtonOverride: {
            borderColor: theme.defaultBorder,
            backgroundColor: theme.background,
        },
        cancelButtonTextOverride: {
            color: theme.text,
            fontSize: 15,
            fontWeight: '600',
        },
    });
