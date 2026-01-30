import React, { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { RadioButton } from '@/shared/components/forms/RadioButton';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { colors, spacing } from '@/styles';
import { Input } from '@/shared/components/forms/Input';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import {
    DropDownButton,
    DropDownItem,
} from '@/features/menu/components/aquaculture/DropDownButton';
import { Aquaculture } from '@/features/menu/types/menu.types';
import { Zone } from '@/features/farm/types/farm.types';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';

interface AquacultureFormProps {
    initialValues?: Partial<Aquaculture> & { zoneId?: number | string };
    zones?: Zone[];
    isEdit?: boolean;
}

export interface AquacultureFormRef {
    submit: () => (Omit<Aquaculture, 'id' | 'createdAt'> & { zoneId?: string }) | null;
}

export const AquacultureForm = forwardRef<AquacultureFormRef, AquacultureFormProps>(
    ({ initialValues, zones = [], isEdit = false }, ref) => {
        // Map zones to dropdown options
        const farmOptions = useMemo(() => {
            return zones.map(z => ({
                id: z.id.toString(),
                label: z.name,
            }));
        }, [zones]);

        // State
        const [farm, setFarm] = useState<DropDownItem | undefined>(() => {
            if (initialValues?.zoneId) {
                return farmOptions.find(f => f.id === initialValues.zoneId?.toString());
            }
            return undefined;
        });
        const [cycleName, setCycleName] = useState(initialValues?.name || '');
        const [cycleCode, setCycleCode] = useState(initialValues?.code || '');
        const [startDate, setStartDate] = useState<Date | null>(
            initialValues?.startDate ? new Date(initialValues.startDate) : null
        );
        const [endDate, setEndDate] = useState<Date | null>(
            initialValues?.endDate ? new Date(initialValues.endDate) : null
        );
        const [status, setStatus] = useState<'preparing' | 'active' | 'ended'>(
            initialValues?.status === 'active' ||
                initialValues?.status === 'ended' ||
                initialValues?.status === 'preparing'
                ? initialValues.status
                : 'preparing'
        );
        const [note, setNote] = useState(initialValues?.note || '');

        // Sync state with initialValues when they change (e.g. after refetch)
        React.useEffect(() => {
            if (initialValues) {
                if (initialValues.name) setCycleName(initialValues.name);
                if (initialValues.code) setCycleCode(initialValues.code);
                if (initialValues.startDate) setStartDate(new Date(initialValues.startDate));
                if (initialValues.endDate) setEndDate(new Date(initialValues.endDate));
                if (initialValues.status) {
                    const newStatus =
                        initialValues.status === 'active' ||
                        initialValues.status === 'preparing' ||
                        initialValues.status === 'ended'
                            ? initialValues.status
                            : 'active';
                    setStatus(newStatus);
                }
                if (initialValues.note !== undefined) setNote(initialValues.note);
                if (initialValues.zoneId && zones.length > 0) {
                    const foundFarm = farmOptions.find(
                        f => f.id === initialValues.zoneId?.toString()
                    );
                    if (foundFarm) setFarm(foundFarm);
                }
            }
        }, [initialValues, zones, farmOptions]);

        useImperativeHandle(ref, () => ({
            submit: () => {
                // Validation
                if (!farm) {
                    Toast.show(ToastMessages.Aquaculture.FARM_REQUIRED);
                    return null;
                }
                if (!cycleName.trim()) {
                    Toast.show(ToastMessages.Aquaculture.CYCLE_NAME_REQUIRED);
                    return null;
                }
                if (!startDate) {
                    Toast.show(ToastMessages.Aquaculture.START_DATE_REQUIRED);
                    return null;
                }

                return {
                    farmId: String(farm.id),
                    farmName: farm.label,
                    zoneId: farm.id.toString(), // Zone ID for API
                    name: cycleName,
                    code: cycleCode,
                    startDate: startDate,
                    endDate: endDate || undefined,
                    status: status,
                    note: note,
                };
            },
        }));

        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Farm Selection */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>
                        <Text style={styles.required}>* </Text>
                        {isEdit ? 'Trại nuôi' : 'Chọn trại nuôi'}
                    </Text>
                    {isEdit ? (
                        <Input
                            value={farm?.label || ''}
                            editable={false}
                            placeholder="Trại nuôi"
                            containerStyle={styles.noMarginBottom}
                            inputContainerStyle={styles.inputDisabledBox}
                        />
                    ) : (
                        <DropDownButton
                            data={farmOptions}
                            value={farm}
                            onSelect={setFarm}
                            placeholder="Chọn trại nuôi"
                            style={styles.dropdown}
                            height={40}
                            borderRadius={6}
                        />
                    )}
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
                            value={cycleCode}
                            onChangeText={setCycleCode}
                            placeholder="Mã tự động"
                            containerStyle={styles.noMarginBottom}
                            inputContainerStyle={styles.inputDisabledBox}
                            disabled
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
                    <RadioButton
                        options={[
                            {
                                label: 'Chuẩn bị',
                                value: 'preparing',
                                disabled: isEdit && initialValues?.status === 'active',
                            },
                            { label: 'Đang nuôi', value: 'active' },
                            ...(initialValues?.status === 'ended'
                                ? [{ label: 'Đã kết thúc', value: 'ended' }]
                                : []),
                        ]}
                        value={status}
                        onValueChange={val => setStatus(val as 'preparing' | 'active' | 'ended')}
                        disabled={initialValues?.status === 'ended'}
                    />
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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxLabel: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 22,
    },
    inputDisabledBox: {
        backgroundColor: colors.gray[100],
    },
});
