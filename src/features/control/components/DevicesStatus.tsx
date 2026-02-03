import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles';

interface StatusItemProps {
    label: string;
    value: number;
    valueColor: string;
    backgroundColor: string;
}

const StatusItem: React.FC<StatusItemProps> = ({ label, value, valueColor, backgroundColor }) => (
    <View style={[styles.itemContainer, { backgroundColor }]}>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
    </View>
);

interface DevicesStatusProps {
    totalPonds?: number;
    activePonds?: number;
    warningPonds?: number;
    otherPonds?: number;
}

export const DevicesStatus: React.FC<DevicesStatusProps> = ({
    totalPonds = 0,
    activePonds = 0,
    warningPonds = 0,
    otherPonds = 0,
}) => {
    return (
        <View style={styles.container}>
            <StatusItem
                label="Tổng ao"
                value={totalPonds}
                valueColor={colors.status.totalText}
                backgroundColor={colors.status.totalBg}
            />
            <View style={styles.spacer} />
            <StatusItem
                label="Hoạt động"
                value={activePonds}
                valueColor={colors.status.activeText}
                backgroundColor={colors.status.activeBg}
            />
            <View style={styles.spacer} />
            <StatusItem
                label="Nguy cơ"
                value={warningPonds}
                valueColor={colors.status.warningText}
                backgroundColor={colors.status.warningBg}
            />
            <View style={styles.spacer} />
            <StatusItem
                label="Khác"
                value={otherPonds}
                valueColor={colors.status.otherText}
                backgroundColor={colors.status.otherBg}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    itemContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    spacer: {
        width: 8,
    },
    value: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '400',
    },
});
