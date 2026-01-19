import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';
import { MaterialGroupType } from '@/features/material/types/material.types';

interface MaterialGroupProps {
    group: MaterialGroupType;
}

export const MaterialGroup: React.FC<MaterialGroupProps> = ({ group }) => {
    const getStyle = (type: MaterialGroupType) => {
        switch (type) {
            case 'Nuôi':
            case 'Thức ăn':
                return {
                    backgroundColor: colors.volcano[200],
                    color: colors.volcano[900],
                    borderColor: colors.volcano[300],
                };
            case 'Vật tư nội bộ':
                return {
                    backgroundColor: colors.geekblue[100],
                    color: colors.geekblue[900],
                    borderColor: colors.geekblue[300],
                };
            case 'Công cụ':

            case 'CCDC':
                return {
                    backgroundColor: colors.green[50],
                    color: colors.green[600],
                    borderColor: colors.green[300],
                };
            case 'Thiết bị điện':
                return {
                    backgroundColor: colors.magenta[100],
                    color: colors.magenta[900],
                    borderColor: colors.magenta[300],
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
