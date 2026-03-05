import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/styles';
import { Input } from '@/shared/components/forms/Input';
import CheckboxIcon from '@/assets/Icon/Checkbox.svg';
import CheckboxActiveIcon from '@/assets/Icon/CheckboxActive.svg';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { handleIntegerInput } from '@/shared/utils/validation';

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
    { id: '1', label: 'Máy cho ăn' },
    { id: '2', label: 'Xiphong' },
    { id: '3', label: 'Máy thổi khí' },
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
                Toast.show(ToastMessages.Device.NAME_REQUIRED);
            }
            if (deviceType.id === '0') {
                Toast.show(ToastMessages.Device.TYPE_REQUIRED);
            }
            if (!quantity.trim()) {
                Toast.show(ToastMessages.Device.QUANTITY_REQUIRED);
            }
            if (!importDate) {
                Toast.show(ToastMessages.Device.IMPORT_DATE_REQUIRED);
            }
        }
    }, [triggerValidation, deviceName, deviceType, quantity, importDate]);

    const handleDeviceTypeSelect = (item: DropDownItem) => {
        setDeviceType(item);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thông tin chung</Text>

            <View style={styles.formContainer}>
                {/* Device Name */}
                <Input
                    label="Tên thiết bị"
                    placeholder="Nhập"
                    value={deviceName}
                    onChangeText={setDeviceName}
                    required
                />

                {/* Device Type */}
                <View style={styles.inputContainer}>
                    {/* Label row with required dot inline */}
                    <View style={styles.labelRow}>
                        <Text style={[styles.label, { marginBottom: 0 }]}>Loại thiết bị</Text>
                        <View style={styles.requiredDot} />
                    </View>
                    <DropDownButtonBasic
                        data={DEVICE_TYPES}
                        value={deviceType.id === '0' ? undefined : deviceType}
                        onSelect={handleDeviceTypeSelect}
                        showIcon={false}
                        borderRadius={borderRadius.sm}
                        style={styles.dropdown}
                        placeholder="Chọn loại thiết bị"
                    />
                </View>

                {/* Row for Quantity and Date - stacked vertically */}
                <Input
                    label="Số lượng"
                    placeholder="Số lượng"
                    value={quantity}
                    onChangeText={text => setQuantity(handleIntegerInput(text))}
                    required
                    keyboardType="numeric"
                    suffix="cái"
                />

                <DateInputButton
                    label="Ngày nhập kho"
                    required
                    date={importDate}
                    onDateChange={setImportDate}
                    dateOnly
                    dateText={importDate ? undefined : 'dd/mm/yyyy'}
                    height={40}
                />

                {/* Import Condition */}
                <View style={styles.conditionContainer}>
                    {/* Label row with required dot inline */}
                    <View style={styles.labelRow}>
                        <Text style={[styles.label, { marginBottom: 0 }]}>Tình trạng nhập kho</Text>
                        <View style={styles.requiredDot} />
                    </View>
                    <View style={styles.radioGroup}>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setCondition('new')}
                            activeOpacity={0.7}
                        >
                            {/* Show active or inactive checkbox based on selection */}
                            {condition === 'new' ? (
                                <CheckboxActiveIcon width={24} height={24} />
                            ) : (
                                <CheckboxIcon width={24} height={24} />
                            )}
                            <Text style={styles.radioLabel}>Mới</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setCondition('used')}
                            activeOpacity={0.7}
                        >
                            {/* Show active or inactive checkbox based on selection */}
                            {condition === 'used' ? (
                                <CheckboxActiveIcon width={24} height={24} />
                            ) : (
                                <CheckboxIcon width={24} height={24} />
                            )}
                            <Text style={styles.radioLabel}>Đã sử dụng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
        paddingBottom: spacing.sm,
        marginHorizontal: -spacing.md,
        paddingHorizontal: spacing.md,
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
        fontWeight: '400',
        color: colors.text,
        marginBottom: spacing.sm,
        lineHeight: 22,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    required: {
        color: colors.error,
    },
    requiredDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.error,
        marginLeft: 4,
        marginBottom: 2,
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
        gap: spacing.sm,
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
    }, // Removed unused date styles
});
