import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';

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
    const [viewDate, setViewDate] = useState(new Date(date));
    const [pendingDate, setPendingDate] = useState(new Date(date));
    const theme = useAppTheme();
    const styles = getStyles(theme);

    // Sync state when modal opens
    useEffect(() => {
        if (visible) {
            const d = new Date(date);
            setPendingDate(d);
            setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
        }
    }, [visible, date]);

    const today = new Date();
    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () =>
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

    const handleNextMonth = () =>
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const handleSelectDay = (day: number, month: number, year: number) => {
        setPendingDate(new Date(year, month, day));
        // Also update viewDate if selecting from adjacent month
        if (month !== viewDate.getMonth() || year !== viewDate.getFullYear()) {
            setViewDate(new Date(year, month, 1));
        }
    };

    const handleApply = () => {
        onSelectDate(pendingDate);
        onClose();
    };

    const handleClose = () => {
        // Reset pending to current date when cancelled
        setPendingDate(new Date(date));
        setViewDate(new Date(date));
        onClose();
    };

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();

    const renderCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Previous month trailing days
        const prevMonthDays = getDaysInMonth(year, month - 1);
        for (let i = firstDay - 1; i >= 0; i--) {
            const d = prevMonthDays - i;
            const cellDate = new Date(year, month - 1, d);
            const isSelected = isSameDay(cellDate, pendingDate);
            days.push(
                <TouchableOpacity
                    key={`prev-${d}`}
                    style={styles.dayCell}
                    onPress={() => handleSelectDay(d, month - 1, year)}
                    activeOpacity={0.7}
                >
                    {isSelected && <View style={styles.selectedBg} />}
                    <Text
                        style={[
                            styles.dayText,
                            styles.adjacentDayText,
                            isSelected && styles.selectedDayText,
                        ]}
                    >
                        {d}
                    </Text>
                </TouchableOpacity>
            );
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const cellDate = new Date(year, month, i);
            const isSelected = isSameDay(cellDate, pendingDate);
            const isToday = isSameDay(cellDate, today);

            days.push(
                <TouchableOpacity
                    key={`day-${i}`}
                    style={styles.dayCell}
                    onPress={() => handleSelectDay(i, month, year)}
                    activeOpacity={0.7}
                >
                    {isSelected && <View style={styles.selectedBg} />}
                    <Text
                        style={[
                            styles.dayText,
                            isSelected && styles.selectedDayText,
                            !isSelected && isToday && styles.todayText,
                        ]}
                    >
                        {i}
                    </Text>
                    {!isSelected && isToday && <View style={styles.todayDot} />}
                </TouchableOpacity>
            );
        }

        // Fill remaining slots to complete 6 rows (42 cells total)
        const totalCells = 42;
        const remaining = totalCells - (firstDay + daysInMonth);
        for (let i = 1; i <= remaining; i++) {
            const cellDate = new Date(year, month + 1, i);
            const isSelected = isSameDay(cellDate, pendingDate);
            days.push(
                <TouchableOpacity
                    key={`next-${i}`}
                    style={styles.dayCell}
                    onPress={() => handleSelectDay(i, month + 1, year)}
                    activeOpacity={0.7}
                >
                    {isSelected && <View style={styles.selectedBg} />}
                    <Text
                        style={[
                            styles.dayText,
                            styles.adjacentDayText,
                            isSelected && styles.selectedDayText,
                        ]}
                    >
                        {i}
                    </Text>
                </TouchableOpacity>
            );
        }

        return days;
    };

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={handleClose}
            overlayStyle={styles.overlay}
            containerStyle={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerSpacer} />
                <Text style={styles.headerTitle}>Chọn ngày</Text>
                <TouchableOpacity
                    onPress={handleClose}
                    style={styles.closeButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close" size={22} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Month Navigation */}
            <View style={styles.monthNav}>
                <TouchableOpacity
                    onPress={handlePrevMonth}
                    style={styles.navButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={18} color={theme.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.monthSelector} activeOpacity={0.7}>
                    <Text style={styles.monthText}>
                        Tháng {viewDate.getMonth() + 1}, {viewDate.getFullYear()}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={theme.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleNextMonth}
                    style={styles.navButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-forward" size={18} color={theme.text} />
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

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={handleApply}
                    activeOpacity={0.8}
                >
                    <Text style={styles.applyButtonText}>Áp dụng</Text>
                </TouchableOpacity>
            </View>
        </AnimatedBottomSheet>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.overlayLight,
            justifyContent: 'flex-end',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
        },
        container: {
            width: '100%',
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.md,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 2,
        },
        headerSpacer: {
            width: 32,
        },
        headerTitle: {
            flex: 1,
            textAlign: 'center',
            fontSize: 17,
            fontWeight: '700',
            color: theme.text,
        },
        closeButton: {
            width: 36,
            height: 36,
            justifyContent: 'center',
            alignItems: 'center',
        },
        divider: {
            height: 1,
            backgroundColor: theme.defaultBorder,
            marginHorizontal: -16,
            marginBottom: 12,
        },
        monthNav: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingHorizontal: 4,
        },
        navButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.background,
        },
        monthSelector: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        monthText: {
            fontSize: 17,
            fontWeight: '700',
            color: theme.text,
        },
        weekHeader: {
            flexDirection: 'row',
            marginBottom: 8,
        },
        weekDayText: {
            width: '14.28%',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: '700',
            color: theme.text,
        },
        calendarGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        dayCell: {
            width: '14.28%',
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 2,
        },
        selectedBg: {
            position: 'absolute',
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.primary,
        },
        dayText: {
            fontSize: 15,
            fontWeight: '500',
            color: theme.text,
        },
        adjacentDayText: {
            color: theme.textSecondary,
            fontWeight: '400',
        },
        selectedDayText: {
            color: theme.white,
            fontWeight: '700',
        },
        todayText: {
            color: theme.primary,
            fontWeight: '700',
        },
        todayDot: {
            position: 'absolute',
            bottom: 4,
            width: 16,
            height: 2,
            borderRadius: 1,
            backgroundColor: theme.primary,
        },
        footer: {
            flexDirection: 'row',
            gap: spacing.sm,
            marginTop: 32,
        },
        cancelButton: {
            flex: 1,
            height: 48,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.background,
        },
        cancelButtonText: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.text,
        },
        applyButton: {
            flex: 1,
            height: 48,
            borderRadius: 999,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.primary,
        },
        applyButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.white,
        },
    });
