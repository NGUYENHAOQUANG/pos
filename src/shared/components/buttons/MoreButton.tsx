import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    GestureResponderEvent,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import DotsThree from '@/assets/Icon/DotsThree.svg';

export interface MoreButtonProps {
    onPress?: (event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
    color?: string;
    size?: number;
}

export const MoreButton: React.FC<MoreButtonProps> = ({ onPress, style, color }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const finalColor = color || theme.text;

    return (
        <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.7}>
            <DotsThree width={20} height={20} color={finalColor} />
        </TouchableOpacity>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        button: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: borderRadius.full,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            backgroundColor: theme.background,
        },
    });
