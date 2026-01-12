import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, borderRadius } from '@/styles';

export type PondType =
    | 'Ao nuôi'
    | 'Ao vèo'
    | 'Ao sẵn sàng'
    | 'Ao lắng'
    | 'Ao thải'
    | 'Ao xử lý'
    | 'Ao chứa nước';

interface PondTypeTagProps {
    type: PondType;
    style?: StyleProp<ViewStyle>;
}

export const PondTypeTag: React.FC<PondTypeTagProps> = ({ type, style }) => {
    const getStyle = () => {
        switch (type) {
            case 'Ao nuôi':
                return styles.blue;
            case 'Ao vèo':
                return styles.orange;
            case 'Ao sẵn sàng':
                return styles.green;
            case 'Ao lắng':
                return styles.purple;
            case 'Ao thải':
                return styles.pink;
            case 'Ao xử lý':
                return styles.yellow;
            case 'Ao chứa nước':
                return styles.cyan;
            default:
                return styles.blue;
        }
    };

    const getTextStyle = () => {
        switch (type) {
            case 'Ao nuôi':
                return styles.textBlue;
            case 'Ao vèo':
                return styles.textOrange;
            case 'Ao sẵn sàng':
                return styles.textGreen;
            case 'Ao lắng':
                return styles.textPurple;
            case 'Ao thải':
                return styles.textPink;
            case 'Ao xử lý':
                return styles.textYellow;
            case 'Ao chứa nước':
                return styles.textCyan;
            default:
                return styles.textBlue;
        }
    };

    return (
        <View style={[styles.container, getStyle(), style]}>
            <Text style={[styles.text, getTextStyle()]}>{type}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        borderRadius: borderRadius.xs,
        borderWidth: 1,
        alignSelf: 'flex-start', // Don't stretch
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 22,
    },
    // Blue - Ao nuôi
    blue: {
        backgroundColor: colors.blue[50], // Lightest
        borderColor: colors.blue[400], // Medium
    },
    textBlue: {
        color: colors.blue[600], // Dark/Primary
    },
    // Orange - Ao vèo
    orange: {
        backgroundColor: colors.orange[50],
        borderColor: colors.orange[200],
    },
    textOrange: {
        color: colors.orange[600],
    },
    // Green - Ao sẵn sàng
    green: {
        backgroundColor: colors.green[50],
        borderColor: colors.green[300],
    },
    textGreen: {
        color: colors.green[600],
    },
    // Purple - Ao lắng
    purple: {
        backgroundColor: colors.purple[50],
        borderColor: colors.purple[300],
    },
    textPurple: {
        color: colors.purple[600],
    },
    // Pink - Ao thải
    pink: {
        backgroundColor: colors.pink[50],
        borderColor: colors.pink[300],
    },
    textPink: {
        color: colors.pink[600],
    },
    // Yellow - Ao xử lý
    yellow: {
        backgroundColor: colors.yellow[50],
        borderColor: colors.yellow[600],
    },
    textYellow: {
        color: colors.yellow[700],
    },
    // Cyan - Ao chứa nước
    cyan: {
        backgroundColor: colors.cyan[50],
        borderColor: colors.cyan[600],
    },
    textCyan: {
        color: colors.cyan[800],
    },
});
