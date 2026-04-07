import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { borderRadius, shadows } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';

interface ButtonHelpProps {
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

export const ButtonHelp: React.FC<ButtonHelpProps> = ({ onPress, style }) => {
    const theme = useAppTheme();

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.background }, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons name="help-circle-outline" size={24} color={theme.text} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.sm,
    },
});
