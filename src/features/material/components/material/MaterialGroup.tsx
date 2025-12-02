import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '@/styles';

export type MaterialGroupType = 'Thức ăn' | 'Thuốc trộn' | 'Xử lý môi trường' | 'Dùng chung' | string;

interface MaterialGroupProps {
    group: MaterialGroupType;
}

export const MaterialGroup: React.FC<MaterialGroupProps> = ({ group }) => {
    const getStyle = (type: MaterialGroupType) => {
        switch (type) {
            case 'Thức ăn':
                return {
                    backgroundColor: '#FFF2E8', // Light orange
                    color: '#FA541C', // Dark orange
                    borderColor: '#FFBB96',
                };
            case 'Thuốc trộn':
                return {
                    backgroundColor: '#E6F7FF', // Light blue
                    color: '#1890FF', // Dark blue
                    borderColor: '#91D5FF',
                };
            case 'Xử lý môi trường':
                return {
                    backgroundColor: '#F6FFED', // Light green
                    color: '#52C41A', // Dark green
                    borderColor: '#B7EB8F',
                };
            case 'Dùng chung':
                return {
                    backgroundColor: '#FFF0F6', // Light pink
                    color: '#EB2F96', // Dark pink
                    borderColor: '#FFADD2',
                };
            default:
                return {
                    backgroundColor: '#F5F5F5',
                    color: colors.text,
                    borderColor: colors.border,
                };
        }
    };

    const style = getStyle(group);

    return (
        <View style={[styles.container, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}>
            <Text style={[styles.text, { color: style.color }]}>{group}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        alignSelf: 'flex-start', // Wrap content
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 12,
        fontWeight: '400',
    },
});
