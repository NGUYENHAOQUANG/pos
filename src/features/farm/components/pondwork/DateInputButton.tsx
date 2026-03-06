import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/styles';
import { IconCalender } from '@/assets/icons';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';
import { formatDateTime, FormatDateTimeOptions } from '@/features/farm/utils/dateUtils';
import { RequiredDot } from '@/shared/components/forms/Input';

/**
 * DateInputButton Component
 *
 * A reusable date input button component with integrated date picker modal.
 * It handles all date picker logic internally, so you don't need to manage modal state.
 *
 * @example
 * // Basic usage with date state
 * const [selectedDate, setSelectedDate] = useState(new Date());
 *
 * <DateInputButton
 *   label="Ngày thả"
 *   date={selectedDate}
 *   onDateChange={setSelectedDate}
 * />
 *
 * @example
 * // With required field indicator
 * <DateInputButton
 *   label="Thời gian thực hiện"
 *   date={selectedDate}
 *   onDateChange={setSelectedDate}
 *   required
 * />
 *
 * @example
 * // With custom date format options (show current label based on condition)
 * <DateInputButton
 *   label="Thời gian thực hiện"
 *   date={selectedDate}
 *   onDateChange={date => {
 *     setSelectedDate(date);
 *     setHasDateChanged(true);
 *   }}
 *   formatOptions={{
 *     showCurrentLabel: hasDateChanged ? false : 'auto',
 *   }}
 * />
 *
 * @example
 * // With custom date text (override formatting)
 * <DateInputButton
 *   label="Ngày thả"
 *   date={formData.stockingDate ? new Date(formData.stockingDate) : null}
 *   onDateChange={date => updateField('stockingDate', date.toISOString())}
 *   dateText="Custom formatted date text"
 * />
 *
 * @example
 * // With custom height
 * <DateInputButton
 *   label="Ngày thả"
 *   date={selectedDate}
 *   onDateChange={setSelectedDate}
 *   height={44}
 * />
 *
 * @example
 * // Date only format (dd/mm/yyyy)
 * <DateInputButton
 *   label="Ngày bắt đầu"
 *   date={selectedDate}
 *   onDateChange={setSelectedDate}
 *   dateOnly
 * />
 */
interface DateInputButtonProps {
    /** Label text displayed above the input button */
    label?: string;
    /** Date value (Date object, ISO string, or null/undefined for empty) */
    date?: Date | string | null | undefined;
    /** Callback when date is selected/changed */
    onDateChange?: (date: Date) => void;
    /** Optional: Custom date text to display (overrides date formatting) */
    dateText?: string;
    /** Optional: Formatting options for date display (see FormatDateTimeOptions) */
    formatOptions?: FormatDateTimeOptions;
    /** Whether to show only date (dd/mm/yyyy) without time. Default: false */
    dateOnly?: boolean;
    /** Whether to show required indicator (*) */
    required?: boolean;
    /** Height of the input button (default: 40) */
    height?: number;
    /** Border radius of the input button (default: 6) */
    borderRadius?: number;
    /** Whether the input is disabled */
    disabled?: boolean;
}

export const DateInputButton: React.FC<DateInputButtonProps> = ({
    label,
    date,
    onDateChange,
    dateText: customDateText,
    formatOptions,
    dateOnly = false,
    required = false,
    height = 40,
    borderRadius = 6,
    disabled = false,
}) => {
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

    // Determine the current date for the picker
    const currentDate = date instanceof Date ? date : date ? new Date(date) : new Date();

    // Merge formatOptions with dateOnly option
    const finalFormatOptions: FormatDateTimeOptions = {
        ...formatOptions,
        showTime: dateOnly ? false : formatOptions?.showTime ?? true,
    };

    // Format date text
    const displayText =
        customDateText !== undefined
            ? customDateText
            : formatDateTime(date || null, finalFormatOptions);

    const handleDateSelect = (selectedDate: Date) => {
        onDateChange?.(selectedDate);
        setIsDatePickerVisible(false);
    };

    return (
        <>
            <View style={styles.inputGroup}>
                {label && (
                    <View style={styles.labelWrapper}>
                        <Text style={styles.label}>{label}</Text>
                        {/* Small required dot 4x4 displayed to the right of label */}
                        {required && <RequiredDot />}
                    </View>
                )}
                <TouchableOpacity
                    style={[styles.dateInput, { height, borderRadius }]}
                    onPress={() => setIsDatePickerVisible(true)}
                    activeOpacity={0.7}
                    disabled={disabled}
                >
                    <Text style={styles.dateText}>{displayText}</Text>
                    <IconCalender width={15} height={15} />
                </TouchableOpacity>
            </View>

            <DatePickerModal
                visible={isDatePickerVisible}
                onClose={() => setIsDatePickerVisible(false)}
                date={currentDate}
                onSelectDate={handleDateSelect}
            />
        </>
    );
};

const styles = StyleSheet.create({
    inputGroup: {
        gap: 6,
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        lineHeight: 20,
    },
    required: {
        color: colors.error,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
    },
    dateText: {
        fontSize: 16,
        color: colors.text,
        flex: 1,
    },
});
