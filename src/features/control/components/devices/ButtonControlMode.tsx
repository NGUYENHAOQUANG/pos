import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { EControlMode } from '../../types/control.types';
import { borderRadius, colors } from '@/styles';

interface ButtonControlModeProps {
    mode: EControlMode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    disabled?: boolean;
}

const getModeLabel = (mode: EControlMode): string => {
    switch (mode) {
        case EControlMode.MANUAL:
            return 'Thủ công';
        case EControlMode.SCHEDULE:
            return 'Lịch trình';
        case EControlMode.LOCAL:
            return 'Tại chỗ';
        default:
            return '';
    }
};

export const ButtonControlMode: React.FC<ButtonControlModeProps> = ({
    mode,
    style,
    onPress,
    disabled,
}) => {
    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled || !onPress}
        >
            <Text style={styles.text}>{getModeLabel(mode)}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 66,
        height: 22,
        paddingVertical: 0, // Remove padding for fixed height
        paddingHorizontal: 0, // Remove padding for fixed width
        backgroundColor: colors.gray[50],
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.full,
        // alignSelf: 'flex-start', // Removed to allow parent control
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 12,
        color: colors.text,
        fontWeight: '500',
    },
});
