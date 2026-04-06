import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { EControlMode } from '../../types/control.types';
import { borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

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
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);

    return (
        <TouchableOpacity
            style={[themedStyles.container, style]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled || !onPress}
        >
            <Text style={themedStyles.text}>{getModeLabel(mode)}</Text>
        </TouchableOpacity>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            width: 66,
            height: 22,
            paddingVertical: 0,
            paddingHorizontal: 0,
            backgroundColor: theme.backgroundSecondary,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: borderRadius.full,
            alignItems: 'center',
            justifyContent: 'center',
        },
        text: {
            fontSize: 12,
            color: theme.text,
            fontWeight: '500',
        },
    });
