import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/styles';

const spacing = { sm: 8, md: 16, lg: 24 };
const typography = {
    fontSize: { sm: 12, base: 14, lg: 16, xl: 18, xxl: 24 },
    fontWeight: { medium: '500' as const, semibold: '600' as const, bold: '700' as const },
};

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

    useEffect(() => {
        if (time) {
            setSelectedHour(time.getHours());
            setSelectedMinute(time.getMinutes());
            setSelectedSecond(time.getSeconds());
        }
    }, [time]);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    const seconds = Array.from({ length: 60 }, (_, i) => i);

    const handleConfirm = () => {
        const newDate = new Date();
        newDate.setHours(selectedHour);
        newDate.setMinutes(selectedMinute);
        newDate.setSeconds(selectedSecond, 0);
        onSelectTime(newDate);
        onClose();
    };

    const formatNumber = (num: number) => (num < 10 ? `0${num}` : `${num}`);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
                            {/* Header */}
                            <View style={styles.header}>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Text style={styles.cancelText}>Hủy</Text>
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>Chọn thời gian</Text>
                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    style={styles.closeButton}
                                >
                                    <Text style={styles.confirmText}>Xong</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Time Picker Body */}
                            <View style={styles.pickerBody}>
                                {/* Cột Giờ */}
                                <View style={styles.columnContainer}>
                                    <Text style={styles.columnLabel}>Giờ</Text>
                                    <ScrollView
                                        style={styles.scrollColumn}
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {hours.map(item => {
                                            const isSelected = item === selectedHour;
                                            return (
                                                <TouchableOpacity
                                                    key={`h-${item}`}
                                                    style={[
                                                        styles.timeItem,
                                                        isSelected && styles.selectedTimeItem,
                                                    ]}
                                                    onPress={() => setSelectedHour(item)}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.timeText,
                                                            isSelected && styles.selectedTimeText,
                                                        ]}
                                                    >
                                                        {formatNumber(item)}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>

                                {/* Dấu hai chấm ngăn cách */}
                                <View style={styles.separatorContainer}>
                                    <Text style={styles.separatorText}>:</Text>
                                </View>

                                {/* Cột Phút */}
                                <View style={styles.columnContainer}>
                                    <Text style={styles.columnLabel}>Phút</Text>
                                    <ScrollView
                                        style={styles.scrollColumn}
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {minutes.map(item => {
                                            const isSelected = item === selectedMinute;
                                            return (
                                                <TouchableOpacity
                                                    key={`m-${item}`}
                                                    style={[
                                                        styles.timeItem,
                                                        isSelected && styles.selectedTimeItem,
                                                    ]}
                                                    onPress={() => setSelectedMinute(item)}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.timeText,
                                                            isSelected && styles.selectedTimeText,
                                                        ]}
                                                    >
                                                        {formatNumber(item)}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>

                                {/* Separator : */}
                                <View style={styles.separatorContainer}>
                                    <Text style={styles.separatorText}>:</Text>
                                </View>

                                {/* Seconds Column */}
                                <View style={styles.columnContainer}>
                                    <Text style={styles.columnLabel}>Giây</Text>
                                    <ScrollView
                                        style={styles.scrollColumn}
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {seconds.map(item => {
                                            const isSelected = item === selectedSecond;
                                            return (
                                                <TouchableOpacity
                                                    key={`s-${item}`}
                                                    style={[
                                                        styles.timeItem,
                                                        isSelected && styles.selectedTimeItem,
                                                    ]}
                                                    onPress={() => setSelectedSecond(item)}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.timeText,
                                                            isSelected && styles.selectedTimeText,
                                                        ]}
                                                    >
                                                        {formatNumber(item)}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing.lg,
        elevation: 10,
        maxHeight: '60%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
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
    },
    confirmText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    pickerBody: {
        flexDirection: 'row',
        justifyContent: 'center',
        height: 200,
    },
    columnContainer: {
        flex: 1,
        alignItems: 'center',
    },
    columnLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: 8,
        fontWeight: '600',
    },
    scrollColumn: {
        width: '100%',
    },
    timeItem: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 2,
    },
    selectedTimeItem: {
        backgroundColor: colors.primary,
    },
    timeText: {
        fontSize: typography.fontSize.xl,
        color: colors.text,
    },
    selectedTimeText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    separatorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 20,
        paddingTop: 20,
    },
    separatorText: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text,
        paddingBottom: 15,
    },
});
