import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import CalenderIcon from '@/assets/Icon/Calender.svg';
import { colors, spacing, borderRadius, typography } from '@/styles';
import { Input } from '@/shared/components/forms/Input';
import {
    DropDownButton,
    DropDownItem,
} from '@/features/menu/components/aquaculture/DropDownButton';
import { DatePickerModal } from '@/features/home/components/DatePickerModal';
import { Aquaculture } from '@/features/menu/types/menu.types';
import Toast from 'react-native-toast-message';

interface AquacultureFormProps {
    initialValues?: Partial<Aquaculture>;
}

export interface AquacultureFormRef {
    submit: () => Omit<Aquaculture, 'id' | 'createdAt'> | null;
}

export const AquacultureForm = forwardRef<AquacultureFormRef, AquacultureFormProps>(
    ({ initialValues }, ref) => {
        // Mock Data
        const farmOptions = [
            { id: '1', label: 'Trại Kiên Giang' },
            { id: '2', label: 'Trại Cà Mau' },
        ];

        // State
        const [farm, setFarm] = useState<DropDownItem | undefined>(() => {
            if (initialValues?.farmId) {
                return farmOptions.find(f => f.id === initialValues.farmId);
            }
            return farmOptions[0];
        });
        const [cycleName, setCycleName] = useState(initialValues?.name || '');
        const [cycleCode, setCycleCode] = useState(initialValues?.code || '');
        const [startDate, setStartDate] = useState<Date | null>(
            initialValues?.startDate ? new Date(initialValues.startDate) : null
        );
        const [endDate, setEndDate] = useState<Date | null>(
            initialValues?.endDate ? new Date(initialValues.endDate) : null
        );
        const [status, setStatus] = useState<'active' | 'ended'>(
            initialValues?.status === 'active' || initialValues?.status === 'ended'
                ? initialValues.status
                : 'active'
        );
        const [note, setNote] = useState(initialValues?.note || '');

        // Date Picker State
        const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
        const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

        useImperativeHandle(ref, () => ({
            submit: () => {
                // Validation
                if (!farm) {
                    Toast.show({
                        type: 'error',
                        text1: 'Vui lòng chọn trại nuôi',
                        position: 'top',
                    });
                    return null;
                }
                if (!cycleName.trim()) {
                    Toast.show({
                        type: 'error',
                        text1: 'Vui lòng nhập tên vụ nuôi',
                        position: 'top',
                    });
                    return null;
                }
                if (!cycleCode.trim()) {
                    Toast.show({
                        type: 'error',
                        text1: 'Vui lòng nhập mã vụ nuôi',
                        position: 'top',
                    });
                    return null;
                }
                if (!startDate) {
                    Toast.show({
                        type: 'error',
                        text1: 'Vui lòng chọn ngày bắt đầu',
                        position: 'top',
                    });
                    return null;
                }

                return {
                    farmId: String(farm.id),
                    farmName: farm.label,
                    name: cycleName,
                    code: cycleCode,
                    startDate: startDate,
                    endDate: endDate || undefined,
                    status: status === 'active' ? 'active' : 'ended', // Map correctly to TagStatus
                    note: note,
                    // id and createdAt will be handled by context
                };
            },
        }));

        const formatDate = (date: Date | null) => {
            if (!date) return 'dd-mm-yyyy';
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        };

        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Farm Selection */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>
                        Chọn trại nuôi <Text style={styles.required}>*</Text>
                    </Text>
                    <DropDownButton
                        data={farmOptions}
                        value={farm}
                        onSelect={setFarm}
                        placeholder="Chọn trại nuôi"
                        style={styles.dropdown}
                    />
                </View>

                {/* Cycle Name & Code */}
                <View style={styles.row}>
                    <View style={[styles.flex1, { marginRight: spacing.md }]}>
                        <Input
                            label="Tên vụ nuôi"
                            required
                            value={cycleName}
                            onChangeText={setCycleName}
                            placeholder="Input"
                            containerStyle={styles.noMarginBottom}
                        />
                    </View>
                    <View style={styles.flex1}>
                        <Input
                            label="Mã vụ nuôi"
                            required
                            value={cycleCode}
                            onChangeText={setCycleCode}
                            placeholder="Input"
                            containerStyle={styles.noMarginBottom}
                        />
                    </View>
                </View>

                {/* Start & End Date */}
                <View style={styles.row}>
                    <View style={[styles.flex1, { marginRight: spacing.md }]}>
                        <Text style={styles.label}>
                            Ngày bắt đầu <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setStartDatePickerVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.dateText, !startDate && styles.placeholderText]}>
                                {formatDate(startDate)}
                            </Text>
                            <CalenderIcon width={20} height={20} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.flex1}>
                        <Text style={styles.label}>Ngày kết thúc</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setEndDatePickerVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.dateText, !endDate && styles.placeholderText]}>
                                {formatDate(endDate)}
                            </Text>
                            <CalenderIcon width={20} height={20} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Status */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Chọn trạng thái</Text>
                    <View style={styles.radioGroup}>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setStatus('active')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.radioOuter}>
                                {status === 'active' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioText}>Hoạt động</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setStatus('ended')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.radioOuter}>
                                {status === 'ended' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioText}>Đã kết thúc</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Note */}
                <View style={styles.fieldContainer}>
                    <Input
                        label="Ghi chú"
                        value={note}
                        onChangeText={setNote}
                        placeholder="Nhập ghi chú"
                        multiline
                        numberOfLines={4}
                        inputStyle={styles.textArea}
                    />
                </View>

                {/* Date Picker Modals */}
                <DatePickerModal
                    visible={isStartDatePickerVisible}
                    date={startDate || new Date()}
                    onClose={() => setStartDatePickerVisible(false)}
                    onSelectDate={setStartDate}
                />
                <DatePickerModal
                    visible={isEndDatePickerVisible}
                    date={endDate || new Date()}
                    onClose={() => setEndDatePickerVisible(false)}
                    onSelectDate={setEndDate}
                />
            </ScrollView>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        flex: 1,
        paddingTop: spacing.sm,
    },
    content: {
        padding: spacing.md,
        backgroundColor: colors.white,
        flexGrow: 0,
    },
    fieldContainer: {
        marginBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
        marginBottom: spacing.md, // Reduced since Input has its own margin, but carefully managed
    },
    flex1: {
        flex: 1,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    required: {
        color: colors.error,
    },
    dropdown: {
        zIndex: 100,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        height: 48, // Match standard input height
        backgroundColor: colors.white,
    },
    dateText: {
        fontSize: typography.fontSize.base,
        color: colors.text,
    },
    placeholderText: {
        color: colors.textTertiary,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: spacing.xl,
        marginTop: spacing.xs,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    radioText: {
        fontSize: typography.fontSize.base,
        color: colors.text,
    },
    textArea: {
        height: 80,
    },
    noMarginBottom: {
        marginBottom: 0,
    },
});
