import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles';
import { ButtonDevices } from '@/features/control/components/devices/ButtonDevices';
import { Input, InputFormat } from '@/shared/components/forms/Input';
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
            <Input
                label="Tên"
                required
                value={name}
                onChangeText={onNameChange}
                placeholder="Nhập tên thông số"
                containerStyle={styles.inputGroup}
                editable={false}
            />

            {/* Lower Limit */}
            <Input
                label="Giới hạn dưới"
                required
                value={lowerLimit}
                onChangeText={onLowerLimitChange}
                inputFormat={InputFormat.DECIMAL}
                placeholder="Nhập giới hạn dưới"
                containerStyle={styles.inputGroup}
            />

            {/* Upper Limit */}
            <Input
                label="Giới hạn trên"
                required
                value={upperLimit}
                onChangeText={onUpperLimitChange}
                inputFormat={InputFormat.DECIMAL}
                placeholder="Nhập giới hạn trên"
                containerStyle={styles.inputGroup}
            />

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
        marginBottom: 0,
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
