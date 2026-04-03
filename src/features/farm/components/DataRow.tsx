import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { StatusHighlight } from './StatusHighlight';

interface DataRowProps {
    label: string;
    value: string | number;
    unit?: string;
    isWarning?: boolean;
}

export const DataRow: React.FC<DataRowProps> = ({ label, value, unit, isWarning }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

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
                    {value}
                    {unit ? ` ${unit}` : ''}
                </Text>
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
            borderRadius: 4,
        },
        label: {
            fontSize: 14,
            color: theme.gray[500],
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
            color: theme.text,
            textAlign: 'right',
            lineHeight: 22,
        },
    });
