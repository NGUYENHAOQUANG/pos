/**
 * @file DeleteButton.tsx
 * @description Reusable delete button component for header actions
 * @created 2025-01-XX
 */
import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import DeleteIcon from '@/assets/Icon/Delete.svg';
import { colors, borderRadius } from '@/styles';

interface DeleteButtonProps {
    /** Callback when button is pressed */
    onPress: () => void;
    /** Custom styles */
    style?: StyleProp<ViewStyle>;
    /** Icon size (default: 20) */
    iconSize?: number;
    /** Active opacity (default: 0.7) */
    activeOpacity?: number;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
    onPress,
    style,
    iconSize = 20,
    activeOpacity = 0.7,
}) => {
    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={onPress}
            activeOpacity={activeOpacity}
        >
            <DeleteIcon width={iconSize} height={iconSize} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
});
