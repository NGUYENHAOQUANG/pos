import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import { DetailRow } from '@/features/material/components/DetailRow';
import { Button } from '@/shared/components/buttons/Button';
import { useAppTheme } from '@/styles/themeContext';
import { RequiredDot } from '@/shared/components/forms/Input';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScaleStatus } from './ScaleCard';
import { ScrollView } from 'react-native-gesture-handler';
import CheckCircleIcon from '@/assets/Icon/CheckCircleFilled.svg';
import WarningCircleIcon from '@/assets/Icon/WarningCircle.svg';

export interface ScaleActionBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    scaleStatus: ScaleStatus | null;
    scaleName?: string;
    scaleCode?: string;
    weight?: number;
    completedBatches?: number;
    onRevoke?: (reason: string) => void;
    onRevokeEmergency?: (reason: string) => void;
}

export const ScaleActionBottomSheet: React.FC<ScaleActionBottomSheetProps> = ({
    visible,
    onClose,
    scaleStatus,
    scaleName = 'Cân 01 — Sân A',
    scaleCode = 'SCD-001',
    weight = 0,
    completedBatches = 3,
    onRevoke,
    onRevokeEmergency,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const [revokeReason, setRevokeReason] = useState('');

    const handleClose = () => {
        onClose();
        setTimeout(() => setRevokeReason(''), 300);
    };

    const handleRevoke = () => {
        if (onRevoke) onRevoke(revokeReason);
        handleClose();
    };

    const handleRevokeEmergency = () => {
        if (onRevokeEmergency) onRevokeEmergency(revokeReason);
        handleClose();
    };

    if (!scaleStatus) return null;

    const renderHeaderTitle = () => scaleName;

    const renderHeaderBadge = () => {
        switch (scaleStatus) {
            case ScaleStatus.READY:
                return (
                    <View style={[styles.statusBadge, styles.statusReady]}>
                        <Text style={styles.statusReadyText}>Sẵn sàng XN</Text>
                    </View>
                );
            case ScaleStatus.WAITING:
                return (
                    <View style={[styles.statusBadge, styles.statusWaiting]}>
                        <Text style={styles.statusWaitingText}>Chờ ổn định</Text>
                    </View>
                );
            case ScaleStatus.DISCONNECTED:
                return (
                    <View style={[styles.statusBadge, styles.statusDisconnected]}>
                        <Text style={styles.statusDisconnectedText}>Mất kết nối</Text>
                    </View>
                );
            case ScaleStatus.EMPTY:
            default:
                return (
                    <View style={[styles.statusBadge, styles.statusEmpty]}>
                        <Text style={styles.statusEmptyText}>Trống</Text>
                    </View>
                );
        }
    };

    const renderTopInfo = () => {
        let statusText = `Trống (0.0 kg)`;
        if (scaleStatus === ScaleStatus.DISCONNECTED) {
            statusText = `Mất kết nối · 00:18`;
        }

        return (
            <View style={styles.infoCard}>
                <DetailRow label="Cân:" value={`${scaleName} · ${scaleCode}`} />
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Trạng thái:</Text>
                    <Text
                        style={[
                            styles.infoValue,
                            scaleStatus === ScaleStatus.DISCONNECTED && styles.errorText,
                        ]}
                    >
                        {statusText}
                    </Text>
                </View>
                <DetailRow
                    label="Mẻ đã cân:"
                    value={
                        scaleStatus === ScaleStatus.DISCONNECTED
                            ? 'Không có'
                            : `${completedBatches} mẻ hoàn tất`
                    }
                />
            </View>
        );
    };

    const renderAlertContent = () => {
        switch (scaleStatus) {
            case ScaleStatus.EMPTY:
                return (
                    <View style={[styles.alertBox, styles.alertBoxEmpty]}>
                        <WarningCircleIcon
                            width={20}
                            height={20}
                            color={theme.yellow[600]}
                            style={styles.alertIcon}
                        />
                        <View style={styles.alertTextContainer}>
                            <Text style={styles.alertTextEmpty}>
                                Sau thu hồi, cân sẽ ngắt khỏi phiên{'\n'}
                                Các mẻ đã xác nhận vẫn được giữ nguyên trong lịch sử
                            </Text>
                        </View>
                    </View>
                );
            case ScaleStatus.WAITING:
                return (
                    <View style={[styles.alertBox, styles.alertBoxYellow]}>
                        <WarningCircleIcon
                            width={20}
                            height={20}
                            color={theme.yellow[600]}
                            style={styles.alertIcon}
                        />
                        <View style={styles.alertTextContainer}>
                            <Text style={styles.alertTextYellow}>
                                Cân đang đọc {weight.toFixed(1)} kg — chưa ổn định{'\n'}
                                Chờ tín hiệu ổn định rồi xác nhận hoặc bỏ hàng khỏi cân trước khi
                                thu hồi
                            </Text>
                        </View>
                    </View>
                );
            case ScaleStatus.READY:
                return (
                    <View style={[styles.alertBox, styles.alertBoxRed]}>
                        <WarningCircleIcon
                            width={20}
                            height={20}
                            color={theme.red[600]}
                            style={styles.alertIcon}
                        />
                        <View style={styles.alertTextContainer}>
                            <Text style={styles.alertTextRed}>
                                Cân 02 đang ở trạng thái Sẵn sàng XN với mẻ chưa được xác nhận.
                                {'\n'}
                                Mẻ #5 chưa được xác nhận ({weight.toFixed(1)} kg){'\n'}
                                Xác nhận hoặc bỏ mẻ này trước, sau đó mới có thể thu hồi cân
                            </Text>
                        </View>
                    </View>
                );
            case ScaleStatus.DISCONNECTED:
                return (
                    <View style={[styles.alertBox, styles.alertBoxRed]}>
                        <WarningCircleIcon
                            width={20}
                            height={20}
                            color={theme.red[600]}
                            style={styles.alertIcon}
                        />
                        <View style={styles.alertTextContainer}>
                            <Text style={styles.alertTextRed}>
                                Cân 04 mất kết nối. Bạn có thể thu hồi để giải phóng slot cân.{'\n'}
                                Dữ liệu realtime không khả dụng{'\n'}
                                Thu hồi sẽ được ghi log. Nếu cân kết nối lại sau đó sẽ không còn
                                trong phiên này.
                            </Text>
                        </View>
                    </View>
                );
        }
    };

    const renderActionList = () => {
        if (scaleStatus === ScaleStatus.WAITING) {
            return (
                <View style={styles.actionListContainer}>
                    <Text style={styles.actionListTitle}>
                        Thu hồi khi cân đang có hàng sẽ gây mất dữ liệu mẻ cân. Thực hiện một trong
                        hai:
                    </Text>
                    <View style={styles.actionListItem}>
                        <CheckCircleIcon width={20} height={20} />
                        <Text style={styles.actionListText}>
                            Chờ ổn định <Text style={styles.actionListArrow}>→</Text> rồi xác nhận
                        </Text>
                    </View>
                    <View style={styles.actionListItem}>
                        <CheckCircleIcon width={20} height={20} />
                        <Text style={styles.actionListText}>
                            Bỏ hàng khỏi cân <Text style={styles.actionListArrow}>→</Text> cân về
                            Trống <Text style={styles.actionListArrow}>→</Text> thu hồi
                        </Text>
                    </View>
                </View>
            );
        }

        if (scaleStatus === ScaleStatus.READY) {
            return (
                <View style={styles.actionListContainer}>
                    <Text style={styles.actionListTitle}>Thao tác cần</Text>
                    <View style={styles.actionListItem}>
                        <CheckCircleIcon width={20} height={20} />
                        <Text style={styles.actionListText}>
                            Xác nhận mẻ #5 <Text style={styles.actionListArrow}>→</Text>{' '}
                            {weight.toFixed(1)} kg
                        </Text>
                    </View>
                    <View style={styles.actionListItem}>
                        <CheckCircleIcon width={20} height={20} />
                        <Text style={styles.actionListText}>
                            Hủy mẻ #5 (cân về trạng thái Trống)
                        </Text>
                    </View>
                </View>
            );
        }

        return null;
    };

    const renderRevokeReasonInput = () => {
        if (scaleStatus === ScaleStatus.EMPTY || scaleStatus === ScaleStatus.DISCONNECTED) {
            return (
                <View style={styles.reasonContainer}>
                    <View style={styles.reasonLabelWrapper}>
                        <Text style={styles.reasonLabel}>Lý do thu hồi</Text>
                        <RequiredDot />
                    </View>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Nhập lý do thu hồi"
                        placeholderTextColor={theme.textTertiary}
                        multiline
                        textAlignVertical="top"
                        value={revokeReason}
                        onChangeText={setRevokeReason}
                    />
                </View>
            );
        }
        return null;
    };

    const renderButtons = () => {
        if (scaleStatus === ScaleStatus.DISCONNECTED) {
            return (
                <View style={styles.buttonRow}>
                    <View style={{ flex: 1 }}>
                        <Button title="Hủy" variant="outline" onPress={handleClose} />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={{ flex: 1 }}>
                        <Button
                            title="Thu hồi khẩn cấp"
                            variant="primary"
                            onPress={handleRevokeEmergency}
                        />
                    </View>
                </View>
            );
        }

        if (scaleStatus === ScaleStatus.EMPTY) {
            return (
                <View style={styles.buttonRow}>
                    <Button title="Thu hồi" variant="outline" fullWidth onPress={handleRevoke} />
                </View>
            );
        }

        return (
            <View style={styles.buttonRow}>
                <Button title="Đã hiểu" variant="outline" fullWidth onPress={handleClose} />
            </View>
        );
    };

    return (
        <AnimatedBottomSheet visible={visible} onClose={handleClose}>
            <View style={styles.container}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerTitle}>{renderHeaderTitle()}</Text>
                            {renderHeaderBadge()}
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {renderTopInfo()}
                        {renderAlertContent()}
                        {renderActionList()}
                        {renderRevokeReasonInput()}
                    </ScrollView>
                </View>

                {/* Footer Buttons */}
                <View style={styles.footer}>{renderButtons()}</View>
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
            marginBottom: spacing.md,
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
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
        statusWaiting: {
            backgroundColor: theme.yellow[50],
            borderColor: theme.yellow[200],
        },
        statusWaitingText: {
            color: theme.yellow[600],
            fontSize: 12,
            fontWeight: '500',
        },
        statusDisconnected: {
            backgroundColor: theme.red[50],
            borderColor: theme.red[200],
        },
        statusDisconnectedText: {
            color: theme.red[600],
            fontSize: 12,
            fontWeight: '500',
        },
        statusEmpty: {
            backgroundColor: theme.backgroundSecondary,
            borderColor: theme.defaultBorder,
        },
        statusEmptyText: {
            color: theme.textSecondary,
            fontSize: 12,
            fontWeight: '500',
        },
        infoCard: {
            backgroundColor: theme.background,
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            marginBottom: 6,
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 8,
        },
        infoLabel: {
            fontSize: 14,
            color: theme.textSecondary,
        },
        infoValue: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
        },
        errorText: {
            color: theme.red[600],
        },
        alertBox: {
            flexDirection: 'row',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            marginBottom: 16,
            alignItems: 'flex-start',
        },
        alertBoxEmpty: {
            backgroundColor: theme.background,
            borderColor: theme.defaultBorder,
        },
        alertBoxGreen: {
            backgroundColor: theme.green[50],
            borderColor: theme.green[200],
        },
        alertBoxYellow: {
            backgroundColor: theme.yellow[50],
            borderColor: theme.yellow[200],
        },
        alertBoxRed: {
            backgroundColor: theme.red[50],
            borderColor: theme.red[200],
        },
        alertIcon: {
            marginRight: 8,
            marginTop: 2,
        },
        alertTextContainer: {
            flex: 1,
        },
        alertTextEmpty: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
            lineHeight: 20,
        },
        alertTextGreen: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.green[600],
            lineHeight: 20,
        },
        alertTextYellow: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.yellow[600],
            lineHeight: 20,
        },
        alertTextRed: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.red[600],
            lineHeight: 20,
        },
        actionListContainer: {
            marginBottom: 16,
        },
        actionListTitle: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
            marginBottom: 8,
        },
        actionListItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        actionListText: {
            fontSize: 15,
            color: theme.textSecondary,
            marginLeft: 8,
        },
        actionListArrow: {
            color: theme.textTertiary,
        },
        reasonContainer: {
            marginBottom: 8,
        },
        reasonLabelWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        reasonLabel: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
        },
        textInput: {
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            borderRadius: 8,
            padding: 12,
            height: 100,
            fontSize: 15,
            color: theme.text,
            backgroundColor: theme.background,
        },
        footer: {
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.xl,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
    });
