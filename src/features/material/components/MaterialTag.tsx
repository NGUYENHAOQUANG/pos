import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, colors } from '@/styles';
import { MaterialGroupType } from '@/features/material/types/material.types';

interface MaterialGroupProps {
    group: MaterialGroupType;
}

export const MaterialGroup: React.FC<MaterialGroupProps> = ({ group }) => {
    const getStyle = (type: MaterialGroupType) => {
        switch (type) {
            case MaterialGroupType.FARMING:
                return {
                    backgroundColor: colors.volcano[200],
                    color: colors.volcano[900],
                    borderColor: colors.volcano[300],
                };
            case MaterialGroupType.FEED:
                return {
                    backgroundColor: colors.volcano[200],
                    color: colors.volcano[900],
                    borderColor: colors.volcano[300],
                };
            case MaterialGroupType.INTERNAL:
                return {
                    backgroundColor: colors.geekblue[100],
                    color: colors.geekblue[900],
                    borderColor: colors.geekblue[300],
                };
            case MaterialGroupType.TOOLS:
                return {
                    backgroundColor: colors.green[50],
                    color: colors.green[600],
                    borderColor: colors.green[300],
                };
            case MaterialGroupType.CCDC:
                return {
                    backgroundColor: colors.green[50],
                    color: colors.green[600],
                    borderColor: colors.green[300],
                };
            case MaterialGroupType.ELECTRIC:
                return {
                    backgroundColor: colors.magenta[100],
                    color: colors.magenta[900],
                    borderColor: colors.magenta[300],
                };
            case MaterialGroupType.OTHER:
                return {
                    backgroundColor: colors.purple[50],
                    color: colors.purple[600],
                    borderColor: colors.purple[300],
                };
            // --- STATUS TAGS ---
            case MaterialGroupType.DRAFT:
                return {
                    backgroundColor: colors.neutral,
                    color: colors.text,
                    borderColor: colors.defaultBorder,
                };
            case MaterialGroupType.PENDING:
                return {
                    backgroundColor: colors.yellow[50],
                    color: colors.status.warningHighlightText,
                    borderColor: colors.yellow[300],
                };
            case MaterialGroupType.COMPLETED:
                return {
                    backgroundColor: colors.green[50],
                    color: colors.green[600],
                    borderColor: colors.green[300],
                };
            case MaterialGroupType.REJECTED:
                return {
                    backgroundColor: colors.errorBackground,
                    color: colors.red[500],
                    borderColor: colors.volcano[400],
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
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
});
