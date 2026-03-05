import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import CheckboxIcon from '@/assets/Icon/Checkbox.svg';
import CheckboxActiveIcon from '@/assets/Icon/CheckboxActive.svg';

interface EquipmentMaintenanceProps {
    date: Date;
    onDateChange: (date: Date) => void;
    description: string;
    onDescriptionChange: (text: string) => void;
    resetTime: boolean;
    onResetTimeChange: (val: boolean) => void;
}

export const EquipmentMaintenance: React.FC<EquipmentMaintenanceProps> = ({
    date,
    onDateChange,
    description,
    onDescriptionChange,
    resetTime,
    onResetTimeChange,
}) => {
    return (
        <View style={styles.container}>
            <DateInputButton label="Thời gian thực hiện" date={date} onDateChange={onDateChange} />

            {/* Description */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    <Text style={styles.required}>* </Text>
                    Mô tả công việc
                </Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Nhập mô tả"
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    textAlignVertical="top"
                    value={description}
                    onChangeText={onDescriptionChange}
                />
            </View>

            {/* Reset Maintenance */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    <Text style={styles.required}>* </Text>
                    Đặt lại thời gian bảo trì
                </Text>
                <View style={styles.radioGroup}>
                    <TouchableOpacity
                        style={styles.radioItem}
                        onPress={() => onResetTimeChange(true)}
                        activeOpacity={0.7}
                    >
                        {resetTime ? (
                            <CheckboxActiveIcon width={24} height={24} />
                        ) : (
                            <CheckboxIcon width={24} height={24} />
                        )}
                        <Text style={styles.radioLabel}>Có</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.radioItem}
                        onPress={() => onResetTimeChange(false)}
                        activeOpacity={0.7}
                    >
                        {!resetTime ? (
                            <CheckboxActiveIcon width={24} height={24} />
                        ) : (
                            <CheckboxIcon width={24} height={24} />
                        )}
                        <Text style={styles.radioLabel}>Không</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: spacing.md,
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputGroup: {
        gap: spacing.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
    },
    required: {
        color: colors.error,
    },
    textArea: {
        height: 80,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        padding: spacing.sm,
        paddingTop: spacing.sm, // Ensure text starts at top
        backgroundColor: colors.white,
        color: colors.text,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: spacing.xl,
        marginTop: spacing.xs,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    radioLabel: {
        fontSize: 14,
        color: colors.text,
    },
});
