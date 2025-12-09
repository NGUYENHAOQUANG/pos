import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
                valueColor="#2F6BFF"
                backgroundColor="#F0F6FF"
            />
            <View style={styles.spacer} />
            <StatusItem
                label="Hoạt động"
                value={activePonds}
                valueColor="#2E7D32"
                backgroundColor="#F1F8E9"
            />
            <View style={styles.spacer} />
            <StatusItem
                label="Nguy cơ"
                value={warningPonds}
                valueColor="#D32F2F"
                backgroundColor="#FFEBEE"
            />
            <View style={styles.spacer} />
            <StatusItem
                label="Khác"
                value={otherPonds}
                valueColor="#1F2937"
                backgroundColor="#F9FAFB"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
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
        color: '#6B7280',
        fontWeight: '400',
    },
});
