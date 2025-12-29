import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';
import { MaterialGroupType } from '../../types/material.types';

interface MaterialGroupProps {
    group: MaterialGroupType;
}

export const MaterialGroup: React.FC<MaterialGroupProps> = ({ group }) => {
    const getStyle = (type: MaterialGroupType) => {
        switch (type) {
            case 'Nuôi':
            case 'Thức ăn': // Keep for backward compatibility if needed
                return {
                    backgroundColor: colors.volcano[1],
                    color: colors.volcano[6],
                    borderColor: colors.volcano[3],
                };
            case 'Vật tư nội bộ':
                return {
                    backgroundColor: colors.geekblue[1],
                    color: colors.geekblue[6],
                    borderColor: colors.geekblue[3],
                };
            case 'CCDC':
                return {
                    backgroundColor: colors.green[50],
                    color: colors.green[600],
                    borderColor: colors.green[300],
                };
            case 'Thiết bị điện':
                return {
                    backgroundColor: colors.magenta[1],
                    color: colors.magenta[6],
                    borderColor: colors.magenta[3],
                };
            case 'Chi phí khác':
                return {
                    backgroundColor: colors.purple[50],
                    color: colors.purple[600],
                    borderColor: colors.purple[300],
                };
            default:
                return {
                    backgroundColor: colors.gray[100],
                    color: colors.text,
                    borderColor: colors.border,
                };
        }
    };

    const style = getStyle(group);

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: style.backgroundColor, borderColor: style.borderColor },
            ]}
        >
            <Text style={[styles.text, { color: style.color }]}>{group}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 1,
        borderRadius: 4,
        borderWidth: 1,
        alignSelf: 'flex-start', // Wrap content
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 22,
    },
});
