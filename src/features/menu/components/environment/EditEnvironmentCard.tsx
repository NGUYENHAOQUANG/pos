import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
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
    const theme = useAppTheme();
    const styles = getStyles(theme);

    /**
     * Filter and format limit input value:
     * - Max 10 digits total (integer + decimal combined)
     * - Max 5 decimal places
     * - Comma as decimal separator (display), dot internally
     * - Non-negative only (>= 0)
     */
    const filterLimitInput = (text: string): string => {
        // Convert comma to dot for internal processing
        let value = text.replace(/,/g, '.');
        // Strip everything except digits and dot
        value = value.replace(/[^0-9.]/g, '');
        // Remove leading dots
        value = value.replace(/^\.+/, '');

        // Keep only first decimal point
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }

        const finalParts = value.split('.');
        let intPart = finalParts[0];
        let decPart = finalParts.length > 1 ? finalParts[1] : '';

        // Limit decimal places to 5
        decPart = decPart.slice(0, 5);

        // Enforce max 10 total digits (integer + decimal)
        const totalDigits = intPart.length + decPart.length;
        if (totalDigits > 10) {
            const allowedDecDigits = Math.max(0, 10 - intPart.length);
            decPart = decPart.slice(0, allowedDecDigits);
            if (intPart.length > 10) {
                intPart = intPart.slice(0, 10);
            }
        }

        return finalParts.length > 1 ? intPart + '.' + decPart : intPart;
    };

    const handleLowerLimitChange = (text: string) => {
        onLowerLimitChange(filterLimitInput(text));
    };

    const handleUpperLimitChange = (text: string) => {
        onUpperLimitChange(filterLimitInput(text));
    };

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
                value={lowerLimit.replace(/\./g, ',')}
                onChangeText={handleLowerLimitChange}
                inputFormat={InputFormat.TEXT}
                placeholder="Nhập giới hạn dưới"
                containerStyle={styles.inputGroup}
            />

            {/* Upper Limit */}
            <Input
                label="Giới hạn trên"
                required
                value={upperLimit.replace(/\./g, ',')}
                onChangeText={handleUpperLimitChange}
                inputFormat={InputFormat.TEXT}
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
                            color={theme.primaryOrange}
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
                            trackColor={theme.primaryOrange}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            padding: 16,
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.borderLight,
            gap: 16,
        },
        inputGroup: {
            marginBottom: 0,
        },
        // Alert styles
        alertCard: {
            borderWidth: 1,
            borderColor: theme.defaultBorder,
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
            color: theme.text,
            marginBottom: 4,
            lineHeight: 20,
        },
        alertDescription: {
            fontSize: 14,
            color: theme.textSecondary,
            lineHeight: 20,
            fontWeight: '400',
        },
        alertAction: {
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
    });
