import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles';
import Warning from '@/assets/Icon/Warning.svg';

interface StatusHighlightProps {
    label: string;
    value: string | number;
    unit?: string;
}

export const StatusHighlight: React.FC<StatusHighlightProps> = ({ label, value }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.valueContainer}>
                <Warning width={16} height={16} style={styles.icon} />
                <Text style={styles.value}>{value}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.transparent,
        paddingHorizontal: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.gray[500],
        lineHeight: 22,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.red[500],
        lineHeight: 22,
    },
    icon: {
        marginRight: 8,
    },
});
