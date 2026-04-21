import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Button } from '@/shared/components/buttons/Button';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import { HarvestScaleMode } from '@/features/farm/types/harvestRecord.types';

export interface HarvestModeSelectModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectMode: (mode: HarvestScaleMode) => void;
}

export const HarvestModeSelectModal: React.FC<HarvestModeSelectModalProps> = ({
    visible,
    onClose,
    onSelectMode,
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
            {/* Header row: title + X close button */}
            <View style={styles.header}>
                <Text style={styles.title}>Xác nhận hình thức cân</Text>
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
            <Text style={styles.message}>Vui lòng chọn hình thức cân</Text>

            {/* Footer buttons */}
            <View style={styles.footer}>
                <Button
                    title="Thủ công"
                    onPress={() => {
                        onClose();
                        onSelectMode(HarvestScaleMode.MANUAL);
                    }}
                    variant="outline"
                    style={[styles.outlineButton, { marginRight: spacing.sm / 2 }]}
                    textStyle={styles.outlineButtonText}
                />
                <Button
                    title="Tự động"
                    onPress={() => {
                        onClose();
                        onSelectMode(HarvestScaleMode.AUTO);
                    }}
                    variant="outline"
                    style={[styles.outlineButton, { marginLeft: spacing.sm / 2 }]}
                    textStyle={styles.outlineButtonText}
                />
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
        outlineButtonText: {
            color: theme.text,
            fontSize: 15,
            fontWeight: '500',
        },
    });
