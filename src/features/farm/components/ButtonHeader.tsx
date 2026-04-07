import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

interface ButtonHeaderProps {
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    iconSize?: number;
}

export const ButtonHeader: React.FC<ButtonHeaderProps> = ({ onPress, style, iconSize = 20 }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    return (
        <TouchableOpacity style={[styles.menuButton, style]} onPress={onPress} activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={iconSize} color={theme.text} />
        </TouchableOpacity>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        menuButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
        },
    });
