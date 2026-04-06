import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

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
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);

    const defaultTime = time || new Date();
    const [selectedHour, setSelectedHour] = useState(defaultTime.getHours());
    const [selectedMinute, setSelectedMinute] = useState(defaultTime.getMinutes());
    const [selectedSecond, setSelectedSecond] = useState(
        showSeconds ? defaultTime.getSeconds() : 0
    );

    // Force remount key - changes each time modal opens
    const [mountKey, setMountKey] = useState(0);

    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    // Track previous visible state to detect open transition
    const prevVisibleRef = useRef(false);

    useEffect(() => {
        const wasVisible = prevVisibleRef.current;
        prevVisibleRef.current = visible;

        if (visible && !wasVisible) {
            // Only sync time when modal OPENS (false -> true)
            // Avoid re-syncing on every `time` reference change
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
        } else if (!visible && wasVisible) {
            // Slide down animation when closing
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
            <View style={staticStyles.pickerItem}>
                <Text
                    style={[
                        themedStyles.pickerItemText,
                        isSelected && themedStyles.pickerItemTextSelected,
                    ]}
                >
                    {data}
                </Text>
            </View>
        ),
        [themedStyles]
    );

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={themedStyles.modalRoot}>
                {/* Overlay - tap to dismiss */}
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <Animated.View
                    style={[
                        themedStyles.container,
                        {
                            paddingBottom: insets.bottom + 20,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Header */}
                    <View style={staticStyles.header}>
                        <TouchableOpacity onPress={onClose} style={staticStyles.closeButton}>
                            <Text style={themedStyles.cancelText}>Hủy</Text>
                        </TouchableOpacity>
                        <Text style={themedStyles.headerTitle}>Chọn thời gian</Text>
                        <TouchableOpacity onPress={handleConfirm} style={staticStyles.closeButton}>
                            <Text style={themedStyles.confirmText}>Xong</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Time Picker Labels */}
                    <View style={staticStyles.labelsContainer}>
                        <View style={staticStyles.labelColumn}>
                            <Text style={themedStyles.columnLabel}>Giờ</Text>
                        </View>
                        <View style={staticStyles.labelSpacer} />
                        <View style={staticStyles.labelColumn}>
                            <Text style={themedStyles.columnLabel}>Phút</Text>
                        </View>
                        {showSeconds && (
                            <>
                                <View style={staticStyles.labelSpacer} />
                                <View style={staticStyles.labelColumn}>
                                    <Text style={themedStyles.columnLabel}>Giây</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Time Picker Body */}
                    <View style={staticStyles.pickerBody}>
                        {/* Hour */}
                        <View style={staticStyles.columnContainer}>
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
                                highlightColor={theme.borderDark}
                                highlightBorderWidth={1}
                                renderItem={renderItem}
                            />
                        </View>

                        {/* Separator : */}
                        <View style={staticStyles.separatorContainer}>
                            <Text style={themedStyles.separatorText}>:</Text>
                        </View>

                        {/* Minute */}
                        <View style={staticStyles.columnContainer}>
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
                                highlightColor={theme.borderDark}
                                highlightBorderWidth={1}
                                renderItem={renderItem}
                            />
                        </View>

                        {/* Separator : (seconds) */}
                        {showSeconds && (
                            <View style={staticStyles.separatorContainer}>
                                <Text style={themedStyles.separatorText}>:</Text>
                            </View>
                        )}

                        {/* Second */}
                        {showSeconds && (
                            <View style={staticStyles.columnContainer}>
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
                                    highlightColor={theme.borderDark}
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

const staticStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
        paddingBottom: spacing.sm,
    },
    closeButton: {
        padding: 4,
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
    separatorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 12,
        height: PICKER_HEIGHT,
    },
    pickerItem: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        modalRoot: {
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: 'flex-end',
            paddingHorizontal: 16,
            paddingBottom: 40,
        },
        container: {
            backgroundColor: theme.background,
            borderRadius: 24,
            padding: spacing.lg,
            elevation: 10,
        },
        headerTitle: {
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            color: theme.text,
        },
        cancelText: {
            color: theme.textSecondary,
            fontSize: 14,
        },
        confirmText: {
            color: theme.primary,
            fontWeight: '700',
            fontSize: 14,
        },
        columnLabel: {
            fontSize: typography.fontSize.sm,
            color: theme.textSecondary,
            fontWeight: '600',
            textAlign: 'center',
        },
        separatorText: {
            fontSize: typography.fontSize.xxl,
            fontWeight: 'bold',
            color: theme.text,
        },
        pickerItemText: {
            fontSize: 20,
            color: theme.textSecondary,
            fontWeight: typography.fontWeight.medium,
        },
        pickerItemTextSelected: {
            color: theme.text,
            fontWeight: typography.fontWeight.bold,
        },
    });
