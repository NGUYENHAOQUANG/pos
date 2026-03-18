import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    Pressable,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScrollPicker from 'react-native-wheel-scrollview-picker';
import { colors } from '@/styles';

const spacing = { sm: 8, md: 16, lg: 24 };
const typography = {
    fontSize: { sm: 12, base: 14, lg: 16, xl: 18, xxl: 24 },
    fontWeight: { medium: '500' as const, semibold: '600' as const, bold: '700' as const },
};

const ITEM_HEIGHT = 44;
const VISIBLE_COUNT = 5; // Total visible items (2 above + 1 selected + 2 below)
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

// Format a number to 2-digit string
const formatNumber = (num: number): string => (num < 10 ? `0${num}` : `${num}`);

// Pre-computed option arrays (static, never changes)
const HOUR_DATA = Array.from({ length: 24 }, (_, i) => formatNumber(i));
const MINUTE_DATA = Array.from({ length: 60 }, (_, i) => formatNumber(i));
const SECOND_DATA = Array.from({ length: 60 }, (_, i) => formatNumber(i));

interface TimePickerModalProps {
    visible: boolean;
    onClose: () => void;
    time: Date | null;
    onSelectTime: (date: Date) => void;
    /** Whether to show seconds column. Default: true */
    showSeconds?: boolean;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
    visible,
    onClose,
    time,
    onSelectTime,
    showSeconds = true,
}) => {
    const insets = useSafeAreaInsets();

    const defaultTime = time || new Date();
    const [selectedHour, setSelectedHour] = useState(defaultTime.getHours());
    const [selectedMinute, setSelectedMinute] = useState(defaultTime.getMinutes());
    const [selectedSecond, setSelectedSecond] = useState(
        showSeconds ? defaultTime.getSeconds() : 0
    );

    // Force remount key - changes each time modal opens
    const [mountKey, setMountKey] = useState(0);

    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            const t = time || new Date();
            setSelectedHour(t.getHours());
            setSelectedMinute(t.getMinutes());
            setSelectedSecond(showSeconds ? t.getSeconds() : 0);
            setMountKey(prev => prev + 1);

            // Slide up animation
            slideAnim.setValue(SCREEN_HEIGHT);
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            // Slide down animation
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, time, slideAnim, showSeconds]);

    const handleConfirm = useCallback(() => {
        const newDate = new Date();
        newDate.setHours(selectedHour);
        newDate.setMinutes(selectedMinute);
        newDate.setSeconds(selectedSecond, 0);
        onSelectTime(newDate);
        onClose();
    }, [selectedHour, selectedMinute, selectedSecond, onSelectTime, onClose]);

    /** Render each item inside the ScrollPicker */
    const renderItem = useCallback(
        (data: string, _index: number, isSelected: boolean) => (
            <View style={styles.pickerItem}>
                <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
                    {data}
                </Text>
            </View>
        ),
        []
    );

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
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
                        <View style={styles.labelColumn}>
                            <Text style={styles.columnLabel}>Giờ</Text>
                        </View>
                        <View style={styles.labelSpacer} />
                        <View style={styles.labelColumn}>
                            <Text style={styles.columnLabel}>Phút</Text>
                        </View>
                        {showSeconds && (
                            <>
                                <View style={styles.labelSpacer} />
                                <View style={styles.labelColumn}>
                                    <Text style={styles.columnLabel}>Giây</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Time Picker Body */}
                    <View style={styles.pickerBody}>
                        {/* Hour */}
                        <View style={styles.columnContainer}>
                            <ScrollPicker
                                key={`hour-${mountKey}`}
                                dataSource={HOUR_DATA}
                                selectedIndex={selectedHour}
                                onValueChange={(
                                    _data: string | undefined,
                                    selectedIndex: number
                                ) => {
                                    setSelectedHour(selectedIndex);
                                }}
                                wrapperHeight={PICKER_HEIGHT}
                                wrapperBackground="transparent"
                                itemHeight={ITEM_HEIGHT}
                                highlightColor={colors.gray[200]}
                                highlightBorderWidth={1}
                                renderItem={renderItem}
                            />
                        </View>

                        {/* Separator : */}
                        <View style={styles.separatorContainer}>
                            <Text style={styles.separatorText}>:</Text>
                        </View>

                        {/* Minute */}
                        <View style={styles.columnContainer}>
                            <ScrollPicker
                                key={`minute-${mountKey}`}
                                dataSource={MINUTE_DATA}
                                selectedIndex={selectedMinute}
                                onValueChange={(
                                    _data: string | undefined,
                                    selectedIndex: number
                                ) => {
                                    setSelectedMinute(selectedIndex);
                                }}
                                wrapperHeight={PICKER_HEIGHT}
                                wrapperBackground="transparent"
                                itemHeight={ITEM_HEIGHT}
                                highlightColor={colors.gray[200]}
                                highlightBorderWidth={1}
                                renderItem={renderItem}
                            />
                        </View>

                        {/* Separator : (seconds) */}
                        {showSeconds && (
                            <View style={styles.separatorContainer}>
                                <Text style={styles.separatorText}>:</Text>
                            </View>
                        )}

                        {/* Second */}
                        {showSeconds && (
                            <View style={styles.columnContainer}>
                                <ScrollPicker
                                    key={`second-${mountKey}`}
                                    dataSource={SECOND_DATA}
                                    selectedIndex={selectedSecond}
                                    onValueChange={(
                                        _data: string | undefined,
                                        selectedIndex: number
                                    ) => {
                                        setSelectedSecond(selectedIndex);
                                    }}
                                    wrapperHeight={PICKER_HEIGHT}
                                    wrapperBackground="transparent"
                                    itemHeight={ITEM_HEIGHT}
                                    highlightColor={colors.gray[200]}
                                    highlightBorderWidth={1}
                                    renderItem={renderItem}
                                />
                            </View>
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
        alignItems: 'center',
        marginBottom: 8,
    },
    labelColumn: {
        flex: 1,
        alignItems: 'center',
    },
    labelSpacer: {
        width: 12,
    },
    pickerBody: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: PICKER_HEIGHT,
    },
    columnContainer: {
        flex: 1,
        alignItems: 'center',
        height: PICKER_HEIGHT,
    },
    columnLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: '600',
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
    // ScrollPicker item styles
    pickerItem: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerItemText: {
        fontSize: 20,
        color: colors.gray[400],
        fontWeight: typography.fontWeight.medium,
    },
    pickerItemTextSelected: {
        color: colors.text,
        fontWeight: typography.fontWeight.bold,
    },
});
