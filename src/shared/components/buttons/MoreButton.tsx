import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    GestureResponderEvent,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { colors, borderRadius } from '@/styles';
import DotsThree from '@/assets/Icon/DotsThree.svg';

export interface MoreButtonProps {
    onPress?: (event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
    color?: string;
    size?: number;
}

export const MoreButton: React.FC<MoreButtonProps> = ({ onPress, style, color = colors.text }) => {
    return (
        <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.7}>
            <DotsThree width={20} height={20} color={color} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
});
