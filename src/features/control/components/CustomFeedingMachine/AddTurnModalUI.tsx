import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    Dimensions,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, typography } from '@/styles';
import { Button } from '@/shared/components/buttons/Button';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import ModalAddTurn from './ModalAddTurn';
import { RequiredDot } from '@/shared/components/forms/Input';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddTurnModalUIProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (startTime: Date | null, endTime: Date | null) => void;
    turnIndex: number;
}

export function AddTurnModalUI({ visible, onClose, onConfirm, turnIndex }: AddTurnModalUIProps) {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    const [tempStartTime, setTempStartTime] = useState<Date | null>(null);
    const [tempEndTime, setTempEndTime] = useState<Date | null>(null);

    // Reset temp values when modal opens
    useEffect(() => {
        if (visible) {
            setTempStartTime(null);
            setTempEndTime(null);
        }
    }, [visible]);

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

    const handleConfirm = () => {
        onConfirm(tempStartTime, tempEndTime);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.container,
                                {
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}
                        >
                            {/* Header row: title + X close button */}
                            <View style={styles.header}>
                                <Text style={styles.title}>Thêm lượt - Lần {turnIndex}</Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={styles.closeButton}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <CloseIcon
                                        width={16}
                                        height={16}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Body Modal */}
                            <View style={styles.body}>
                                <View style={styles.inputGroup}>
                                    <View style={styles.labelWrapper}>
                                        <Text style={styles.inputLabel}>Bắt đầu</Text>
                                        <RequiredDot />
                                    </View>
                                    <ModalAddTurn
                                        value={tempStartTime}
                                        onChange={setTempStartTime}
                                        placeholder="Chọn thời gian"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <View style={styles.labelWrapper}>
                                        <Text style={styles.inputLabel}>Kết thúc</Text>
                                        <RequiredDot />
                                    </View>
                                    <ModalAddTurn
                                        value={tempEndTime}
                                        onChange={setTempEndTime}
                                        placeholder="Chọn thời gian"
                                    />
                                </View>
                            </View>

                            {/* Footer buttons */}
                            <View style={styles.footer}>
                                <Button
                                    title="Không"
                                    onPress={onClose}
                                    variant="outline"
                                    style={[styles.cancelButton, styles.cancelButtonOverride]}
                                    textStyle={styles.cancelButtonTextOverride}
                                />
                                <Button
                                    title="Thêm lượt"
                                    onPress={handleConfirm}
                                    variant="primary"
                                    style={styles.confirmButton}
                                />
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingBottom: 40,
    },
    container: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    closeButton: {
        marginLeft: spacing.sm,
    },
    body: {
        marginBottom: spacing.lg,
        gap: spacing.lg,
    },
    inputGroup: {
        gap: spacing.xs,
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputLabel: {
        fontSize: typography.fontSize.base,
        color: colors.text,
        fontWeight: '400',
    },
    footer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    cancelButton: {
        flex: 1,
    },
    cancelButtonOverride: {
        borderColor: colors.gray[300],
    },
    cancelButtonTextOverride: {
        color: colors.text,
    },
    confirmButton: {
        flex: 1,
    },
});
