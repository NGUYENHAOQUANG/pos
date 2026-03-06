import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    InteractionManager,
    Animated,
    Dimensions,
    Pressable,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WheelPicker from 'react-native-wheely';
import { colors } from '@/styles';

const spacing = { sm: 8, md: 16, lg: 24 };
const typography = {
    fontSize: { sm: 12, base: 14, lg: 16, xl: 18, xxl: 24 },
    fontWeight: { medium: '500' as const, semibold: '600' as const, bold: '700' as const },
};

const ITEM_HEIGHT = 44;
const VISIBLE_REST = 2;
const PICKER_HEIGHT = ITEM_HEIGHT * (VISIBLE_REST * 2 + 1); // 220

// Format a number to 2-digit string
const formatNumber = (num: number): string => (num < 10 ? `0${num}` : `${num}`);

// Pre-computed option arrays (static, never changes)
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => formatNumber(i));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => formatNumber(i));
const SECOND_OPTIONS = Array.from({ length: 60 }, (_, i) => formatNumber(i));

interface TimePickerModalProps {
    visible: boolean;
    onClose: () => void;
    time: Date | null;
    onSelectTime: (date: Date) => void;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
    visible,
    onClose,
    time,
    onSelectTime,
}) => {
    const insets = useSafeAreaInsets();

    const defaultTime = time || new Date();
    const [selectedHour, setSelectedHour] = useState(defaultTime.getHours());
    const [selectedMinute, setSelectedMinute] = useState(defaultTime.getMinutes());
    const [selectedSecond, setSelectedSecond] = useState(defaultTime.getSeconds());

    // Force remount key - changes each time modal opens so FlatList re-initializes
    const [mountKey, setMountKey] = useState(0);

    // Defer picker rendering until after modal animation completes
    const [showPickers, setShowPickers] = useState(false);

    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            const t = time || new Date();
            setSelectedHour(t.getHours());
            setSelectedMinute(t.getMinutes());
            setSelectedSecond(t.getSeconds());
            setMountKey(prev => prev + 1);

            // Wait for modal animation to finish, then mount pickers
            const handle = InteractionManager.runAfterInteractions(() => {
                setShowPickers(true);
            });

            // Slide up animation
            slideAnim.setValue(SCREEN_HEIGHT);
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }).start();

            return () => handle.cancel();
        } else {
            setShowPickers(false);

            // Slide down animation
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, time, slideAnim]);

    const handleConfirm = useCallback(() => {
        const newDate = new Date();
        newDate.setHours(selectedHour);
        newDate.setMinutes(selectedMinute);
        newDate.setSeconds(selectedSecond, 0);
        onSelectTime(newDate);
        onClose();
    }, [selectedHour, selectedMinute, selectedSecond, onSelectTime, onClose]);

    const handleHourChange = useCallback((index: number) => setSelectedHour(index), []);
    const handleMinuteChange = useCallback((index: number) => setSelectedMinute(index), []);
    const handleSecondChange = useCallback((index: number) => setSelectedSecond(index), []);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalRoot}>
                {/* Overlay - tap to dismiss */}
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <Animated.View
                    style={[
                        styles.container,
                        {
                            paddingBottom: insets.bottom + 20,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.cancelText}>Hủy</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Chọn thời gian</Text>
                        <TouchableOpacity onPress={handleConfirm} style={styles.closeButton}>
                            <Text style={styles.confirmText}>Xong</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Time Picker Labels */}
                    <View style={styles.labelsContainer}>
                        <Text style={styles.columnLabel}>Giờ</Text>
                        <Text style={styles.columnLabel}>Phút</Text>
                        <Text style={styles.columnLabel}>Giây</Text>
                    </View>

                    {/* Time Picker Body */}
                    <View style={styles.pickerBody}>
                        {showPickers && (
                            <>
                                {/* Hour */}
                                <View style={styles.columnContainer}>
                                    <WheelPicker
                                        key={`hour-${mountKey}`}
                                        selectedIndex={selectedHour}
                                        options={HOUR_OPTIONS}
                                        onChange={handleHourChange}
                                        itemHeight={ITEM_HEIGHT}
                                        visibleRest={VISIBLE_REST}
                                        itemTextStyle={styles.pickerItemText}
                                        selectedIndicatorStyle={styles.selectedIndicator}
                                    />
                                </View>

                                {/* Separator : */}
                                <View style={styles.separatorContainer}>
                                    <Text style={styles.separatorText}>:</Text>
                                </View>

                                {/* Minute */}
                                <View style={styles.columnContainer}>
                                    <WheelPicker
                                        key={`minute-${mountKey}`}
                                        selectedIndex={selectedMinute}
                                        options={MINUTE_OPTIONS}
                                        onChange={handleMinuteChange}
                                        itemHeight={ITEM_HEIGHT}
                                        visibleRest={VISIBLE_REST}
                                        itemTextStyle={styles.pickerItemText}
                                        selectedIndicatorStyle={styles.selectedIndicator}
                                    />
                                </View>

                                {/* Separator : */}
                                <View style={styles.separatorContainer}>
                                    <Text style={styles.separatorText}>:</Text>
                                </View>

                                {/* Second */}
                                <View style={styles.columnContainer}>
                                    <WheelPicker
                                        key={`second-${mountKey}`}
                                        selectedIndex={selectedSecond}
                                        options={SECOND_OPTIONS}
                                        onChange={handleSecondChange}
                                        itemHeight={ITEM_HEIGHT}
                                        visibleRest={VISIBLE_REST}
                                        itemTextStyle={styles.pickerItemText}
                                        selectedIndicatorStyle={styles.selectedIndicator}
                                    />
                                </View>
                            </>
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    container: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: spacing.lg,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
        paddingBottom: spacing.sm,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    },
    closeButton: {
        padding: 4,
    },
    cancelText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    confirmText: {
        color: colors.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    labelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 36,
        marginBottom: 8,
    },
    pickerBody: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: PICKER_HEIGHT,
    },
    columnContainer: {
        flex: 1,
        height: PICKER_HEIGHT,
    },
    columnLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: '600',
        width: 60,
        textAlign: 'center',
    },
    separatorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 12,
        height: PICKER_HEIGHT,
    },
    separatorText: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text,
    },
    // Wheel picker styles
    pickerItemText: {
        fontSize: 20,
        color: colors.text,
        fontWeight: typography.fontWeight.semibold,
    },
    selectedIndicator: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: 0,
        backgroundColor: 'transparent',
    },
});
