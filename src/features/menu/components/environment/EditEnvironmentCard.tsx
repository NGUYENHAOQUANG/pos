import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
// import { ButtonDevices } from '@/features/control/components/devices/ButtonDevices';
// import WarningIcon from '@/assets/Icon/IconFarm/Warning.svg';

interface EditEnvironmentCardProps {
    name: string;
    lowerLimit: string;
    upperLimit: string;
    // isAlertEnabled: boolean;
    onNameChange: (text: string) => void;
    onLowerLimitChange: (text: string) => void;
    onUpperLimitChange: (text: string) => void;
    // onAlertToggle: (enabled: boolean) => void;
}

export const EditEnvironmentCard: React.FC<EditEnvironmentCardProps> = ({
    name,
    lowerLimit,
    upperLimit,
    // isAlertEnabled,
    onNameChange,
    onLowerLimitChange,
    onUpperLimitChange,
    // onAlertToggle,
}) => {
    return (
        <View style={styles.container}>
            {/* Parameter Name */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    <Text style={styles.required}>* </Text>
                    Tên thông số
                </Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={onNameChange}
                    placeholder="Nhập tên thông số"
                    placeholderTextColor={colors.textSecondary}
                />
            </View>

            {/* Limits Row */}
            <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1, { marginRight: spacing.sm }]}>
                    <Text style={styles.label}>
                        <Text style={styles.required}>* </Text>
                        Giới hạn dưới
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={lowerLimit}
                        onChangeText={onLowerLimitChange}
                        keyboardType="numeric"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                <View style={[styles.inputGroup, styles.flex1, { marginLeft: spacing.sm }]}>
                    <Text style={styles.label}>
                        <Text style={styles.required}>* </Text>
                        Giới hạn trên
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={upperLimit}
                        onChangeText={onUpperLimitChange}
                        keyboardType="numeric"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>
            </View>

            {/* Alert Config Card - Hidden per user request */}
            {/* <View style={styles.alertCard}>
                <View style={styles.alertHeader}>
                    <View style={styles.alertTitleWrapper}>
                        <View style={styles.iconWrapper}>
                            <WarningIcon width={24} height={24} />
                        </View>
                        <Text style={styles.alertTitle}>Bật cảnh báo</Text>
                    </View>
                    <ButtonDevices value={isAlertEnabled} onValueChange={onAlertToggle} />
                </View>

                <View style={styles.divider} />

                <Text style={styles.alertDescription}>
                    Hệ thống sẽ cảnh báo khi kết quả đo nằm ngoài khoảng giới hạn đã thiết lập.
                </Text>
            </View> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
        backgroundColor: colors.white,
        borderRadius: 0,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    flex1: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: spacing.xs,
        fontWeight: '400',
    },
    required: {
        color: colors.red[600],
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        fontSize: 14,
        color: colors.text,
        backgroundColor: colors.white,
    },
    // Alert styles - Hidden per user request
    // alertCard: {
    //     borderWidth: 1,
    //     borderColor: colors.border,
    //     borderRadius: borderRadius.md,
    //     overflow: 'hidden',
    // },
    // alertHeader: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'space-between',
    //     padding: spacing.md,
    // },
    // alertTitleWrapper: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    // },
    // iconWrapper: {
    //     width: 32,
    //     height: 32,
    //     borderRadius: 16,
    //     backgroundColor: colors.yellow[50],
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     marginRight: spacing.sm,
    // },
    // alertTitle: {
    //     fontSize: 14,
    //     fontWeight: '600',
    //     color: colors.text,
    // },
    // divider: {
    //     height: 1,
    //     backgroundColor: colors.borderLight,
    // },
    // alertDescription: {
    //     padding: spacing.md,
    //     fontSize: 14,
    //     color: colors.textSecondary,
    //     lineHeight: 20,
    // },
});
