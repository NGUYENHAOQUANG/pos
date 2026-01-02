import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '@/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DatePickerModalProps {
    visible: boolean;
    onClose: () => void;
    date: Date;
    onSelectDate: (date: Date) => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
    visible,
    onClose,
    date,
    onSelectDate,
}) => {
    const insets = useSafeAreaInsets();
    const [viewDate, setViewDate] = useState(new Date(date));

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleSelectDay = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onSelectDate(newDate);
        onClose();
    };

    const renderCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        const totalCells = 42;

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-start-${i}`} style={styles.dayCell} />);
        }

        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDate = new Date(year, month, i);
            const isSelected =
                currentDate.getDate() === date.getDate() &&
                currentDate.getMonth() === date.getMonth() &&
                currentDate.getFullYear() === date.getFullYear();

            const isToday =
                new Date().getDate() === i &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

            days.push(
                <TouchableOpacity
                    key={`day-${i}`}
                    style={[
                        styles.dayCell,
                        isSelected && styles.selectedDayCell,
                        !isSelected && isToday && styles.todayCell,
                    ]}
                    onPress={() => handleSelectDay(i)}
                >
                    <Text
                        style={[
                            styles.dayText,
                            isSelected && styles.selectedDayText,
                            !isSelected && isToday && styles.todayText,
                        ]}
                    >
                        {i}
                    </Text>
                </TouchableOpacity>
            );
        }

        // Fill remaining slots to complete 6 rows
        const currentCells = firstDay + daysInMonth;
        for (let i = currentCells; i < totalCells; i++) {
            days.push(<View key={`empty-end-${i}`} style={styles.dayCell} />);
        }

        return days;
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Chọn ngày</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            {/* Month Navigation */}
                            <View style={styles.monthNav}>
                                <TouchableOpacity
                                    onPress={handlePrevMonth}
                                    style={styles.navButton}
                                >
                                    <Ionicons
                                        name="chevron-back"
                                        size={24}
                                        color={colors.primary}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.monthText}>
                                    Tháng {viewDate.getMonth() + 1}, {viewDate.getFullYear()}
                                </Text>
                                <TouchableOpacity
                                    onPress={handleNextMonth}
                                    style={styles.navButton}
                                >
                                    <Ionicons
                                        name="chevron-forward"
                                        size={24}
                                        color={colors.primary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Days Header */}
                            <View style={styles.weekHeader}>
                                {daysOfWeek.map((day, index) => (
                                    <Text key={index} style={styles.weekDayText}>
                                        {day}
                                    </Text>
                                ))}
                            </View>

                            {/* Calendar Grid */}
                            <View style={styles.calendarGrid}>{renderCalendarDays()}</View>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing.lg,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    },
    closeButton: {
        padding: 4,
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    navButton: {
        padding: 8,
        backgroundColor: colors.gray[100],
        borderRadius: 8,
    },
    monthText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text,
    },
    weekHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    weekDayText: {
        width: '14.28%',
        textAlign: 'center',
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        minHeight: 280, // Fixed height for 6 rows to prevent resizing
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    selectedDayCell: {
        backgroundColor: colors.primary,
        borderRadius: 20, // Circle
    },
    todayCell: {
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 20,
    },
    dayText: {
        fontSize: typography.fontSize.base,
        color: colors.text,
    },
    selectedDayText: {
        color: colors.white,
        fontWeight: typography.fontWeight.bold,
    },
    todayText: {
        color: colors.primary,
        fontWeight: typography.fontWeight.bold,
    },
});
