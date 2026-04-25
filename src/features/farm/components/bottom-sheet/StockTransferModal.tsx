import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    Platform,
    FlatList,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Text } from '@/shared/components/typography/Text';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Button } from '@/shared/components/buttons/Button';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import { usePreventDoubleTap } from '@/shared/hooks/usePreventDoubleTap';
import { formatNumber } from '@/features/farm/utils/numberUtils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface PondConfirmItem {
    id: string;
    label: string;
    quantity: number;
}

interface StockTransferConfirmationModalProps {
    visible: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    receivingPonds?: PondConfirmItem[];
    cultureDays?: number;
    currentPondName?: string;
}

export const StockTransferConfirmationModal: React.FC<StockTransferConfirmationModalProps> = ({
    visible,
    onConfirm,
    onCancel,
    receivingPonds = [],
    cultureDays = 0,
    currentPondName,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    // Slide-up animation
    useEffect(() => {
        if (visible) {
            slideAnim.setValue(SCREEN_HEIGHT);
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    const [safeConfirm, isConfirming] = usePreventDoubleTap(() => {
        return new Promise<void>(resolve => {
            setTimeout(() => {
                const result = onConfirm();
                if (result && typeof (result as Promise<void>).then === 'function') {
                    (result as Promise<void>).then(resolve, resolve);
                } else {
                    resolve();
                }
            }, 300);
        });
    }, 1000);

    const confirmationText = currentPondName
        ? `Chu kỳ  ${currentPondName} sẽ kết thúc. Bạn có chắc muốn sang ao không?`
        : 'Chu kỳ ao sẽ kết thúc. Bạn có chắc muốn sang ao không?';

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}
            >
                {/* Clickable backdrop that doesn't wrap content */}
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onCancel}
                />
                <Animated.View
                    style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.titleWrapper}>
                            <Text style={styles.title}>Xác nhận sang ao</Text>
                        </View>
                        <TouchableOpacity
                            onPress={onCancel}
                            style={styles.closeButton}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <CloseIcon width={20} height={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.subtitle}>Sau khi thực hiện, không thể chỉnh sửa.</Text>

                        <FlatList
                            data={receivingPonds}
                            keyExtractor={item => item.id}
                            style={styles.pondListScroll}
                            showsVerticalScrollIndicator={receivingPonds.length > 6}
                            bounces={false}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item: pond }) => {
                                let code = pond.label;
                                let name = '';
                                if (pond.label.includes(' - ')) {
                                    const parts = pond.label.split(' - ');
                                    code = parts[0];
                                    name = parts[1];
                                } else if (pond.label.includes(' -')) {
                                    const parts = pond.label.split(' -');
                                    code = parts[0];
                                    name = parts[1];
                                }
                                return (
                                    <View style={styles.pondCard}>
                                        <View style={styles.pondCardLeft}>
                                            <Text style={styles.pondCardCode}>{code}</Text>
                                            {!!name && (
                                                <Text style={styles.pondCardName}>{name}</Text>
                                            )}
                                        </View>
                                        <View style={styles.pondCardRight}>
                                            <Text style={styles.pondCardQuantity}>
                                                {formatNumber(pond.quantity.toString())}
                                            </Text>
                                            <Text style={styles.pondCardUnit}> con</Text>
                                        </View>
                                    </View>
                                );
                            }}
                            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                        />
                        {/* Shrimp Status */}
                        <Text style={styles.sectionSubtitle}>Tình trạng tôm</Text>
                        <View style={styles.statusBox}>
                            <Text style={styles.statusLabel}>Ngày nuôi</Text>
                            <Text style={styles.statusValue}>{cultureDays} ngày</Text>
                        </View>

                        {/* Confirmation message */}
                        <Text style={styles.confirmationText}>{confirmationText}</Text>
                    </View>

                    {/* Footer - pinned to bottom */}
                    <View style={[styles.footer, { paddingBottom: 8 }]}>
                        <Button
                            title="Không"
                            variant="outline"
                            onPress={onCancel}
                            style={[styles.footerButton, styles.cancelButtonOverride]}
                            textStyle={styles.cancelButtonTextOverride}
                        />
                        <Button
                            title="Sang ao"
                            variant="primary"
                            onPress={safeConfirm}
                            loading={isConfirming}
                            disabled={isConfirming}
                            style={styles.footerButton}
                        />
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const getStyles = (colors: Colors) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        container: {
            width: '100%',
            backgroundColor: colors.background,
            borderTopLeftRadius: borderRadius.md,
            borderTopRightRadius: borderRadius.md,
            paddingTop: 12,
            maxHeight: '90%',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
        },
        titleWrapper: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        title: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            flex: 1,
        },
        closeButton: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        content: {
            gap: 6,
            paddingTop: 12,
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.lg,
        },
        subtitle: {
            fontSize: 16,
            fontWeight: '400',
            color: colors.textSecondary,
            marginTop: 12,
        },
        sectionSubtitle: {
            fontSize: 16,
            fontWeight: '400',
            color: colors.textSecondary,
            marginTop: 10,
        },
        pondListScroll: {
            maxHeight: 260,
        },
        pondCard: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 8,
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
        },
        pondCardLeft: {
            flex: 1,
        },
        pondCardCode: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
        },
        pondCardName: {
            fontSize: 14,
            fontWeight: '400',
            color: colors.textSecondary,
            marginTop: 2,
        },
        pondCardRight: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        pondCardQuantity: {
            fontSize: 14,
            fontWeight: '700',
            color: colors.text,
        },
        pondCardUnit: {
            fontSize: 14,
            fontWeight: '400',
            color: colors.textSecondary,
        },
        statusBox: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 8,
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
        },
        statusLabel: {
            fontSize: 14,
            fontWeight: '400',
            color: colors.textSecondary,
        },
        statusValue: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        confirmationText: {
            fontSize: 16,
            fontWeight: '400',
            color: colors.textSecondary,
            marginTop: 16,
        },
        footer: {
            flexDirection: 'row',
            gap: spacing.sm,
            paddingTop: spacing.md,
            paddingHorizontal: spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.defaultBorder,
            backgroundColor: colors.background,
        },
        footerButton: {
            flex: 1,
        },
        cancelButtonOverride: {
            borderColor: colors.border,
            backgroundColor: colors.background,
            borderWidth: 1,
        },
        cancelButtonTextOverride: {
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
        },
    });
