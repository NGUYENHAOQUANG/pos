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
import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
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
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    const [tempStartTime, setTempStartTime] = useState<Date | null>(null);
    const [tempEndTime, setTempEndTime] = useState<Date | null>(null);

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
                <View style={themedStyles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                themedStyles.container,
                                {
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}
                        >
                            <View style={staticStyles.header}>
                                <Text style={themedStyles.title}>Thêm lượt - Lần {turnIndex}</Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={staticStyles.closeButton}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <CloseIcon width={16} height={16} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={staticStyles.body}>
                                <View style={staticStyles.inputGroup}>
                                    <View style={staticStyles.labelWrapper}>
                                        <Text style={themedStyles.inputLabel}>Bắt đầu</Text>
                                        <RequiredDot />
                                    </View>
                                    <ModalAddTurn
                                        value={tempStartTime}
                                        onChange={setTempStartTime}
                                        placeholder="Chọn thời gian"
                                    />
                                </View>

                                <View style={staticStyles.inputGroup}>
                                    <View style={staticStyles.labelWrapper}>
                                        <Text style={themedStyles.inputLabel}>Kết thúc</Text>
                                        <RequiredDot />
                                    </View>
                                    <ModalAddTurn
                                        value={tempEndTime}
                                        onChange={setTempEndTime}
                                        placeholder="Chọn thời gian"
                                    />
                                </View>
                            </View>

                            <View style={staticStyles.footer}>
                                <Button
                                    title="Không"
                                    onPress={onClose}
                                    variant="outline"
                                    style={[staticStyles.cancelButton]}
                                    textStyle={themedStyles.cancelButtonTextOverride}
                                />
                                <Button
                                    title="Thêm lượt"
                                    onPress={handleConfirm}
                                    variant="primary"
                                    style={staticStyles.confirmButton}
                                />
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

// Static styles
const staticStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
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
    footer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    cancelButton: {
        flex: 1,
    },
    confirmButton: {
        flex: 1,
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingBottom: 40,
        },
        container: {
            width: '100%',
            backgroundColor: theme.background,
            borderRadius: 24,
            padding: spacing.lg,
        },
        title: {
            fontSize: typography.fontSize.lg,
            fontWeight: '700',
            color: theme.text,
            flex: 1,
        },
        inputLabel: {
            fontSize: typography.fontSize.base,
            color: theme.text,
            fontWeight: '400',
        },
        cancelButtonTextOverride: {
            color: theme.text,
        },
    });
