import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, borderRadius } from '@/styles';
import { PondType, POND_TYPES } from '@/features/farm/types/farm.types';

interface PondTypeTagProps {
    type: PondType | string;
    style?: StyleProp<ViewStyle>;
}

// Helper to safely get the string value for comparison
const getTypeValue = (type: PondType | string | undefined | null): string => {
    if (!type) return '';
    if (typeof type === 'string') return type;
    return type.name || ''; // Use name for comparison against POND_TYPES values (which are names)
};

export const PondTypeTag: React.FC<PondTypeTagProps> = ({ type, style }) => {
    const typeValue = getTypeValue(type);

    const getStyle = () => {
        switch (typeValue) {
            case POND_TYPES.CULTIVATION:
                return styles.blue;
            case POND_TYPES.NURSERY:
                return styles.orange;
            case POND_TYPES.READY:
                return styles.green;
            case POND_TYPES.SETTLING:
                return styles.purple;
            case POND_TYPES.WASTE:
                return styles.pink;
            case POND_TYPES.TREATMENT:
                return styles.yellow;
            case POND_TYPES.WATER_STORAGE:
                return styles.cyan;
            default:
                return styles.blue;
        }
    };

    const getTextStyle = () => {
        switch (typeValue) {
            case POND_TYPES.CULTIVATION:
                return styles.textBlue;
            case POND_TYPES.NURSERY:
                return styles.textOrange;
            case POND_TYPES.READY:
                return styles.textGreen;
            case POND_TYPES.SETTLING:
                return styles.textPurple;
            case POND_TYPES.WASTE:
                return styles.textPink;
            case POND_TYPES.TREATMENT:
                return styles.textYellow;
            case POND_TYPES.WATER_STORAGE:
                return styles.textCyan;
            default:
                return styles.textBlue;
        }
    };

    return (
        <View style={[styles.container, getStyle(), style]}>
            <Text style={[styles.text, getTextStyle()]}>{typeValue}</Text>
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
