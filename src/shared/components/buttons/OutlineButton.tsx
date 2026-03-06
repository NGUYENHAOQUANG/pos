import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, borderRadius } from '@/styles';

interface OutlineButtonProps {
    label: string;
    onPress: () => void;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    disabled?: boolean;
    style?: ViewStyle;
    labelStyle?: TextStyle;
}

export const OutlineButton: React.FC<OutlineButtonProps> = ({
    label,
    onPress,
    prefix,
    suffix,
    disabled,
    style,
    labelStyle,
}) => {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.disabled, style]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled}
        >
            {prefix}
            <Text style={[styles.label, labelStyle]}>{label}</Text>
            {suffix}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width: '100%',
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.full,
        backgroundColor: colors.white,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textSecondary,
    },
    disabled: {
        opacity: 0.5,
    },
});
