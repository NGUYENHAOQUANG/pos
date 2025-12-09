import React from 'react';
import { Text, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { EControlMode } from '../../types/control.types';

interface ButtonControlModeProps {
    mode: EControlMode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
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

export const ButtonControlMode: React.FC<ButtonControlModeProps> = ({ mode, style, onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <Text style={styles.text}>{getModeLabel(mode)}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 6,
        alignSelf: 'flex-start', // Fit content
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '400',
    },
});
