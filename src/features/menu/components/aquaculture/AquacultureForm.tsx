import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { colors, spacing } from '@/styles';
import { Input } from '@/shared/components/forms/Input';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import {
    DropDownButton,
    DropDownItem,
} from '@/features/menu/components/aquaculture/DropDownButton';
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

        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Farm Selection */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>
                        <Text style={styles.required}>* </Text>Chọn trại nuôi
                    </Text>
                    <DropDownButton
                        data={farmOptions}
                        value={farm}
                        onSelect={setFarm}
                        placeholder="Chọn trại nuôi"
                        style={styles.dropdown}
                        height={40}
                        borderRadius={6}
                    />
                </View>

                {/* Cycle Name & Code */}
                <View style={styles.row}>
                    <View style={styles.flex1}>
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
                    <View style={styles.flex1}>
                        <DateInputButton
                            label="Ngày bắt đầu"
                            date={startDate}
                            onDateChange={setStartDate}
                            required
                            height={40}
                            dateOnly
                            formatOptions={{
                                showCurrentLabel: false,
                            }}
                        />
                    </View>
                    <View style={styles.flex1}>
                        <DateInputButton
                            label="Ngày kết thúc"
                            date={endDate}
                            onDateChange={setEndDate}
                            height={40}
                            dateOnly
                            formatOptions={{
                                showCurrentLabel: false,
                            }}
                        />
                    </View>
                </View>

                {/* Status */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Chọn trạng thái</Text>
                    <View style={styles.radioGroup}>
                        <TouchableOpacity
                            style={styles.radioItem}
                            onPress={() => setStatus('active')}
                            activeOpacity={0.8}
                        >
                            <View
                                style={[
                                    styles.radioOuter,
                                    status === 'active' && styles.radioOuterSelected,
                                ]}
                            >
                                {status === 'active' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>Hoạt động</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioItem}
                            onPress={() => setStatus('ended')}
                            activeOpacity={0.8}
                        >
                            <View
                                style={[
                                    styles.radioOuter,
                                    status === 'ended' && styles.radioOuterSelected,
                                ]}
                            >
                                {status === 'ended' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>Đã kết thúc</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Note */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Ghi chú</Text>
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Nhập ghi chú"
                            placeholderTextColor={colors.borderSubtle}
                            value={note}
                            onChangeText={setNote}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>
            </ScrollView>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        flex: 1,
        paddingTop: spacing.sm,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 1,
    },
    content: {
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        backgroundColor: colors.white,
        flexGrow: 0,
        gap: spacing.md,
    },
    fieldContainer: {
        gap: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 0,
        gap: spacing.sm,
    },
    flex1: {
        flex: 1,
    },
    label: {
        fontFamily: 'Nunito Sans',
        fontSize: 14,
        fontWeight: '400',
        fontStyle: 'normal',
        lineHeight: 22,
        color: colors.text,
    },
    required: {
        color: colors.error,
    },
    dropdown: {
        zIndex: 100,
    },
    inputGroup: {
        gap: spacing.sm,
    },
    inputContainer: {
        marginBottom: 0,
    },
    inputBoxRadius: {
        borderRadius: 6,
    },
    radioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xl,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 22,
        gap: spacing.sm,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    radioLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
        lineHeight: 22,
    },
    noMarginBottom: {
        marginBottom: 0,
    },
    textArea: {
        minHeight: 80,
        paddingVertical: 5,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        fontSize: 16,
        fontWeight: '400',
        fontStyle: 'normal',
        lineHeight: 24,
        letterSpacing: 0,
        color: colors.text,
        textAlignVertical: 'top',
    },
});
