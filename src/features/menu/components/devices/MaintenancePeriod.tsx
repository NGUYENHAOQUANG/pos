import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import { Input } from '@/shared/components/forms/Input';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { handleIntegerInput } from '@/shared/utils/validation';

interface MaintenancePeriodProps {
    onDataChange?: (data: MaintenancePeriodData) => void;
    triggerValidation?: boolean; // Use this to trigger validation from parent if needed
    initialData?: Partial<MaintenancePeriodData>;
}

export interface MaintenancePeriodData {
    operatingTime: string;
    usageTime: string;
    isValid: boolean;
}

export const MaintenancePeriod: React.FC<MaintenancePeriodProps> = ({
    onDataChange,
    triggerValidation,
    initialData,
}) => {
    const [operatingTime, setOperatingTime] = useState(initialData?.operatingTime || '');
    const [usageTime, setUsageTime] = useState(initialData?.usageTime || '');

    // Validate and notify parent
    useEffect(() => {
        const valid = operatingTime.trim() !== '' && usageTime.trim() !== '';

        onDataChange?.({
            operatingTime,
            usageTime,
            isValid: valid,
        });
    }, [operatingTime, usageTime, onDataChange]);

    // Handle external validation trigger (if parent presses Save)
    useEffect(() => {
        if (triggerValidation) {
            if (!operatingTime.trim()) {
                Toast.show(ToastMessages.Device.OPERATING_TIME_REQUIRED);
            }
            if (!usageTime.trim()) {
                Toast.show(ToastMessages.Device.USAGE_TIME_REQUIRED);
            }
        }
    }, [triggerValidation, operatingTime, usageTime]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thời hạn bảo trì</Text>

            {/* Operating Time */}
            <Input
                label="Thời gian hoạt động (giờ)"
                placeholder="vd: 24 giờ"
                value={operatingTime}
                onChangeText={text => setOperatingTime(handleIntegerInput(text))}
                required
                keyboardType="numeric"
            />

            {/* Usage Time */}
            <Input
                label="Thời gian sử dụng từ ngày lắp (ngày)"
                placeholder="vd: 30 ngày"
                value={usageTime}
                onChangeText={text => setUsageTime(handleIntegerInput(text))}
                required
                keyboardType="numeric"
                containerStyle={{ marginBottom: 0 }} // Last item
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: spacing.md,
        // borderRadius: borderRadius.lg, // Removed border radius
        // marginTop: spacing.md, // Already separated by marginBottom in previous component or natural flow
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
});
