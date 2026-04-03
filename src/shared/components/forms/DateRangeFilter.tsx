import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { IconCalender } from '@/assets/icons';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';

/**
 * Props for DateRangeFilter component
 */
interface DateRangeFilterProps {
    /** Start date value */
    startDate: Date;
    /** End date value */
    endDate: Date;
    /** Callback function called when start date changes */
    onStartDateChange: (date: Date) => void;
    /** Callback function called when end date changes */
    onEndDateChange: (date: Date) => void;
    /** Label text for the start date (optional, will be formatted if not provided) */
    startLabel?: string;
    /** Label text for the end date (optional, will be formatted if not provided) */
    endLabel?: string;
    /** Additional styles for the container */
    style?: ViewStyle;
}

/**
 * A reusable date range filter component with integrated date picker.
 *
 * Displays two date labels (start and end) with an arrow icon between them,
 * and a calendar icon on the right. Each element can be individually pressed
 * to trigger date selection via an integrated DatePickerModal.
 *
 * @example
 * ```tsx
 * <DateRangeFilter
 *   startDate={startDate}
 *   endDate={endDate}
 *   onStartDateChange={setStartDate}
 *   onEndDateChange={setEndDate}
 * />
 * ```
 */
export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    startLabel,
    endLabel,
    style,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [activeField, setActiveField] = useState<'start' | 'end'>('start');

    const formatDate = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const displayStartLabel = startLabel || formatDate(startDate);
    const displayEndLabel = endLabel || formatDate(endDate);

    const handlePressStart = () => {
        setActiveField('start');
        setIsDatePickerVisible(true);
    };

    const handlePressEnd = () => {
        setActiveField('end');
        setIsDatePickerVisible(true);
    };

    const handlePressCalendar = () => {
        setActiveField('start');
        setIsDatePickerVisible(true);
    };

    const handleSelectDate = (date: Date) => {
        if (activeField === 'start') {
            onStartDateChange(date);
            if (date > endDate) {
                onEndDateChange(date);
            }
        } else {
            onEndDateChange(date);
            if (date < startDate) {
                onStartDateChange(date);
            }
        }
        setIsDatePickerVisible(false);
    };

    return (
        <>
            <View style={[styles.container, style]}>
                <View style={styles.textRow}>
                    <TouchableOpacity
                        style={styles.dateTouchableStart}
                        onPress={handlePressStart}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.dateTextStart}>{displayStartLabel}</Text>
                    </TouchableOpacity>
                    <Text style={styles.dashSeparator}>-</Text>
                    <TouchableOpacity
                        style={styles.dateTouchableEnd}
                        onPress={handlePressEnd}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.dateTextEnd}>{displayEndLabel}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handlePressCalendar} activeOpacity={0.7}>
                    <IconCalender
                        width={15}
                        height={15}
                        style={styles.calendarIcon}
                        color={theme.text}
                    />
                </TouchableOpacity>
            </View>

            <DatePickerModal
                visible={isDatePickerVisible}
                onClose={() => setIsDatePickerVisible(false)}
                date={activeField === 'start' ? startDate : endDate}
                onSelectDate={handleSelectDate}
            />
        </>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            backgroundColor: theme.background,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        textRow: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
        },
        dateTouchableStart: {
            alignItems: 'flex-start',
        },
        dateTouchableEnd: {
            alignItems: 'flex-start',
        },
        dateTextStart: {
            fontWeight: '700',
            fontStyle: 'normal',
            fontSize: 16,
            lineHeight: 24,
            letterSpacing: 0,
            color: theme.text,
        },
        dateTextEnd: {
            fontWeight: '700',
            fontStyle: 'normal',
            fontSize: 16,
            lineHeight: 24,
            letterSpacing: 0,
            color: theme.text,
        },
        dashSeparator: {
            marginHorizontal: 8,
            fontWeight: '700',
            fontSize: 16,
            color: theme.text,
        },
        calendarIcon: {
            marginLeft: 8,
        },
    });
