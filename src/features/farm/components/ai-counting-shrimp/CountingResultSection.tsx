import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';
import { Input } from '@/shared/components/forms/Input';

export interface CountingResultSectionProps {
    result: string;
    previousTotal: number;
}

export const CountingResultSection: React.FC<CountingResultSectionProps> = ({
    result,
    previousTotal,
}) => (
    <View style={styles.section}>
        <Text style={styles.label}>
            <Text style={styles.required}>* </Text>Tổng số lượng thả (PLs) - AI
        </Text>
        <Input
            placeholder="0"
            value={result}
            editable={false}
            inputContainerStyle={styles.resultInput}
        />
        <Text style={styles.helperText}>Lần đếm trước: {previousTotal}</Text>
    </View>
);

const styles = StyleSheet.create({
    section: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: spacing.xs,
        fontWeight: '400',
    },
    required: {
        color: colors.red[500],
    },
    resultInput: {
        backgroundColor: colors.white,
    },
    helperText: {
        fontSize: 14,
        color: colors.text,
        marginTop: spacing.xs,
    },
});
