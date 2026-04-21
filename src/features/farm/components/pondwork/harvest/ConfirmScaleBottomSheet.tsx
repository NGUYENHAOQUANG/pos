import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import { DetailRow } from '@/features/material/components/DetailRow';
import { Button } from '@/shared/components/buttons/Button';
import { HarvestSuccessHeader } from './HarvestSuccessHeader';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface ConfirmScaleBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onConfirm?: () => Promise<void> | void;
    scaleName?: string;
    weight?: number;
    batchNumber?: number;
    totalAfterConfirm?: number;
}

export const ConfirmScaleBottomSheet: React.FC<ConfirmScaleBottomSheetProps> = ({
    visible,
    onClose,
    onConfirm,
    scaleName = '--',
    weight = 0,
    batchNumber = 0,
    totalAfterConfirm = 0,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!isConfirmed) {
            if (onConfirm) {
                setIsSubmitting(true);
                try {
                    await onConfirm();
                    setIsConfirmed(true);
                } catch (_error) {
                    handleClose();
                } finally {
                    setIsSubmitting(false);
                }
            } else {
                setIsConfirmed(true);
            }
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => setIsConfirmed(false), 300);
    };

    React.useEffect(() => {
        if (!visible) {
            setIsConfirmed(false);
        }
    }, [visible]);

    return (
        <AnimatedBottomSheet visible={visible} onClose={handleClose}>
            <View style={styles.container}>
                <View style={[styles.content, isConfirmed && { paddingBottom: 0 }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerTitle} numberOfLines={2}>
                                {scaleName}
                            </Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusBadgeText}>Sẵn sàng XN</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    {isConfirmed ? (
                        <View style={styles.successContainer}>
                            <HarvestSuccessHeader
                                batchNumber={batchNumber}
                                weight={weight}
                                scaleName={scaleName}
                                time={new Date().toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            />

                            <View style={styles.successInfoCard}>
                                <Text style={styles.successCardTitle}>Tổng sản lượng phiên</Text>
                                <DetailRow
                                    label={`Sau mẻ #${batchNumber}`}
                                    value={totalAfterConfirm.toFixed(1)}
                                    unit="kg"
                                />
                            </View>

                            <View style={styles.bottomBarOutline}>
                                <Button
                                    variant="outline"
                                    title="Quay lại danh sách cân"
                                    onPress={handleClose}
                                />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.contentContainer}>
                            {/* Weight Card */}
                            <View style={styles.weightCard}>
                                <Text style={styles.weightLabel}>Trọng lượng ổn định</Text>
                                <Text style={styles.weightValue}>{weight.toFixed(1)}</Text>
                                <Text style={styles.weightUnit}>kg</Text>
                            </View>

                            {/* Summary Info Card */}
                            <View style={styles.infoCard}>
                                <DetailRow label="Mẻ" value={`#${batchNumber}`} />
                                <DetailRow
                                    label="Tổng sau xác nhận"
                                    value={totalAfterConfirm.toFixed(1)}
                                    unit="kg"
                                />
                            </View>
                        </View>
                    )}
                </View>

                {/* Buttons */}
                {!isConfirmed && (
                    <ButtonBarFarm
                        primaryTitle={`Xác nhận mẻ #${batchNumber} - ${weight.toFixed(1)}kg`}
                        onPrimaryPress={handleConfirm}
                        style={styles.buttonBar}
                        isLoading={isSubmitting}
                    />
                )}
            </View>
        </AnimatedBottomSheet>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
        },
        content: {
            paddingHorizontal: spacing.md,
            paddingVertical: 12,
            paddingBottom: spacing.sm,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
        },
        headerLeft: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.sm,
            marginRight: spacing.md,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.text,
        },
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: theme.green[200],
            backgroundColor: theme.green[50],
        },
        statusBadgeText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.green[600],
        },
        closeButton: {
            padding: 4,
            marginRight: -4,
        },
        contentContainer: {
            gap: spacing.sm,
            paddingVertical: 12,
        },
        weightCard: {
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            paddingVertical: spacing.sm,
            alignItems: 'center',
            justifyContent: 'center',
        },
        weightLabel: {
            fontSize: 12,
            fontWeight: '400',
            color: theme.textSecondary,
            marginBottom: spacing.sm,
        },
        weightValue: {
            fontSize: 64,
            fontWeight: '600',
            color: theme.text,
            lineHeight: 70,
        },
        weightUnit: {
            fontSize: 20,
            color: theme.textSecondary,
        },
        infoCard: {
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            padding: 12,
            gap: spacing.sm,
        },
        buttonBar: {
            borderTopWidth: 0,
            paddingTop: spacing.sm,
        },
        successContainer: {
            alignItems: 'center',
            paddingTop: spacing.lg,
            paddingHorizontal: spacing.sm,
            gap: 8,
        },
        successInfoCard: {
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            padding: 12,
            width: '100%',
        },
        successCardTitle: {
            fontSize: 14,
            color: theme.textSecondary,
            marginBottom: spacing.xs,
        },
        bottomBarOutline: {
            width: '100%',
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
        },
    });
