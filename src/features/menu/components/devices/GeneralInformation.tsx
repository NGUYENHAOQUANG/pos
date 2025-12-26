import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius, sizes } from '@/styles';
import { Input } from '@/shared/components/forms/Input';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';

import { DatePickerModal } from '@/features/home/components/DatePickerModal';
import { IconCalender } from '@/assets/icons';
import { formatDate } from '@/features/farm/utils/dateUtils';
import Toast from 'react-native-toast-message';

interface GeneralInformationProps {
    onDataChange?: (data: GeneralInformationData) => void;
    triggerValidation?: boolean;
    initialData?: Partial<GeneralInformationData>;
}

export interface GeneralInformationData {
    deviceName: string;
    deviceType: DropDownItem | null;
    quantity: string;
    importDate: Date | null;
    condition: 'new' | 'used';
    isValid: boolean;
}

const DEVICE_TYPES: DropDownItem[] = [
    { id: '1', label: 'Cảm biến Oxi' },
    { id: '2', label: 'Cảm biến pH' },
    { id: '3', label: 'Cảm biến Nhiệt độ' },
    { id: '4', label: 'Quạt nước' },
];

const PLACEHOLDER: DropDownItem = { id: '0', label: 'Chọn' };

export const GeneralInformation: React.FC<GeneralInformationProps> = ({
    onDataChange,
    triggerValidation,
    initialData,
}) => {
    const [deviceName, setDeviceName] = useState(initialData?.deviceName || '');
    const [deviceType, setDeviceType] = useState<DropDownItem>(
        initialData?.deviceType || PLACEHOLDER
    );
    const [quantity, setQuantity] = useState(initialData?.quantity || '');
    const [importDate, setImportDate] = useState<Date | null>(initialData?.importDate || null);
    const [condition, setCondition] = useState<'new' | 'used'>(initialData?.condition || 'new');
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

    // Notify parent of data changes
    useEffect(() => {
        const isValid =
            deviceName.trim() !== '' &&
            deviceType.id !== '0' &&
            quantity.trim() !== '' &&
            importDate !== null;

        onDataChange?.({
            deviceName,
            deviceType: deviceType.id === '0' ? null : deviceType,
            quantity,
            importDate,
            condition,
            isValid,
        });
    }, [deviceName, deviceType, quantity, importDate, condition, onDataChange]);

    // Handle external validation trigger
    useEffect(() => {
        if (triggerValidation) {
            if (!deviceName.trim()) {
                Toast.show({
                    type: 'error',
                    text1: 'Vui lòng nhập tên thiết bị',
                });
            }
            if (deviceType.id === '0') {
                Toast.show({
                    type: 'error',
                    text1: 'Vui lòng chọn loại thiết bị',
                });
            }
            if (!quantity.trim()) {
                Toast.show({
                    type: 'error',
                    text1: 'Vui lòng nhập số lượng',
                });
            }
            if (!importDate) {
                Toast.show({
                    type: 'error',
                    text1: 'Vui lòng chọn ngày nhập kho',
                });
            }
        }
    }, [triggerValidation, deviceName, deviceType, quantity, importDate]);

    const handleDeviceTypeSelect = (item: DropDownItem) => {
        setDeviceType(item);
    };

    const getFormattedDateText = () => {
        if (!importDate) return 'dd-mm-yyyy';
        // Format as dd-mm-yyyy
        return formatDate(importDate).replace(/\//g, '-');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thông tin chung</Text>

            <View style={styles.formContainer}>
                {/* Device Name */}
                <Input
                    label="Tên thiết bị"
                    placeholder="Input"
                    value={deviceName}
                    onChangeText={setDeviceName}
                    required
                />

                {/* Device Type */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        Loại thiết bị <Text style={styles.required}>*</Text>
                    </Text>
                    <DropDownButtonBasic
                        data={DEVICE_TYPES}
                        value={deviceType}
                        onSelect={handleDeviceTypeSelect}
                        showIcon={false}
                        height={sizes.input.md}
                        borderRadius={borderRadius.md}
                        style={styles.dropdown}
                    />
                </View>

                {/* Row for Quantity and Date */}
                <View style={styles.row}>
                    <View style={[styles.col, { paddingRight: spacing.sm }]}>
                        <Input
                            label="Số lượng (cái)"
                            placeholder="Input"
                            value={quantity}
                            onChangeText={setQuantity}
                            required
                            keyboardType="numeric"
                            containerStyle={{ marginBottom: 0 }}
                        />
                    </View>
                    <View style={[styles.col, { paddingLeft: spacing.sm }]}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                <Text style={styles.required}>* </Text>Ngày nhập kho
                            </Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setIsDatePickerVisible(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.dateText}>{getFormattedDateText()}</Text>
                                <IconCalender width={15} height={15} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Import Condition */}
                <View style={styles.conditionContainer}>
                    <Text style={styles.label}>
                        Tình trạng nhập kho <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.radioGroup}>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setCondition('new')}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.radioCircle,
                                    condition === 'new' && styles.radioCircleSelected,
                                ]}
                            >
                                {condition === 'new' && <View style={styles.radioInnerCircle} />}
                            </View>
                            <Text style={styles.radioLabel}>Mới</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setCondition('used')}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.radioCircle,
                                    condition === 'used' && styles.radioCircleSelected,
                                ]}
                            >
                                {condition === 'used' && <View style={styles.radioInnerCircle} />}
                            </View>
                            <Text style={styles.radioLabel}>Đã sử dụng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <DatePickerModal
                visible={isDatePickerVisible}
                onClose={() => setIsDatePickerVisible(false)}
                date={importDate || new Date()}
                onSelectDate={date => {
                    setImportDate(date);
                    setIsDatePickerVisible(false);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: spacing.md,
        // borderRadius: borderRadius.lg, // Removed border radius
        marginBottom: spacing.sm, // 8px spacing between cards
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.lg,
    },
    formContainer: {
        //
    },
    inputContainer: {
        marginBottom: spacing.lg,
    },
    conditionContainer: {
        marginBottom: spacing.sm,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    required: {
        color: colors.error,
    },
    dropdown: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
    },
    col: {
        flex: 1,
    },
    radioGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xl,
        marginTop: spacing.xs,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    radioCircleSelected: {
        borderColor: colors.primary,
    },
    radioInnerCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    radioLabel: {
        fontSize: typography.fontSize.base,
        color: colors.text,
    },
    inputGroup: {
        marginBottom: 0,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        height: sizes.input.md,
    },
    dateText: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
    },
});
