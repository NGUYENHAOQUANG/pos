import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { colors, spacing } from '@/styles';
import { ButtonDevices } from '@/features/control/components/devices/ButtonDevices';
import { RequiredDot } from '@/shared/components/forms/Input';
import WarningCircle from '@/assets/Icon/IconMenu/WarningCircle.svg';

interface EditEnvironmentCardProps {
    name: string;
    lowerLimit: string;
    upperLimit: string;
    isAlertEnabled: boolean;
    onNameChange: (text: string) => void;
    onLowerLimitChange: (text: string) => void;
    onUpperLimitChange: (text: string) => void;
    onAlertToggle: (enabled: boolean) => void;
}

export const EditEnvironmentCard: React.FC<EditEnvironmentCardProps> = ({
    name,
    lowerLimit,
    upperLimit,
    isAlertEnabled,
    onNameChange,
    onLowerLimitChange,
    onUpperLimitChange,
    onAlertToggle,
}) => {
    return (
        <View style={styles.container}>
            {/* Parameter Name */}
            <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Tên</Text>
                    <RequiredDot />
                </View>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={onNameChange}
                    placeholder="Nhập tên thông số"
                    placeholderTextColor={colors.textSecondary}
                />
            </View>

            {/* Lower Limit Row -> Vertical */}
            <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Giới hạn dưới</Text>
                    <RequiredDot />
                </View>
                <TextInput
                    style={styles.input}
                    value={lowerLimit}
                    onChangeText={onLowerLimitChange}
                    keyboardType="default"
                    placeholderTextColor={colors.textSecondary}
                />
            </View>

            {/* Upper Limit Row -> Vertical */}
            <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>Giới hạn trên</Text>
                    <RequiredDot />
                </View>
                <TextInput
                    style={styles.input}
                    value={upperLimit}
                    onChangeText={onUpperLimitChange}
                    keyboardType="default"
                    placeholderTextColor={colors.textSecondary}
                />
            </View>

            {/* Alert Config Card */}
            <View style={styles.alertCard}>
                <View style={styles.alertContentRow}>
                    <View style={styles.alertTextContent}>
                        <WarningCircle
                            width={20}
                            height={20}
                            color={colors.primaryOrange}
                            style={{ marginBottom: 8 }}
                        />
                        <Text style={styles.alertTitle}>Bật cảnh báo</Text>
                        <Text style={styles.alertDescription}>
                            Hệ thống sẽ cảnh báo khi kết quả đo nằm ngoài khoảng giới hạn đã thiết
                            lập.
                        </Text>
                    </View>
                    <View style={styles.alertAction}>
                        <ButtonDevices
                            value={isAlertEnabled}
                            onValueChange={onAlertToggle}
                            trackColor={colors.primaryOrange}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderLight,
        gap: 16,
    },
    inputGroup: {
        // gap: 6 managed by marginBottom if gap isn't fully supported, but using gap usually works in RN >= 0.71.
        gap: 6,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        color: colors.gray[950],
        fontWeight: '500',
        lineHeight: 20,
    },
    required: {
        color: colors.red[600],
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 20,
        color: colors.gray[950],
        backgroundColor: colors.white,
    },
    // Alert styles
    alertCard: {
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: 8,
        padding: 16,
    },
    alertContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    alertTextContent: {
        flex: 1,
        marginRight: 16,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.gray[950],
        marginBottom: 4,
        lineHeight: 20,
    },
    alertDescription: {
        fontSize: 14,
        color: colors.gray[600],
        lineHeight: 20,
        fontWeight: '400',
    },
    alertAction: {
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
});
