import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles';
import { StatusHighlight } from './StatusHighlight';

interface DataRowProps {
    label: string;
    value: string | number;
    unit?: string;
    isWarning?: boolean;
}

export const DataRow: React.FC<DataRowProps> = ({ label, value, unit, isWarning }) => {
    if (isWarning) {
        return <StatusHighlight label={label} value={value} unit={unit} />;
    }

    return (
        <View style={styles.container}>
            {/* Label bên trái */}
            <Text style={styles.label}>{label}</Text>

            {/* Value bên phải */}
            <View style={styles.valueWrapper}>
                <Text style={styles.value}>
                    {value} {unit}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    label: {
        fontSize: 14,
        color: colors.gray[500],
        flex: 1,
        marginRight: 12,
    },
    valueWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        maxWidth: '50%',
        justifyContent: 'flex-end',
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        textAlign: 'right',
        lineHeight: 22,
    },
});
