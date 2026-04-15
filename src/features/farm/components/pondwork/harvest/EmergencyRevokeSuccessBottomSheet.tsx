import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import { Button } from '@/shared/components/buttons/Button';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CheckCircleIcon from '@/assets/Icon/IconFarm/CheckCircle.svg';
import { DetailRow } from '@/features/material/components/DetailRow';

export interface EmergencyRevokeSuccessBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    scaleName: string;
}

export const EmergencyRevokeSuccessBottomSheet: React.FC<
    EmergencyRevokeSuccessBottomSheetProps
> = ({ visible, onClose, scaleName }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const scaleShortName = scaleName.split('—')[0].trim();

    return (
        <AnimatedBottomSheet visible={visible} onClose={onClose}>
            <View style={styles.container}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerTitle}>{scaleName}</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Mất kết nối</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Success Icon & Titles */}
                        <View style={styles.successSection}>
                            <CheckCircleIcon width={124} height={124} />
                            <Text style={styles.successTitle}>
                                Đã thu hồi {scaleShortName} (khẩn cấp)
                            </Text>
                            <Text style={styles.successSubtitle}>
                                {scaleName} đã bị thu hồi. Hành động đã được ghi log để admin
                                review.
                            </Text>
                        </View>

                        {/* Info Block */}
                        <View style={styles.infoBlock}>
                            <View style={styles.rowSpacing}>
                                <DetailRow
                                    label="Hành động:"
                                    value="Đã ghi log"
                                    labelStyle={styles.detailLabel}
                                    valueStyle={styles.detailValue}
                                />
                            </View>
                            <View style={styles.rowSpacing}>
                                <DetailRow
                                    label="Slot cân:"
                                    value="Đã giải phóng"
                                    labelStyle={styles.detailLabel}
                                    valueStyle={styles.detailValue}
                                />
                            </View>
                            <DetailRow
                                label="Lịch sử mẻ:"
                                value="Giữ nguyên"
                                labelStyle={styles.detailLabel}
                                valueStyle={styles.detailValue}
                            />
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.footer}>
                    <Button title="Xong" variant="outline" fullWidth onPress={onClose} />
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
        scrollContent: {
            paddingBottom: spacing.lg,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg,
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        headerTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 100,
            backgroundColor: theme.red[50],
            borderWidth: 1,
            borderColor: theme.red[200],
        },
        statusText: {
            color: theme.red[600],
            fontSize: 12,
            fontWeight: '500',
        },
        closeButton: {
            padding: 4,
        },
        successSection: {
            alignItems: 'center',
            marginBottom: 8,
            paddingHorizontal: spacing.sm,
        },
        successTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
            marginTop: spacing.md,
            marginBottom: spacing.xs,
            textAlign: 'center',
        },
        successSubtitle: {
            fontSize: 16,
            fontWeight: '400',
            color: theme.textSecondary,
            textAlign: 'center',
        },
        infoBlock: {
            backgroundColor: theme.backgroundSecondary,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
        },
        rowSpacing: {
            paddingBottom: 8,
        },
        detailLabel: {
            fontSize: 14,
            fontWeight: '400',
        },
        detailValue: {
            fontSize: 14,
            fontWeight: '500',
        },
        footer: {
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.lg,
            paddingTop: spacing.md,
        },
    });
