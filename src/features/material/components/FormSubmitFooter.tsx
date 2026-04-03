import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing } from '@/styles';
import { Button } from '@/shared/components/buttons/Button';

interface FormSubmitFooterProps {
    /** Content rendered above the button row (e.g. total amount) */
    header?: React.ReactNode;
    onSaveDraft: () => void;
    onSubmit: () => void;
    disabled?: boolean;
    isSavingDraft?: boolean;
    isSubmitting?: boolean;
    draftTitle?: string;
    submitTitle?: string;
}

export const FormSubmitFooter: React.FC<FormSubmitFooterProps> = React.memo(
    ({
        header,
        onSaveDraft,
        onSubmit,
        disabled = false,
        isSavingDraft = false,
        isSubmitting = false,
        draftTitle = 'Lưu Nháp',
        submitTitle = 'Gửi Phiếu',
    }) => {
        const insets = useSafeAreaInsets();
        const safeBottom = Math.max(insets.bottom, 12);
        const theme = useAppTheme();
        const styles = getStyles(theme);

        return (
            <View style={[styles.footer, { paddingBottom: safeBottom }]}>
                {header && <View style={styles.headerRow}>{header}</View>}
                <View style={styles.buttonRow}>
                    <View style={styles.buttonWrapper}>
                        <Button
                            title={draftTitle}
                            variant="outline"
                            onPress={onSaveDraft}
                            disabled={disabled || isSubmitting}
                            loading={isSavingDraft}
                        />
                    </View>
                    <View style={styles.buttonSpacer} />
                    <View style={styles.buttonWrapper}>
                        <Button
                            title={submitTitle}
                            variant="primary"
                            onPress={onSubmit}
                            disabled={isSavingDraft}
                            loading={isSubmitting}
                        />
                    </View>
                </View>
            </View>
        );
    }
);

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        footer: {
            backgroundColor: theme.background,
            paddingTop: 12,
            paddingHorizontal: spacing.md,
            borderTopWidth: 1,
            borderTopColor: theme.border,
        },
        headerRow: {
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
