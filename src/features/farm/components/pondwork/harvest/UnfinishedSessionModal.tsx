import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Button } from '@/shared/components/buttons/Button';
import { spacing, typography } from '@/styles';
import { Colors } from '@/styles/colors';
import { useAppTheme } from '@/styles/themeContext';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';

export interface UnfinishedSessionModalProps {
    visible: boolean;
    onClose: () => void;
    onGoToSession?: () => void;
}

export const UnfinishedSessionModal: React.FC<UnfinishedSessionModalProps> = ({
    visible,
    onClose,
    onGoToSession,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onClose}
            overlayStyle={styles.overlay}
            containerStyle={styles.container}
        >
            {/* Header row */}
            <View style={styles.header}>
                <Text style={styles.title}>Phiên cân đang diễn ra</Text>
                <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <CloseIcon width={16} height={16} color={theme.textTertiary} />
                </TouchableOpacity>
            </View>

            {/* Message body */}
            <Text style={styles.message}>
                Đang có một phiên cân thu hoạch dang dở. Vui lòng kết thúc hoặc xoá phiên cân hiện
                tại trước khi tiếp tục thao tác.
            </Text>

            {/* Footer buttons */}
            <View style={styles.footer}>
                <Button
                    title="Huỷ"
                    onPress={onClose}
                    variant="outline"
                    style={[styles.outlineButton, { marginRight: spacing.sm / 2 }]}
                    textStyle={styles.outlineButtonText}
                />
                {onGoToSession && (
                    <Button
                        title="Thu hoạch"
                        onPress={() => {
                            onClose();
                            onGoToSession();
                        }}
                        variant="primary"
                        style={[styles.primaryButton, { marginLeft: spacing.sm / 2 }]}
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
            marginBottom: spacing.sm,
        },
        title: {
            fontSize: typography.fontSize.lg,
            fontWeight: '700',
            color: theme.text,
            flex: 1,
        },
        closeButton: {
            marginLeft: spacing.sm,
        },
        message: {
            fontSize: typography.fontSize.base,
            fontWeight: '400',
            color: theme.textSecondary,
            lineHeight: 22,
            marginBottom: spacing.lg,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        outlineButton: {
            flex: 1,
            borderColor: theme.defaultBorder,
            backgroundColor: theme.background,
        },
        primaryButton: {
            flex: 1,
        },
        outlineButtonText: {
            color: theme.text,
            fontSize: 15,
            fontWeight: '500',
        },
    });
