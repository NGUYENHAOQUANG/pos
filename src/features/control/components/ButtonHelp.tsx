import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, borderRadius, shadows } from '@/styles';

interface ButtonHelpProps {
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

export const ButtonHelp: React.FC<ButtonHelpProps> = ({ onPress, style }) => {
    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons name="help-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.sm,
    },
});
